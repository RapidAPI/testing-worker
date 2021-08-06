const BaseDb = require("./BaseDb");
const sql = require("mssql");

class MssqlDb extends BaseDb {
  async _connect() {
    await new Promise((resolve, reject) => {
      const details = {
        ...this.connectionDetails,
        connectionTimeout: this.options.timeout,
        requestTimeout: this.options.timeout,
        server: this.connectionDetails.host,
        options: {
          enableArithAbort: true,
        },
      };
      delete details.host;
      details["port"] = parseInt(details["port"]);
      sql.on("error", (err) => {
        reject(err);
      });

      sql
        .connect(details)
        .then((pool) => {
          this.setConnection(pool);
          resolve();
        })
        .catch((err) => {
          reject(err);
        });
    });
    // let pool = await sql.connect(details);
    // let request = pool.request()
    // this.setConnection(request);
  }

  async _disconnect() {
    try {
      await this.connectionInstance.close();
    } catch (e) {
      // We'll use log to see make sure this error is displayed during development but not on production
      console.log(e);
    }
  }

  // This function is wrapped around the "public" query function that guarantees that there is a connection to the DataBase
  async _query() {
    let res = await this.connectionInstance.query(this.sqlQuery);
    return res["recordset"];
  }
}

module.exports = MssqlDb;
