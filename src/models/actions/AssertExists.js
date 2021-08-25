const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class AssertExists extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let value;
    try {
      value = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Assert.exists",
            success: false,
            shortSummary: `Key ${this.parameters.expression} does not exist`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
    if (value != undefined && value != null) {
      return {
        actionReports: [
          {
            action: "Assert.exists",
            success: true,
            shortSummary: `Key ${this.parameters.expression} exists with value "${value}"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else {
      return {
        actionReports: [
          {
            action: "Assert.exists",
            success: false,
            shortSummary: `Key ${this.parameters.expression} does not exist`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { AssertExists };
