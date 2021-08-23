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

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect($context.get("b")).toBe(1234);
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

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("flightName");
    expect($context.get("flightName")).toBe("Oceanic 815");
  });

  it("should fail when an error is thrown by the code", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                throw "Fuck off"
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Fuck off");
  });

  it("should fail when code returns non-object", async () => {
    let $action = new CodeRun({
      code: `module.exports = (context) => {
                return "Fuck off"
            }`,
    });
    let $context = new Context({ flightNumber: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe(
      `Error: Code must return an object. Instead got string \"Fuck off\"`
    );
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
});
