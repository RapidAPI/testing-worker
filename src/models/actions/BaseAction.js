class BaseAction {
  constructor(parameters = {}) {
    this.parameters = parameters;
  }

  updateParameters(parameters) {
    this.parameters = parameters;
  }

  async eval() {
    throw new Error("Implementation of BaseAction must implement 'eval' function");
  }
}

module.exports = { BaseAction };
