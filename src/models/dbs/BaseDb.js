function isUrlSafe(url) {
  const BLOCK_LIST = [
    "169.254.169.254", //AWS Metadata IP
    "imrapid.io", //any internal service
    "rapidapi.cloud", //rapidapi IT
  ];
  if (!process.env.NODE_ENV === "development") {
    BLOCK_LIST + ["localhost", "127.0.0.1"];
  }
  let foundViolations = BLOCK_LIST.filter((b) => url.toLowerCase().includes(b));

  if (foundViolations.length == 0) return true;

  console.log(`Found URL Violations:  ${foundViolations.join(", ")}`);
  return false;
}

class BaseDb {
  constructor({ connection, query, options }) {
    this.connectionDetails = connection;
    this.options = options;
    this.connectionInstance = undefined;
    this.connected = false;
    this.sqlQuery = query;
  }

  setConnection(conn) {
    this.connectionInstance = conn;
    this.connected = !!conn;
  }

  isConnected() {
    return this.connected;
  }

  async connect() {
    const host = this.connectionDetails.host;
    if (!isUrlSafe(host)) {
      throw Error(`The host ${host} is in the list of unsafe URLs`);
    }
    try {
      await this._connect();
    } finally {
      await this._disconnect();
    }
  }

  async query() {
    let result = [];
    try {
      await this._connect();
      result = await this._query();
    } catch (e) {
      throw e;
    } finally {
      await this._disconnect();
    }
    return result;
  }

  async _connect() {
    throw `Implementation of BaseDB must implement '_connect' function`;
  }

  async _disconnect() {
    throw `Implementation of BaseDB must implement '_disconnect' function`;
  }

  async _query() {
    throw `Implementation of BaseDB must implement '_query' function`;
  }
}

module.exports = BaseDb;
