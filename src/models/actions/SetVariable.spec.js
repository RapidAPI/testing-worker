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

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect($context.get("b")).toBe(1234);
  });
});
