const { performance } = require("perf_hooks");
const { BaseAction } = require("./BaseAction");

class AssertDifferent extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let value;
    try {
      value = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Assert.different",
            success: false,
            shortSummary: `Key ${this.parameters.expression} not found`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
    if (value !== this.parameters.value) {
      return {
        actionReports: [
          {
            action: "Assert.different",
            success: true,
            shortSummary: `${this.parameters.expression} !== "${this.parameters.value}"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else {
      return {
        actionReports: [
          {
            action: "Assert.different",
            success: false,
            shortSummary: `${this.parameters.expression} is "${context.get(
              this.parameters.expression
            )}", expected not to be "${this.parameters.value}"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { AssertDifferent };
