class Context {
  constructor(data = {}, secrets = {}, mask = "****") {
    this.data = data;
    this.secrets = secrets;
    this.safeData = {};
    this.mask = mask;
    this.maskSafeData();
  }

  maskSafeData() {
    for (const key of Object.keys(this.data)) {
      if (this.secrets[key]) {
        this.safeData[key] = this.mask;
      } else {
        this.safeData[key] = this.data[key];
      }
    }
  }

  copy() {
    const cleanedData = {
      ...this.data,
    };
    // Don't copy the transport object, this should be recreated for each successive http request.
    delete cleanedData.__http_transport;

    return new Context(cleanedData, { ...this.secrets }, this.mask);
  }

  /**
   * Return a list of secret values used to perform ad-hoc filtered of
   * sensitive data after templates has been processed.
   */
  getSecretValues() {
    return Object.values(this.secrets);
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
    // rebuild safeData from new data
    this.maskSafeData();
  }
}

module.exports = Context;
