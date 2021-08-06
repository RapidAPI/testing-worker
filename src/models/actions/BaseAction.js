/**
 * Parameters is not added here as that doesn't work well with Swagger inheritance
 *
 * @swagger
 * components:
 *   schemas:
 *     BaseAction:
 *       required:
 *         - _id
 *         - action
 *       properties:
 *         _id:
 *           type: string
 *         action:
 *           type: string
 */
class BaseAction {
  constructor(parameters = {}) {
    this.parameters = parameters;
  }

  updateParameters(parameters) {
    this.parameters = parameters;
  }

  async eval() {
    throw `Implementation of BaseAction must implement 'eval' function`;
  }
}

module.exports = { BaseAction };
