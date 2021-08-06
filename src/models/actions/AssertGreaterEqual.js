const { performance } = require("perf_hooks");
const { BaseAction } = require("./BaseAction");

class AssertGreaterEqual extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let value;
    try {
      value = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Assert.greater_equal",
            success: false,
            shortSummary: `Key ${this.parameters.expression} not found`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
    if (isNaN(this.parameters.value) && isNaN(value)) {
      return {
        actionReports: [
          {
            action: "Assert.greater_equal",
            success: false,
            shortSummary: `Your entered value "${this.parameters.value}" is not a number; The value "${value}" for the expression ${this.parameters.expression} is not a number`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else if (isNaN(this.parameters.value)) {
      return {
        actionReports: [
          {
            action: "Assert.greater_equal",
            success: false,
            shortSummary: `Your entered value "${this.parameters.value}" is not a number`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else if (isNaN(value)) {
      return {
        actionReports: [
          {
            action: "Assert.greater_equal",
            success: false,
            shortSummary: `The value "${value}" for the expression ${this.parameters.expression} is not a number`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else if (value >= this.parameters.value) {
      return {
        actionReports: [
          {
            action: "Assert.greater_equal",
            success: true,
            shortSummary: `${this.parameters.expression} >= "${this.parameters.value}"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    } else {
      return {
        actionReports: [
          {
            action: "Assert.greater_equal",
            success: false,
            shortSummary: `${this.parameters.expression} is "${context.get(
              this.parameters.expression
            )}", expected to be greater or equal to "${this.parameters.value}"`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { AssertGreaterEqual };
