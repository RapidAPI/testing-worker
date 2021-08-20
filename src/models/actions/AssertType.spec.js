const { AssertType } = require("./AssertType");
const Context = require("../Context");

describe("AssertType", () => {
  it("should return successful result when the values has the required type", async () => {
    let $action = new AssertType({
      expression: "varName",
      value: "number",
    });
    let $context = new Context({ varName: 815 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.type");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('varName is of type number with value "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the value exists with a different type", async () => {
    let $action = new AssertType({
      expression: "varName",
      value: "number",
    });
    let $context = new Context({ varName: "Not a Number" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.type");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('varName is "Not a Number", expected "number"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the variable does not exist", async () => {
    let $action = new AssertType({
      expression: "varName",
    });
    let $context = new Context({});

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.type");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key varName not found");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});
