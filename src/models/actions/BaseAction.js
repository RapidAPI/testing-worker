class BaseAction {
  constructor(parameters = {}) {
    this.parameters = { ...parameters };
    this.safeParameters = { ...parameters };
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
