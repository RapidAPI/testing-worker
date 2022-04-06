const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class SetVariable extends BaseAction {
  eval() {
    const t0 = performance.now();

    const contextWrites = [{ key: this.parameters.key, value: this.parameters.value }];

    return {
      contextWrites,
      actionReports: [
        {
          action: "Set.variable",
          success: true,
          shortSummary: `Set ${this.parameters.key} = ${this.parameters.value}`,
          longSummary: null,
          time: performance.now() - t0,
        },
      ],
    };
  }
}

module.exports = { SetVariable };
