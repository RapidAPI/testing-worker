const { JWTDecode } = require("./JWTDecode");
const Context = require("../Context");

describe("JWTDecode", () => {
  it("should decode token when passed the right secret", async () => {
    let $action = new JWTDecode({
      variable: "b",
      secret: "dirty little secret",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6Imp3dCJ9.B6uG3mB3QCVPTy3Ab9UBOrj9NQRxkpOoJ0SXCF3lg0M",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("JWT.decode");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe(
      "Decoded eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6Imp3dCJ9.B6uG3mB3QCVPTy3Ab9UBOrj9NQRxkpOoJ0SXCF3lg0M"
    );
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect(typeof $context.get("b")).toBe("object");
    expect($context.get("b")).toEqual({ hello: "jwt" });
  });

  it("should decode token when not passed a secret", async () => {
    let $action = new JWTDecode({
      variable: "b",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6Imp3dCJ9.B6uG3mB3QCVPTy3Ab9UBOrj9NQRxkpOoJ0SXCF3lg0M",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("JWT.decode");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe(
      "Decoded eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6Imp3dCJ9.B6uG3mB3QCVPTy3Ab9UBOrj9NQRxkpOoJ0SXCF3lg0M"
    );
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect(typeof $context.get("b")).toBe("object");
    expect($context.get("b")).toEqual({ hello: "jwt" });
  });

  it("should fail when passed the wrong secret", async () => {
    let $action = new JWTDecode({
      variable: "b",
      secret: "not the right secret",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJoZWxsbyI6Imp3dCJ9.B6uG3mB3QCVPTy3Ab9UBOrj9NQRxkpOoJ0SXCF3lg0M",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("JWT.decode");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Failed to decode JsonWebTokenError: invalid signature");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});
