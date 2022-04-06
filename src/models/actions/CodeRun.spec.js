const { CodeRun } = require("./CodeRun");
const Context = require("../Context");

describe("CodeRun", () => {
  it("should run code block", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                return {b:1234};
            }`,
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Code.run");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe("Code executed successfully");
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify contextWrites was passed
    expect($result.contextWrites[0].key).toBe("b");
    expect($result.contextWrites[0].value).toEqual(1234);
  });

  it("should give the code access to the context", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                return {flightName:"Oceanic " + context.flightNumber};
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(true);

    // verify contextWrites was passed
    expect($result.contextWrites[0].key).toBe("flightName");
    expect($result.contextWrites[0].value).toEqual("Oceanic 815");
  });

  it("should fail when an error is thrown by the code", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                throw new Error("fake error")
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("fake error");
  });

  it("should fail when code returns non-object", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                return "not an object"
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe(
      `Code must return an object. Instead got string "not an object"`
    );
  });

  it("should return contextWrites array for key values returned from code", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                return {
                  "foo": "2",
                  "bar": [1,2,3]
                }
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.contextWrites[0].key).toBe("foo");
    expect($result.contextWrites[0].value).toBe("2");
    expect($result.contextWrites[1].key).toBe("bar");
    expect($result.contextWrites[1].value).toEqual([1,2,3]);
  });

  it("should not fail when code returns nothing", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(true);
  });
  describe("imports", () => {
    it("should import allowed libs", async () => {
      let $action = new CodeRun({
        code: `module.exports = (context) => {
                  const assert = require("assert");
                  const crypto = require("crypto");
              }`,
      });
      let $context = new Context({});
      let $result = await $action.eval($context);
      expect($result.actionReports[0].success).toBe(true);
      expect($result.actionReports[0].shortSummary).toBe(`Code executed successfully`);
    });

    it("should not import libs not in whitelist", async () => {
      let $action = new CodeRun({
        code: `module.exports = (context) => {
                  const assert = require("fs");
              }`,
      });
      let $context = new Context({});
      let $result = await $action.eval($context);
      expect($result.actionReports[0].success).toBe(false);
      expect($result.actionReports[0].shortSummary).toBe(`Access denied to require 'fs'`);
    });

    it("should fail when assert is thrown", async () => {
      let $action = new CodeRun({
        code: `module.exports = (context) => {
            const assert = require("assert");
            assert.equal(1,2, "assert failed");
      }`,
      });
      let $context = new Context({});
      let $result = await $action.eval($context);

      expect($result.actionReports[0].success).toBe(false);
      expect($result.actionReports[0].shortSummary).toBe(`assert failed`);
    });
  });

  describe("returns Promise", () => {
    it("should succeed when returning a promise", async () => {
      let $action = new CodeRun({
        code: `module.exports = (context) => {
                  return new Promise((resolve, reject)=>{
                    resolve({
                      value: "hello"
                    });
                  })
              }`,
      });

      let $context = new Context({});
      let $result = await $action.eval($context);

      expect($result.actionReports[0].success).toBe(true);
      expect(JSON.parse($result.actionReports[0].longSummary).returnedData.value).toBe("hello");
    });

    it("should fail when code rejects", async () => {
      let $action = new CodeRun({
        code: `module.exports = (context) => {
                  return new Promise((resolve, reject)=>{
                    reject("fail")
                  })
              }`,
      });
      let $context = new Context({});
      let $result = await $action.eval($context);

      expect($result.actionReports[0].success).toBe(false);
      expect($result.actionReports[0].shortSummary).toBe(`fail`);
    });

    it("should fail when assert is thrown", async () => {
      let $action = new CodeRun({
        code: `module.exports = (context) => {
                  return new Promise((resolve, reject)=>{
                    const assert = require("assert");
                    assert.equal(1,2, "assert failed");
                    resolve({});
                  })
              }`,
      });
      let $context = new Context({});
      let $result = await $action.eval($context);

      expect($result.actionReports[0].success).toBe(false);
      expect($result.actionReports[0].shortSummary).toBe(`assert failed`);
    });
  });
});
