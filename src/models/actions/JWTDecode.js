const { BaseAction } = require("./BaseAction");
const { performance } = require("perf_hooks");
const jwt = require("jsonwebtoken");

class JWTDecode extends BaseAction {
  eval(context) {
    const t0 = performance.now();

    try {
      let payload;
      if (this.parameters.secret) payload = jwt.verify(this.parameters.token, this.parameters.secret);
      else payload = jwt.decode(this.parameters.token, this.parameters.secret);
      context.set(this.parameters.variable, payload);
      return {
        actionReports: [
          {
            action: "JWT.decode",
            success: true,
            shortSummary: `Decoded ${this.parameters.token}`,
            longSummary: `${JSON.stringify({ payload }, null, 4)}`,
            time: performance.now() - t0,
          },
        ],
      };
    } catch (e) {
      return {
        actionReports: [
          {
            action: "JWT.decode",
            success: false,
            shortSummary: `Failed to decode ${e}`,
            longSummary: null,
            time: performance.now() - t0,
          },
        ],
      };
    }
  }
}

module.exports = { JWTDecode };
