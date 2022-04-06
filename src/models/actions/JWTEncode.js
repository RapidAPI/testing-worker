const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");
const jwt = require("jsonwebtoken");

class JWTEncode extends BaseAction {
  eval() {
    const t0 = performance.now();

    let header;
    try {
      header = header ? JSON.parse(this.parameters.header) : {};
    } catch (e) {
      return {
        actionReports: [
          {
            action: "JWT.encode",
            success: false,
            shortSummary: "The header was invalid JSON",
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }

    let token;
    try {
      token = jwt.sign(this.parameters.payload, this.parameters.secret, {
        header,
      });
    } catch (e) {
      return {
        actionReports: [
          {
            action: "JWT.encode",
            success: false,
            shortSummary: `Failed to decode ${e}`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }

    const  contextWrites = [{key: this.parameters.variable, value: token}];

    return {
      contextWrites,
      actionReports: [
        {
          action: "JWT.encode",
          success: true,
          shortSummary: `Encoded ${this.parameters.payload}`,
          longSummary: null,
          time: performance.now() - t0,
        },
      ],
    };
  }
}

module.exports = { JWTEncode };
