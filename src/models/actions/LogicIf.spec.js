const { LogicIf, compare } = require("./LogicIf");
const Context = require("../Context");
const sinon = require("sinon");

describe("LogicIf", () => {
  it("should call children node if result is true", async () => {
    let $action = new LogicIf({
      key: "a",
      operator: "==",
      value: "a",
    });
    $action.children = {
      eval: sinon.fake.returns({ apiCalls: [], actionReports: [] }),
    };
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Logic.if");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe("Comparison was positive");
    expect(typeof $result.actionReports[0].time).toBe("number");

    expect($action.children.eval.called).toBeTruthy();
  });

  it("should chain results from children nodes", async () => {
    let $action = new LogicIf({
      key: "a",
      operator: "==",
      value: "a",
    });
    $action.children = {
      eval: sinon.fake.returns({
        apiCalls: [],
        actionReports: [{ action: "fake" }],
      }),
    };
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(2);
    expect($result.actionReports[0].action).toBe("Logic.if");
    expect($result.actionReports[1].action).toBe("fake");

    expect($action.children.eval.called).toBeTruthy();
  });

  it("should not call children node if result is false", async () => {
    let $action = new LogicIf({
      key: "a",
      operator: "==",
      value: "b",
    });
    $action.children = {
      eval: sinon.fake(),
    };
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($action.children.eval.called).toBeFalsy();
  });
});

describe("compare()", () => {
  describe("==", () => {
    it("should be true if values are equal", () => {
      expect(compare("a", "==", "a")).toBeTruthy();
      expect(compare(1, "==", 1.0)).toBeTruthy();
      expect(compare(1, "==", "1")).toBeTruthy();
    });

    it("should be false if values are not equal", () => {
      expect(compare("a", "==", "b")).toBeFalsy();
      expect(compare(1, "==", 2)).toBeFalsy();
    });
  });

  describe(">", () => {
    it("should be true", () => {
      expect(compare("aab", ">", "aaa")).toBeTruthy();
      expect(compare(2, ">", 1.0)).toBeTruthy();
      expect(compare(2, ">", "1")).toBeTruthy();
    });

    it("should be false", () => {
      expect(compare("a", ">", "b")).toBeFalsy();
      expect(compare(1, ">", 2)).toBeFalsy();
    });
  });

  describe("<", () => {
    it("should be true", () => {
      expect(compare("aaa", "<", "aab")).toBeTruthy();
      expect(compare(4, "<", 8.0)).toBeTruthy();
      expect(compare(2, "<", "5")).toBeTruthy();
    });

    it("should be false", () => {
      expect(compare("d", "<", "b")).toBeFalsy();
      expect(compare(8, "<", 2)).toBeFalsy();
    });
  });

  describe(">=", () => {
    it("should be true", () => {
      expect(compare("aab", ">=", "aaa")).toBeTruthy();
      expect(compare(2, ">=", 1.0)).toBeTruthy();
      expect(compare(2, ">=", "1")).toBeTruthy();
    });

    it("should be false", () => {
      expect(compare("a", ">=", "b")).toBeFalsy();
      expect(compare(1, ">=", 2)).toBeFalsy();
    });
  });

  describe("<=", () => {
    it("should be true", () => {
      expect(compare("aaa", "<=", "aab")).toBeTruthy();
      expect(compare(4, "<=", 8.0)).toBeTruthy();
      expect(compare(2, "<=", "5")).toBeTruthy();
    });

    it("should be false", () => {
      expect(compare("d", "<=", "b")).toBeFalsy();
      expect(compare(8, "<=", 2)).toBeFalsy();
    });
  });

  describe("!=", () => {
    it("should be true if values are not equal", () => {
      expect(compare("a", "!=", "b")).toBeTruthy();
      expect(compare(1, "!=", 2)).toBeTruthy();
    });

    it("should be false if values are not equal", () => {
      expect(compare("a", "!=", "a")).toBeFalsy();
      expect(compare(1, "!=", 1.0)).toBeFalsy();
      expect(compare(1, "!=", "1")).toBeFalsy();
    });
  });

  it("should throw if using undefined operator", () => {
    expect(() => {
      compare("a", "$", "b");
    }).toThrow('Testing for undefined operator "$"');
  });
});
