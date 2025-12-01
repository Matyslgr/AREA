import { prisma } from '../lib/prisma';
import { serviceManager } from '../services/service.manager';

export class AreaEngine {
  async checkTriggers() {
    console.log(`[Engine] 🕵️‍♂️ Checking active AREAs at ${new Date().toISOString()}...`);

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

  private async processArea(area: any) {
    if (!area.action || !area.action.name)
      return;


    try {
      // 1. Find the Service and Action definition in the Registry
      const service = serviceManager.getAllServices().find(s =>
        s.actions.find(a => a.id === area.action.name)
      );

      if (!service) {
        console.warn(`[Engine] Service not found for action ${area.action.name}`);
        return;
      }

      const actionDef = service.actions.find(a => a.id === area.action.name);
      if (!actionDef) return;

      // 2. Execute the Check (Trigger)
      // We use the state stored in the ACTION table (previous_state)
      const previousState = area.action.state || null;

      // Call the action check function
      // triggerData contains the context (e.g. { author: "Matys", title: "Bug" })
      const triggerData = await actionDef.check(area.user, area.action.parameters, previousState);

      // 3. If triggerData is null, nothing happened. Stop here.
      if (!triggerData) return;

      console.log(`[Engine] ⚡ Triggered: ${area.name}`);

      // 4. Execute Reactions
      for (const reactionDb of area.reactions) {
        // Find reaction definition
        const reactService = serviceManager.getAllServices().find(s =>
            s.reactions.find(r => r.id === reactionDb.name)
        );
        const reactionDef = reactService?.reactions.find(r => r.id === reactionDb.name);

        if (reactionDef) {
          try {
            // --- DATA INTERPOLATION START ---
            // Create a copy of parameters to avoid mutating the DB object
            // We interpret parameters as a Record<string, any>
            const dynamicParams = { ...(reactionDb.parameters as Record<string, any>) };

            // Loop through each parameter to replace {{variables}}
            for (const key in dynamicParams) {
              if (typeof dynamicParams[key] === 'string') {
                dynamicParams[key] = this.interpolate(dynamicParams[key], triggerData);
              }
            }
            // --- DATA INTERPOLATION END ---

            await reactionDef.execute(area.user, dynamicParams, triggerData);
            console.log(`   └─ ✅ Reaction executed: ${reactionDef.name}`);
            console.log(`       └─ Params:`, dynamicParams);
          } catch (err) {
            console.error(`   └─ ❌ Reaction failed: ${reactionDef.name}`, err);
          }
        }
      }

      // 6. Sauvegarder le nouvel état pour la prochaine fois
      // C'est CRUCIAL pour ne pas spammer
      await prisma.action.update({
        where: { id: area.action.id },
        data: { state: triggerData }
      });

    } catch (error) {
      console.error(`[Engine] Error processing AREA ${area.id}:`, error);
    }
  }

  /**
   * Helper to replace {{variable}} with actual values from data
   */
  private interpolate(text: string, data: any): string {
    if (!data) return text;

    // Regex to find {{ word }} patterns
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