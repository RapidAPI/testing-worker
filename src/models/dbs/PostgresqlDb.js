const BaseDb = require("./BaseDb");
const { Client } = require("pg");

class PostgresqlDb extends BaseDb {
  async _connect() {
    const client = new Client({
      ...this.connectionDetails,
      connectionTimeoutMillis: this.options.timeout,
      query_timeout: this.options.timeout,
    });
    await client.connect();
    this.setConnection(client);
  }

  async _disconnect() {
    try {
      await this.connectionInstance.end();
    } catch (e) {
      // We'll use log to see make sure this error is displayed during development but not on production
      // eslint-disable-next-line
      console.log(e);
    }
  }

  async _query() {
    let res = (await this.connectionInstance.query(this.sqlQuery)).rows;
    return res;
  }
}

module.exports = PostgresqlDb;
