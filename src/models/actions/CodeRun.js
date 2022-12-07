const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");
const { NodeVM } = require("vm2");

class CodeRun extends BaseAction {
  constructor(args) {
    super(args);
    this.resolve = null;
    this.t0 = 0;
  }

  async eval(context) {
    process.on("uncaughtException", (e) => {
      // Used to catch asynchronous unhandled exceptions from inside of CodeRun.
      // https://github.com/patriksimek/vm2#error-handling
      if (this.resolve) {
        this.resolve({
          actionReports: [
            {
              action: "Code.run",
              success: false,
              shortSummary: e.message || e,
              longSummary: null,
              time: performance.now() - this.t0,
            },
          ],
        });
      }
    });

    return new Promise((_resolve) => {
      this.resolve = _resolve;
      this.kyle = 1;
      this.t0 = performance.now();
      const vm = new NodeVM({
        timeout: 60000,
        eval: false,
        wasm: false,
        require: {
          builtin: ["crypto", "assert"],
          external: false,
        },
      });

      try {
        // vm.run() requires a filename as the second param to be able to use require() for relative imports.
        // It does not appear that the file contents actual matter.
        const customFunc = vm.run(this.parameters.code, "./CodeRun");
        if (typeof customFunc !== "function") {
          throw new Error(`"Code Run" must export a function as follows: module.exports = (context) => {}`);
        }

        let promiseOrResult = customFunc(context.data);
        if (!(promiseOrResult instanceof Promise)) {
          promiseOrResult = Promise.resolve(promiseOrResult);
        }
        promiseOrResult
          .then((res) => {
            res = JSON.stringify(res);
            if (res) res = JSON.parse(res);
            else res = {};
            if (res && typeof res != "object") {
              throw new Error(`Code must return an object. Instead got ${typeof res} "${res}"`);
            }

            const contextWrites = Object.keys(res).map((key) => {
              return { key: key, value: res[key] };
            });

            // happy path
            this.resolve({
              contextWrites,
              actionReports: [
                {
                  action: "Code.run",
                  success: true,
                  shortSummary: "Code executed successfully",
                  longSummary: JSON.stringify(
                    {
                      returnedData: res,
                    },
                    null,
                    4
                  ),
                  time: performance.now() - this.t0,
                },
              ],
            });
          })
          .catch((e) => {
            // error inside async code run that returns a promise
            this.resolve({
              actionReports: [
                {
                  action: "Code.run",
                  success: false,
                  shortSummary: e.message || e,
                  longSummary: null,
                  time: performance.now() - this.t0,
                },
              ],
            });
          });
      } catch (e) {
        // error inside sync code run that returns an object
        this.resolve({
          actionReports: [
            {
              action: "Code.run",
              success: false,
              shortSummary: e.message || e,
              longSummary: null,
              time: performance.now() - this.t0,
            },
          ],
        });
      }
    });
  }
}

module.exports = { CodeRun };
