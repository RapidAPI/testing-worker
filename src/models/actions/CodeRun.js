const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");
const { NodeVM } = require("vm2");

class CodeRun extends BaseAction {
  eval(context) {
    const t0 = performance.now();
    const vm = new NodeVM({
      timeout: 60000,
      eval: false,
      wasm: false,
    });

    try {
      let customFunc = vm.run(this.parameters.code);
      let res = JSON.stringify(customFunc(context.data));
      if (res) res = JSON.parse(res);
      else res = {};
      if (res && typeof res != "object") {
        throw new Error(`Code must return an object. Instead got ${typeof res} "${res}"`);
      }

      for (let rKey of Object.keys(res)) {
        context.set(rKey, res[rKey]);
      }

      return {
        contextWrites: [{ key: this.parameters.variable, value: res }],
        actionReports: [
          {
            action: "Code.run",
            success: true,
            shortSummary: `Code executed successfully`,
            longSummary: JSON.stringify(
              {
                returnedData: res,
              },
              null,
              4
            ),
            time: performance.now() - t0,
          },
        ],
      };
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Code.run",
            success: false,
            shortSummary: `${e.message}`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { CodeRun };
