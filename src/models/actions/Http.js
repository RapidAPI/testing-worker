const { BaseAction } = require("./BaseAction");
const https = require("https");
const consola = require("consola");
const axios = require("axios");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");
const { performance } = require("perf_hooks");
const xmlConvert = require("xml-js");

class Http extends BaseAction {
  get method() {
    if (this.parameters.method) {
      return this.parameters.method;
    } else {
      throw new Error("Subclass of Http must implement getter method");
    }
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
    let requestObj;
    const timeoutSeconds = (this.parameters.options && this.parameters.options.timeout) || stepTimeoutSeconds;

    requestObj = {
      url: this.parameters.url,
      method: this.method,
      params: this.parameters.params,
      headers: this.parameters.headers,
      timeout: 1000 * timeoutSeconds,
    };
    if (this.method.toLowerCase() != "get") {
      // handle json payload
      if (
        this.parameters.payload &&
        typeof this.parameters.payload == "object" &&
        Object.keys(this.parameters.payload).length > 0
      ) {
        this.parameters.payload = JSON.stringify(this.parameters.payload, null, 4);
      }
      requestObj.data =
        this.parameters.payload && this.parameters.payload.length > 0 ? this.parameters.payload : this.parameters.form;
    }
    try {
      response = await transport.request(requestObj);
    } catch (e) {
      if (!e.response) {
        //request was not successful
        const t1 = performance.now();
        const elapsedTime = t1 - t0;
        return {
          response,
          actionReports: [
            {
              action: `Http.${this.method.toLowerCase()}`,
              success: false,
              shortSummary: `Network error - no response from ${this.parameters.url}`,
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
    let rawRequest = response.request._header + "\n";
    if (this.method.toLowerCase() != "get") {
      rawRequest += typeof requestObj.data == "object" ? JSON.stringify(requestObj.data, null, 4) : requestObj.data;
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
