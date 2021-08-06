const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class SetVariable extends BaseAction {
  eval(context) {
    const t0 = performance.now();

    context.set(this.parameters.key, this.parameters.value);

    return {
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
