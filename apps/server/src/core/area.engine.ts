import { prisma } from '../lib/prisma';
import { serviceManager } from '../services/service.manager';

export class AreaEngine {
  async checkTriggers() {

    const areas = await prisma.area.findMany({
      where: { is_active: true },
      include: {
        action: true,
        reactions: true,
        user: { include: { accounts: true } }
      }
    });

    await Promise.all(areas.map((area) => this.processArea(area)));
  }

  async processArea(area: any) {
    if (!area.action || !area.action.name)
      return;

    try {
      const service = serviceManager.getAllServices().find(s =>
        s.actions.find(a => a.id === area.action.name)
      );

      if (!service) {
        console.warn(`[Engine] Service not found for action ${area.action.name}`);
        return;
      }

      const actionDef = service.actions.find(a => a.id === area.action.name);
      if (!actionDef) return;

      const previousState = area.action.state || null;

      const result = await actionDef.check(area.user, area.action.parameters, previousState);

      if (!result) return;

      // Save new state if provided
      if (result.save) {
        await prisma.action.update({
          where: { id: area.action.id },
          data: { state: result.save }
        });
      }

      // If no data returned, skip reactions
      if (!result.data) return;

      console.log(`[Engine] ⚡ Triggered: ${area.name}`);
      const triggerData = result.data;
      let hasError = false;

      for (const reactionDb of area.reactions) {
        const reactService = serviceManager.getAllServices().find(s =>
            s.reactions.find(r => r.id === reactionDb.name)
        );
        const reactionDef = reactService?.reactions.find(r => r.id === reactionDb.name);

        if (reactionDef) {
          try {
            // --- DATA INTERPOLATION START ---
            const dynamicParams = { ...(reactionDb.parameters as Record<string, any>) };

            Object.keys(dynamicParams).forEach((key) => {
            // Loop through each parameter to replace {{variables}}
              if (typeof dynamicParams[key] === 'string') {
                dynamicParams[key] = this.interpolate(dynamicParams[key], triggerData);
              }
            });
            // --- DATA INTERPOLATION END ---

            await reactionDef.execute(area.user, dynamicParams, triggerData);
            console.log(`   └─ ✅ Reaction executed: ${reactionDef.name}`);
            console.log(`       └─ Params:`, dynamicParams);
          } catch (err: any) {
            console.error(`   └─ ❌ Reaction failed: ${reactionDef.name}`, err);
            hasError = true;

            await prisma.area.update({
              where: { id: area.id },
              data: { error_log: `Reaction ${reactionDef.name} failed: ${err.message}` }
            });
          }
        }
      }

      if (!hasError) {
        await prisma.area.update({
          where: { id: area.id },
          data: {
            last_executed_at: new Date(),
            error_log: null
          }
        });
      }
    } catch (error: any) {
      console.error(`[Engine] Error processing AREA ${area.id}:`, error);
      await prisma.area.update({
        where: { id: area.id },
        data: { error_log: `Engine Error: ${error.message}` }
      });
    }
  }

  /**
   * Helper to replace {{variable}} with actual values from data
   */
  private interpolate(text: string, data: any): string {
    if (!data) return text;

    return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      const value = data[trimmedKey];

      // If data exists, return it as string, otherwise keep the {{placeholder}}
      return value !== undefined && value !== null ? String(value) : match;
    });
  }

  /**
   * Start the polling loop to check triggers periodically.
   * @param intervalMs Interval in milliseconds (default: 10s for testing, 60s+ for production)
   */
  start(intervalMs: number = 10000) {
    console.log(`[Engine] 🚀 Started polling every ${intervalMs / 1000}s`);
    setInterval(() => this.checkTriggers(), intervalMs);
  }
}

export const areaEngine = new AreaEngine();