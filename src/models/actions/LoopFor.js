const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

class LoopForEach extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let arr;

    try {
      arr = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Loop.forEach",
            success: false,
            shortSummary: `Key ${this.parameters.expression} not found`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }

    if (!Array.isArray(arr)) {
      return {
        actionReports: [
          {
            action: "Loop.forEach",
            success: false,
            shortSummary: `Object at ${this.parameters.expression} is not an array`,
            longSummary: JSON.stringify({ summary: `Expected an array, instead got ${typeof arr} with value: ${arr}` }),
            //longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }

    let result = {
      actionReports: [],
      apiCalls: [],
    };

    const elemName = this.parameters.variable;

    for (let elem of arr) {
      context.set(elemName, elem);
      let { apiCalls, actionReports } = await this.children.eval(context);
      result.actionReports.push(...actionReports);
      result.apiCalls.push(...apiCalls);
    }

    let failedCount = result.actionReports.filter((a) => a.success != true).length;

    result.actionReports.unshift({
      action: "Loop.forEach",
      success: failedCount == 0,
      shortSummary: `Iterated over ${arr.length} elements in array ${this.parameters.expression}. ${
        result.actionReports.length - failedCount
      }/${result.actionReports.length} steps passed.`,
      longSummary: null,
      time: performance.now() - t0,
    });

    return result;
  }
}

module.exports = { LoopForEach };
