const { HttpGet, HttpPatch, HttpPut, HttpPost, HttpDelete } = require("./Http");
const Context = require("../Context");

// TODO -- these tests rely on an external service (HTTPBin) --> should instead mock the axios functions with sinon

describe("Http", () => {
  it("should perform basic get request", async () => {
    let $action = new HttpGet({
      url: "https://httpbin.org/ip",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Http.get");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe("Got 200 - OK response from GET https://httpbin.org/ip");
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($result.apiCalls.length).toBe(1);
    expect($result.apiCalls[0].method).toBe("GET");

    expect($result.contextWrites.length).toBe(1);
    expect($result.contextWrites[0].key).toBe("ccc");
    expect($result.contextWrites[0].value.status).toBe(200);
    expect(typeof $result.contextWrites[0].value.data.origin).toBe("string");
  });

  it("should return as success even if response code is not 2xx", async () => {
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
    let $action = new HttpGet({
      url: "https://httpbin.org/anything?a=b",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(true);
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($result.apiCalls.length).toBe(1);

    expect($result.contextWrites.length).toBe(1);
    expect($result.contextWrites[0].value.data.args.a).toBe("b"); // validate argument was recieved by the API
  });

  it("should send form body in POST request", async () => {
    let $action = new HttpPost({
      url: "https://httpbin.org/anything?a=b",
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
    expect($result.contextWrites[0].value.data.json.fieldA).toBe("AAA"); // validate argument was recieved by the API
    expect($result.contextWrites[0].value.data.json.fieldB).toBe("BBB"); // validate argument was recieved by the API
  });

  it("should convert recieved xml data to json", async () => {
    let $action = new HttpGet({
      url: "https://httpbin.org/xml",
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
    console.error = (msg) => {};
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
    let $action = new HttpGet({
      url: "https://httpbin.org/ip",
      variable: "ccc",
    });
    let $result = await $action.eval(new Context());

    expect($result.contextWrites.length).toBe(1);
    expect($result.contextWrites[0].key).toBe("ccc");
    expect(typeof $result.contextWrites[0].value.time).toBe("number");
  });

  it("should preserve cookies between requests", async () => {
    const context = new Context();
    console.error = (msg) => {};

    let $action = new HttpGet({
      url: "http://httpbin.org/cookies/set?testing=rapidapi",
    });
    await $action.eval(context);
    let $actionSubsequent = new HttpGet({
      url: "http://httpbin.org/cookies",
      variable: "nomnomnom",
    });
    let $result = await $actionSubsequent.eval(context);
    expect($result.contextWrites[0].key).toBe("nomnomnom");
    expect($result.contextWrites[0].value.data).toMatchObject({ cookies: { testing: "rapidapi" } });
  });
});
