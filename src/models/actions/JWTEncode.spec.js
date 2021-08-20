const { JWTEncode } = require("./JWTEncode");
const Context = require("../Context");

describe("JWTEncode", () => {
  it("should encode value and set it in context", async () => {
    let $action = new JWTEncode({
      variable: "b",
      secret: "dirty little secret",
      payload: '{a:"b"}',
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("JWT.encode");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('Encoded {a:"b"}');
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect(typeof $context.get("b")).toBe("string");
  });
  it("should encode value and set it in context with header", async () => {
    let $action = new JWTEncode({
      variable: "b",
      secret: "dirty little secret",
      payload: '{a:"b"}',
      header: '{"alg":"HS256","typ":"JWT"}',
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("JWT.encode");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('Encoded {a:"b"}');
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect(typeof $context.get("b")).toBe("string");
  });
});
