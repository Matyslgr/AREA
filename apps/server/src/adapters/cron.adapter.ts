const cronLib = require('cron-parser');

const CronExpression = cronLib.CronExpression || cronLib.default?.CronExpression;

export class CronAdapter {
  /**
   * Validates if a string is a valid CRON expression.
   */
  static isValid(expression: string): boolean {
    try {
      if (!CronExpression) return false;

      new CronExpression(expression, {});

      return true;
    } catch (err) {
      console.error(`[CronAdapter] Validation error:`, err);
      return false;
    }
  }

  /**
   * Returns the next scheduled date relative to a start date.
   */
  static getNextDate(expression: string, fromDate: Date): Date | null {
    try {
      if (!CronExpression) return null;

      const interval = new CronExpression(expression, {
        currentDate: fromDate,
        iterator: true
      });

      if (!interval.hasNext()) return null;

      const next = interval.next();
      return next.value.toDate();
    } catch (error) {
      console.error('[CronAdapter] Execution error:', error);
      return null;
    }
  }
}
