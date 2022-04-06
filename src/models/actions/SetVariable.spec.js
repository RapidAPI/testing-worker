const { SetVariable } = require("./SetVariable");
const Context = require("../Context");

describe("SetVariable", () => {
  it("should set variables in context", async () => {
    let $action = new SetVariable({
      key: "b",
      value: 1234,
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Set.variable");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe("Set b = 1234");
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify context write was passed
    expect($result.contextWrites[0].key).toBe("b");
    expect($result.contextWrites[0].value).toBe(1234);
  });
});
