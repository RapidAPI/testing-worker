const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class AssertType extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let value;
    try {
      value = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Assert.type",
            success: false,
            shortSummary: `Key ${this.parameters.expression} not found`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
    if (typeof value == this.parameters.value) {
      return {
        actionReports: [
          {
            action: "Assert.type",
            success: true,
            shortSummary: `${this.parameters.expression} is of type ${this.parameters.value} with value "${value}"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else {
      return {
        actionReports: [
          {
            action: "Assert.type",
            success: false,
            shortSummary: `${this.parameters.expression} is "${context.get(this.parameters.expression)}", expected "${
              this.parameters.value
            }"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { AssertType };
