const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class MiscGroup extends BaseAction {
  async eval(context) {
    const t0 = performance.now();

    try {
      let { apiCalls, actionReports, contextWrites } = await this.children.eval(context);
      return {
        contextWrites,
        apiCalls,
        actionReports,
      };
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Misc.group",
            success: false,
            shortSummary: e.message,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { MiscGroup };
