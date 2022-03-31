class BaseAction {
  constructor(parameters = {}) {
    this.parameters = { ...parameters };
    // make a deep copy
    var copy = JSON.parse(JSON.stringify(parameters));
    this.safeParameters = copy;
    this.errorFromService = null;
  }

  updateParameters(parameters) {
    this.parameters = {
      ...parameters,
    };
  }

  /**
   * Used to mask sensitive data
   */
  updateSafeParameters(parameters) {
    this.safeParameters = {
      ...parameters,
    };
  }

  async eval() {
    throw new Error("Implementation of BaseAction must implement 'eval' function");
  }
}

module.exports = { BaseAction };
