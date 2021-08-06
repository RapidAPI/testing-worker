const { BaseAction } = require("./BaseAction");
const { matchDb } = require("../dbs");
const { performance } = require("perf_hooks");

class Database extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let settings = this.parameters;

    try {
      const Db = matchDb(settings.type);

      if (!Db) {
        // Error, the selected db settings.type is not available
        return {
          actionReports: [
            {
              action: "Connector.database",
              success: false,
              shortSummary: `The selected db ${settings.type} is not supported`,
              longSummary: null,
              time: performance.now() - t0,
            },
          ],
        };
      }
      const dbInstance = new Db(settings);
      const data = await dbInstance.query();

      return {
        contextWrites: [{ key: this.parameters.variable, value: data }],
        actionReports: [
          {
            action: "Connector.database",
            success: true,
            shortSummary: `Database query executed successfully`,
            longSummary: JSON.stringify(
              {
                returnedData: data,
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
            action: "Connector.database",
            success: false,
            shortSummary: `${e}`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { Database };
