const { AssertExists } = require("./AssertExists");
const Context = require("../Context");

describe("AssertExists", () => {
  it("should return successful result when the values exists", async () => {
    let $action = new AssertExists({
      expression: "varName",
    });
    let $context = new Context({ varName: 815 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.exists");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('Key varName exists with value "815"');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the value exists with value null", async () => {
    let $action = new AssertExists({
      expression: "varName",
    });
    let $context = new Context({ varName: null });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.exists");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key varName does not exist");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the variable does not exist", async () => {
    let $action = new AssertExists({
      expression: "varName",
    });
    let $context = new Context({});

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.exists");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key varName does not exist");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});
