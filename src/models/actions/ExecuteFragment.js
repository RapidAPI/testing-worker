const { performance } = require("perf_hooks");
const { BaseAction } = require("./BaseAction");

class ExecuteFragment extends BaseAction {
  async eval(context, timeoutSeconds = 300, stepTimeoutSeconds = 15) {
    const t0 = performance.now();

    if (this.errorFromService) {
      return {
        actionReports: [
          {
            action: "Execute.Fragment",
            success: false,
            shortSummary: this.errorFromService,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
    try {
      // Make a copy so changes to the context affect only nested tests.
      const copyContext = context.copy();

      // Test variables not defined by the fragment will be undefined when executed
      // from a parent test unless mapped in the fragments inputs.
      //
      // The context will contain all secrets, env vars and upstream context results in
      // addition to the input overrides from the fragment. Child test variables are not
      // available and will remain undefined unless the input overrides for them are passed.
      //
      for (const variable in this.parameters.inputs) {
        copyContext.set(variable, this.parameters.inputs[variable]);
      }

      // eslint-disable-next-line max-len
      const { apiCalls, actionReports, contextWrites } = await this.children.eval(
        copyContext,
        timeoutSeconds,
        stepTimeoutSeconds
      );

      const childContext = contextWrites.reduce((prev, current) => {
        prev[current.key] = current.value;
        return prev;
      }, {});

      return {
        apiCalls,
        actionReports: [...actionReports],
        //  scoped contextWrite
        contextWrites: [{ key: this.parameters.variable, value: childContext }],
      };
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Execute.Fragment",
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

module.exports = { ExecuteFragment };
