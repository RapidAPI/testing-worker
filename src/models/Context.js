class Context {
  constructor(data = {}, secrets = []) {
    this.data = data;
    this.secrets = secrets;
  }

  /**
   * Return a list of secret values used to filter out
   * sensitive data from test execution results.
   */
  getSecrets() {
    return this.secrets;
  }

  get(path) {
    let object = this.data;
    return path.split(".").reduce(function (prev, curr) {
      if (prev) if (prev[curr] !== undefined) return prev[curr];
      throw new Error(`Name ${path} does not exist in context ${JSON.stringify(object, null, 4)}`);
    }, object);
  }

  set(key, value) {
    this.data[key] = value;
  }
}

module.exports = Context;
