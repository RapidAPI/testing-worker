const mysql = require("mysql");
const BaseDb = require("./BaseDb");

class MySqlDb extends BaseDb {
  async _connect() {
    const conn = await new Promise((resolve, reject) => {
      var connection = mysql.createConnection({
        ...this.connectionDetails,
        connectTimeout: this.options.timeout,
      });

      connection.connect(function (err) {
        if (err) reject(err);
        const query = (sql, binding, includeDetails = false) => {
          return new Promise((resolve, reject) => {
            let queryDetails = connection.query(sql, binding, (err, results) => {
              if (err) reject(err);
              if (includeDetails) {
                resolve({
                  results,
                  queryDetails,
                });
              } else {
                resolve(results);
              }
            });
          });
        };
        const end = async () => {
          return new Promise((resolve, reject) => {
            if (err) reject(err);
            resolve(connection.end());
          });
        };
        resolve({ query, end });
      });
    });
    this.setConnection(conn);
  }

  async _disconnect() {
    try {
      await this.connectionInstance.end();
    } catch (e) {
      // We'll use log to see make sure this error is displayed during development but not on production
      console.log(e);
    }
  }

  async _query(sql) {
    let res = await this.connectionInstance.query({
      sql: this.sqlQuery,
      timeout: this.options.timeout,
    });
    return res;
  }
}

module.exports = MySqlDb;
