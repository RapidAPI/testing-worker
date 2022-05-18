const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");
var util = require("util");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

class JsonValidate extends BaseAction {
  async eval(context) {
    const t0 = performance.now();
    let value, schema;

    // get value
    try {
      value = context.get(this.parameters.expression);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Json.validate",
            success: false,
            shortSummary: `Key ${this.parameters.expression} not found`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }

    // get schema
    try {
      schema = this.parameters.schema;
      if (typeof schema != "object") schema = JSON.parse(schema);
    } catch (e) {
      return {
        actionReports: [
          {
            action: "Json.validate",
            success: false,
            shortSummary: "Schema supplied is not valid json",
            longSummary: JSON.stringify({
              error: e.message,
              schema: schema,
            }),
            time: performance.now() - t0,
          },
        ],
      };
    }

    // perform validation
    let ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    let isValid = ajv.validate(schema, value);

    // return result
    if (isValid) {
      return {
        actionReports: [
          {
            action: "Json.validate",
            success: true,
            shortSummary: `JSON at ${this.parameters.expression} passed validation`,
            longSummary: JSON.stringify({
              inputJson: util.inspect(value),
              schema: schema,
            }),
            time: performance.now() - t0,
          },
        ],
      }; //util.inspect handles potentially circular json --> https://stackoverflow.com/a/18354289/1498754
    } else {
      return {
        actionReports: [
          {
            action: "Json.validate",
            success: false,
            shortSummary: `JSON at ${this.parameters.expression} failed validation`,
            longSummary: JSON.stringify({
              errors: ajv.errors,
              inputJson: util.inspect(value),
              schema: schema,
            }),
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { JsonValidate };
