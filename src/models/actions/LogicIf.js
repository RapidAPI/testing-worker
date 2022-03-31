const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");

function compare(val1, operator, val2) {
  if (!isNaN(parseFloat(val1) && !isNaN(parseFloat(val2)))) {
    //we are dealing with number
    val1 = parseFloat(val1);
    val2 = parseFloat(val2);
  }

  switch (operator) {
    case "==":
      return val1 == val2;
    case ">":
      return val1 > val2;
    case "<":
      return val1 < val2;
    case ">=":
      return val1 >= val2;
    case "<=":
      return val1 <= val2;
    case "!=":
      return val1 != val2;
  }

  throw new Error(`Testing for undefined operator "${operator}"`);
}

class LogicIf extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let { key, value, operator } = this.parameters;

    try {
      let comparisonResult = compare(key, operator, value);

      if (comparisonResult) {
        let { apiCalls, actionReports } = await this.children.eval(context);
        return {
          apiCalls,
          actionReports: [
            {
              action: "Logic.if",
              success: true,
              shortSummary: "Comparison was positive",
              longSummary: JSON.stringify({ summary: `"${key}" ${operator} "${value}" is true` }, null, 4),
              time: performance.now() - t0,
            },
            ...actionReports,
          ],
        };
      } else {
        return {
          actionReports: [
            {
              action: "Logic.if",
              success: true,
              shortSummary: "Comparison was negative",
              longSummary: JSON.stringify({ summary: `"${key}" ${operator} "${value}" is false` }, null, 4),
              time: performance.now() - t0,
            },
          ],
        };
      }
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Logic.if",
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

module.exports = { LogicIf, compare };
