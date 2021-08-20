const { AssertEquals } = require("./AssertEquals");
const Context = require("../Context");

describe("AssertEquals", () => {
  it("should return successful result when the values are equal", async () => {
    let $action = new AssertEquals({
      expression: "varName",
      value: 815,
    });
    let $context = new Context({ varName: 815 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.equals");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('varName == "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the values are not equal", async () => {
    let $action = new AssertEquals({
      expression: "varName",
      value: 815,
    });
    let $context = new Context({ varName: 800 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.equals");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('varName is "800", expected "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the variable does not exist", async () => {
    let $action = new AssertEquals({
      expression: "varName",
      value: 815,
    });
    let $context = new Context({});

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.equals");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key varName not found");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});
