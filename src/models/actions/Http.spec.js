/* eslint-disable quotes */
const Context = require("../Context");

// TODO -- look into mocking with sinon rather than jest

describe("Http", () => {
  // mocked modules
  let axios;
  let axiosCookieJarSupport;

  // mocked objects
  let fakeRequest;

  beforeEach(() => {
    axios = require("axios");
    axios.mockReset();
    axiosCookieJarSupport = require("axios-cookiejar-support");
    axiosCookieJarSupport.default.mockReset();

    global.settings = {
      ignoreSSL: "false",
    };

    jest.mock("axios");
    jest.mock("axios-cookiejar-support");

    fakeRequest = jest.fn();
    // default mock request object for all methods, override this for
    // tests that expect a different result
    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "application/json",
      },
      request: {
        _header: "",
      },
      status: 200,
      statusText: "OK",
      data: {},
    });

    axios.create.mockReturnValue({
      defaults: {},
      request: fakeRequest,
    });
  });

  it("should perform basic get request", async () => {
    const { HttpGet } = require("./Http");

    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "application/json",
      },
      request: {
        _header: "",
      },
      status: 200,
      statusText: "OK",
      data: {
        origin: "",
      },
    });

    let $action = new HttpGet({
      url: "https://fake.org",
      variable: "ccc",
    });

    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Http.get");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe("Got 200 - OK response from GET https://fake.org");
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($result.apiCalls.length).toBe(1);
    expect($result.apiCalls[0].method).toBe("GET");

    expect($result.contextWrites.length).toBe(1);
    expect($result.contextWrites[0].key).toBe("ccc");
    expect($result.contextWrites[0].value.status).toBe(200);
    expect(typeof $result.contextWrites[0].value.data.origin).toBe("string");
  });

  it("should return as success even if response code is not 2xx", async () => {
    const { HttpGet } = require("./Http");

    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "application/json",
      },
      request: {
        _header: "",
      },
      status: 400,
      statusText: "bad request",
    });

    let $action = new HttpGet({
      url: "https://httpbin.org/status/400",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary.toLowerCase()).toBe(
      "got 400 - bad request response from get https://httpbin.org/status/400"
    ); // lower ccasing because it can sometimes be BAD REQUEST and sometimes Bad Request
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($result.apiCalls.length).toBe(1);
    expect($result.apiCalls[0].method).toBe("GET");
    expect($result.apiCalls[0].status).toBe(400);

    expect($result.contextWrites.length).toBe(1);
  });

  it("should chain query params to URL", async () => {
    const { HttpGet } = require("./Http");

    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "application/json",
      },
      request: {
        _header: "",
      },
      status: 200,
      statusText: "OK",
      data: {
        args: { a: "b" },
      },
    });

    let $action = new HttpGet({
      url: "https://fake.org/anything?a=b",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(true);
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($result.apiCalls.length).toBe(1);

    expect($result.contextWrites.length).toBe(1);

    expect($result.contextWrites[0].value.data.args.a).toBe("b");
  });

  it("should send form body in POST request", async () => {
    const { HttpPost } = require("./Http");

    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "application/json",
      },
      request: {
        _header: "",
      },
      status: 200,
      statusText: "OK",
      data: {
        json: {
          fieldA: "AAA",
          fieldB: "BBB",
        },
      },
    });

    let $action = new HttpPost({
      url: "https://fake.org/anything?a=b",
      form: {
        fieldA: "AAA",
        fieldB: "BBB",
      },
      variable: "ccc",
    });

    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Http.post");
    expect($result.actionReports[0].success).toBe(true);
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($result.apiCalls.length).toBe(1);
    expect($result.apiCalls[0].method).toBe("POST");

    expect($result.contextWrites.length).toBe(1);

    expect($result.contextWrites[0].value.data.json.fieldA).toBe("AAA");
    expect($result.contextWrites[0].value.data.json.fieldB).toBe("BBB");
  });

  it("should convert recieved xml data to json", async () => {
    const { HttpGet } = require("./Http");

    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "text/html",
      },
      request: {
        _header: "",
      },
      status: 200,
      statusText: "OK",
      data: `<?xml version="1.0" encoding="UTF-8"?><slideshow hello="hi"><body>text</body></slideshow>`,
    });

    let $action = new HttpGet({
      url: "https://fake.org/xml",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());
    expect($result.actionReports.length).toBe(1);

    expect($result.contextWrites.length).toBe(1);

    // check that xml was properly converted to JSON
    // this depends on the actual returned data --- very susptible to API changes
    expect(typeof $result.contextWrites[0].value.data.slideshow).toBe("object");
    expect(typeof $result.contextWrites[0].value.data.slideshow._attributes).toBe("object");
  });

  it("should return an error if HTTP called failed", async () => {
    const { HttpDelete } = require("./Http");

    fakeRequest.mockRejectedValue(new Error("bad!"));

    let $action = new HttpDelete({
      url: "invalidUrl",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Http.delete");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Network error - no response from invalidUrl");
    expect(typeof $result.actionReports[0].time).toBe("number");
    expect($result.contextWrites).toBeUndefined();
    expect($result.apiCalls).toBeUndefined();
  });

  it("should add time property to response", async () => {
    const { HttpGet } = require("./Http");

    let $action = new HttpGet({
      url: "https://fake.org/ip",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.contextWrites.length).toBe(1);
    expect($result.contextWrites[0].key).toBe("ccc");
    expect(typeof $result.contextWrites[0].value.time).toBe("number");
  });

  it("should preserve cookies between requests", async () => {
    const { HttpGet } = require("./Http");

    fakeRequest.mockResolvedValue({
      headers: {
        "content-type": "application/json",
        "set-cookie": "testing=rapidapi; Path=/",
      },
      request: {
        _header: "",
      },
      status: 200,
      statusText: "OK",
      data: {
        cookies: {
          testing: "rapidapi",
        },
      },
    });

    const context = new Context();

    let $action = new HttpGet({
      url: "http://fake.org/cookies/set?testing=rapidapi",
    });
    await $action.eval(context);
    expect(axiosCookieJarSupport.default.mock.calls.length).toBe(1);
    let $actionSubsequent = new HttpGet({
      url: "http://fake.org/cookies",
      variable: "nomnomnom",
    });
    let $result = await $actionSubsequent.eval(context);
    expect($result.contextWrites[0].key).toBe("nomnomnom");
    expect($result.contextWrites[0].value.data).toMatchObject({ cookies: { testing: "rapidapi" } });
    expect(axiosCookieJarSupport.default.mock.calls.length).toBe(1); // Should still be exactly called once, not twice!
  });

  describe("`ignoreSSL` option", () => {
    it("does not pass `rejectUnauthorized` to custom httpsAgent when `ignoreSSL` is false", async () => {
      global.settings = {
        ignoreSSL: "false",
      };
      const { HttpGet } = require("./Http");

      let $action = new HttpGet({
        url: "https://fake.org/ip",
        variable: "ccc",
      });

      await $action.eval(new Context());
      expect(axios.create.mock.calls[0][0]).toStrictEqual({
        withCredentials: true,
      });
    });

    it.only("passes `rejectUnauthorized` set to custom httpsAgent when `ignoreSSL` is set to true", async () => {
      global.settings = {
        ignoreSSL: "true",
      };
      const { HttpGet } = require("./Http");

      let $action = new HttpGet({
        url: "https://fake.org/ip",
        variable: "ccc",
      });

      await $action.eval(new Context());
      expect(axios.create.mock.calls[0][0]).toMatchObject({
        withCredentials: true,
        httpsAgent: {
          options: { rejectUnauthorized: false },
        },
      });
    });
  });
});
