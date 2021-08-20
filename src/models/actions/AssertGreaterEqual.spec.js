const { AssertGreaterEqual } = require("./AssertGreaterEqual");
const Context = require("../Context");

describe("AssertGreaterEqual", () => {
  it("should return successful result when the value is greater than the variable", async () => {
    let $action = new AssertGreaterEqual({
      expression: "varName",
      value: 815,
    });
    let $context = new Context({ varName: 923 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.greater_equal");

    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('varName >= "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return successful result when the values are equal", async () => {
    let $action = new AssertGreaterEqual({
      expression: "varName",
      value: "815",
    });
    let $context = new Context({ varName: 815 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.greater_equal");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('varName >= "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the value is smaller than the variable", async () => {
    let $action = new AssertGreaterEqual({
      expression: "varName",
      value: 815,
    });
    let $context = new Context({ varName: 700 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.greater_equal");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('varName is "700", expected to be greater or equal to "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the entered value is not a number", async () => {
    let $action = new AssertGreaterEqual({
      expression: "varName",
      value: "sdfsd",
    });
    let $context = new Context({ varName: "23" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.greater_equal");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('Your entered value "sdfsd" is not a number');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the targeted variable is not a number", async () => {
    let $action = new AssertGreaterEqual({
      expression: "varName",
      value: "23",
    });
    let $context = new Context({ varName: "asdf" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.greater_equal");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('The value "asdf" for the expression varName is not a number');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the variable does not exist", async () => {
    let $action = new AssertGreaterEqual({
      expression: "varName",
      value: 815,
    });
    let $context = new Context({});

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.greater_equal");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key varName not found");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});
