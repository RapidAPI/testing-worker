const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class AssertIn extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let value;
    try {
      value = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Assert.in",
            success: false,
            shortSummary: `Key ${this.parameters.expression} not found`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
    try {
      if (typeof this.parameters.value == "string") {
        this.parameters.value = JSON.parse(this.parameters.value);
      }
    } finally {
      if (!Array.isArray(this.parameters.value)) {
        // eslint-disable-next-line
        return {
          actionReports: [
            {
              action: "Assert.in",
              success: false,
              shortSummary: "Value supplied is not an array",
              longSummary: JSON.stringify({ gotArray: this.parameters.value }),
              time: performance.now() - t0,
            },
          ],
        };
      }
      if (this.parameters.value.indexOf(String(value)) >= 0) {
        // eslint-disable-next-line
        return {
          actionReports: [
            {
              action: "Assert.in",
              success: true,
              shortSummary: `Value for ${this.parameters.expression} ("${value}") exists in array of options`,
              longSummary: null,
              time: performance.now() - t0,
            },
          ],
        };
      } else {
        // eslint-disable-next-line
        return {
          actionReports: [
            {
              action: "Assert.in",
              success: false,
              shortSummary: `${this.parameters.expression} is "${context.get(
                this.parameters.expression
              )}", expected an element from (${this.parameters.value.join(", ")})`,
              longSummary: null,
              time: performance.now() - t0,
            },
          ],
        };
      }
    }
  }
}

module.exports = { AssertIn };
