const { AssertDifferent } = require("./AssertDifferent");
const Context = require("../Context");

describe("AssertDifferent", () => {
  it("should return successful result when the values are different", async () => {
    const $action = new AssertDifferent({
      expression: "varName",
      value: 815,
    });
    const $context = new Context({ varName: 800 });

    const $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.different");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('varName !== "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the values are equal", async () => {
    const $action = new AssertDifferent({
      expression: "varName",
      value: 815,
    });
    const $context = new Context({ varName: 815 });

    const $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.different");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('varName is "815", expected not to be "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the variable does not exist", async () => {
    const $action = new AssertDifferent({
      expression: "varName",
      value: 815,
    });
    const $context = new Context({});

    const $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.different");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key varName not found");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});
