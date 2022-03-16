const { BaseAction } = require("./BaseAction");
const https = require("https");
const consola = require("consola");
const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const { performance } = require("perf_hooks");
const xmlConvert = require("xml-js");
const { removeSensitiveData } = require("../../utils");

class Http extends BaseAction {
  get method() {
    if (this.parameters.method) {
      return this.parameters.method;
    } else {
      throw new Error("Subclass of Http must implement getter method");
    }
  }

  makeRequestObject(parameters, stepTimeoutSeconds) {
    let requestObj;
    const timeoutSeconds = (parameters.options && parameters.options.timeout) || stepTimeoutSeconds;

    requestObj = {
      url: parameters.url,
      method: this.method,
      params: parameters.params,
      headers: parameters.headers,
      timeout: 1000 * timeoutSeconds,
    };
    if (this.method.toLowerCase() != "get") {
      // handle json payload
      if (parameters.payload && typeof parameters.payload == "object" && Object.keys(parameters.payload).length > 0) {
        parameters.payload = JSON.stringify(parameters.payload, null, 4);
      }
      requestObj.data = parameters.payload && parameters.payload.length > 0 ? parameters.payload : parameters.form;
    }
    return requestObj;
  }

  async eval(context, stepTimeoutSeconds = 15) {
    // fetch axios instance from context or create one if does not exist
    // this "shared" axios instance is used to ensure that cookies are properly passed between requests
    let transport;
    try {
      transport = context.get("__http_transport");
    } catch (e) {
      if (global.settings.ignoreSSL === "false") {
        transport = axios.create({
          withCredentials: true,
        });
      } else {
        // Allow self-signed or missing SSL certs
        transport = axios.create({
          withCredentials: true,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        });
      }

      axiosCookieJarSupport(transport);
      transport.defaults.jar = new tough.CookieJar();
      transport.defaults.ignoreCookieErrors = true;

      context.set("__http_transport", transport);
    }

    let response;
    const t0 = performance.now();
    const requestObj = this.makeRequestObject(this.parameters, stepTimeoutSeconds);
    // used for report only
    const safeRequestObj = this.makeRequestObject(this.safeParameters, stepTimeoutSeconds);

    try {
      response = await transport.request(requestObj);
    } catch (e) {
      if (!e.response) {
        //request was not successful
        const t1 = performance.now();
        const elapsedTime = t1 - t0;
        let shortSummary = e.message;
        if (e.code === "ENOTFOUND") {
          shortSummary = `Network error - no response from ${this.parameters.url}`;
        }
        return {
          response,
          actionReports: [
            {
              action: `Http.${this.method.toLowerCase()}`,
              success: false,
              shortSummary,
              longSummary: null,
              time: elapsedTime,
            },
          ],
        };
      }
      response = e.response;
    }

    // convert xml to json object
    if (
      response.headers["content-type"] &&
      (response.headers["content-type"].indexOf("application/xml") > -1 ||
        response.headers["content-type"].indexOf("text/xml") > -1 ||
        response.headers["content-type"].indexOf("text/html") > -1)
    ) {
      try {
        response.data = xmlConvert.xml2js(response.data, { compact: true });
      } catch (err) {
        consola.warn(err.message);
      }
    }

    const t1 = performance.now();
    const elapsedTime = t1 - t0;
    response.time = elapsedTime;

    // Perform an ad-hoc filtering of the response.request object for sensitive passwords because
    // we no longer have the context of the {{template}} values
    let rawRequest = removeSensitiveData(response.request._header, context.getSecretValues()) + "\n";
    if (this.method.toLowerCase() != "get") {
      // use safeRequestObj to omit sensitive data
      rawRequest +=
        typeof safeRequestObj.data == "object" ? JSON.stringify(safeRequestObj.data, null, 4) : safeRequestObj.data;
    }

    return {
      response,
      contextWrites: [{ key: this.parameters.variable, value: response }],
      apiCalls: [
        {
          url: this.parameters.url,
          method: this.method,
          time: elapsedTime,
          status: response.status,
          size: response.headers["content-length"],
          type: response.headers["content-type"],
        },
      ],
      actionReports: [
        {
          action: `Http.${this.method.toLowerCase()}`,
          success: true,
          // eslint-disable-next-line
          shortSummary: `Got ${response.status} - ${response.statusText} response from ${this.method} ${this.parameters.url}`,
          longSummary: `${JSON.stringify(
            {
              responseBody: response.data,
              responseHeaders: response.headers,
              request: rawRequest,
            },
            null,
            4
          )}`,
          time: elapsedTime,
        }, //todo support XML response
      ],
    };
  }
}

class HttpGet extends Http {
  get method() {
    return "GET";
  }
}

class HttpPut extends Http {
  get method() {
    return "PUT";
  }
}

class HttpPost extends Http {
  get method() {
    return "POST";
  }
}

class HttpDelete extends Http {
  get method() {
    return "DELETE";
  }
}

class HttpPatch extends Http {
  get method() {
    return "PATCH";
  }
}

module.exports = { Http, HttpGet, HttpPut, HttpPost, HttpDelete, HttpPatch };
