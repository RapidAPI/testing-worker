const { LoopForEach } = require("./LoopFor");
const Context = require("../Context");
const sinon = require("sinon");

describe("LoopForEach", () => {
  it("should call children once for every array element", async () => {
    let $action = new LoopForEach({
      expression: "arr",
      variable: "var",
    });
    $action.children = {
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [],
          contextWrites: [],
        })
      ),
    };
    let $context = new Context({ arr: [1, 2, 3, 4, 5] });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Loop.forEach");
    expect($result.actionReports[0].success).toBe(true);

    expect($action.children.eval.callCount).toBe(5);
  });

  it("should chain childrens' results", async () => {
    let $action = new LoopForEach({
      expression: "arr",
      variable: "var",
    });
    $action.children = {
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [{ action: "fake", success: true }],
          contextWrites: [],
        })
      ),
    };
    let $context = new Context({ arr: [1, 2, 3, 4, 5] });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(6);
    expect($result.actionReports[0].action).toBe("Loop.forEach");
    expect($result.actionReports[0].success).toBe(true);

    for (let i = 1; i < 6; i++) {
      expect($result.actionReports[i].action).toBe("fake");
    }

    expect($action.children.eval.callCount).toBe(5);
  });

  it("should pass timeouts to childrens' eval", async () => {
    let $action = new LoopForEach({
      expression: "arr",
      variable: "var",
    });
    $action.children = {
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [],
          contextWrites: [],
        })
      ),
    };
    let $context = new Context({ arr: [1, 2, 3, 4, 5] });
    await $action.eval($context, 100, 10);

    for (let i = 0; i < 5; i++) {
      expect($action.children.eval.getCall(i).args[1]).toEqual(100);
      expect($action.children.eval.getCall(i).args[2]).toEqual(10);
    }
  });

  it("should pass contextWrites for each loop", async () => {
    let $action = new LoopForEach({
      expression: "arr",
      variable: "var",
    });
    $action.children = {
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [{ action: "fake", success: true }],
          contextWrites: [{ key: "var", value: "foo" }],
        })
      ),
    };
    let $context = new Context({ arr: [1, 2, 3, 4, 5] });
    let $result = await $action.eval($context);
    expect($result.contextWrites).toEqual([
      { key: "var", value: "foo" },
      { key: "var", value: "foo" },
      { key: "var", value: "foo" },
      { key: "var", value: "foo" },
      { key: "var", value: "foo" },
    ]);
  });

  it("should return error if array does not exist", async () => {
    let $action = new LoopForEach({
      expression: "missing_arr",
      variable: "var",
    });
    $action.children = {
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [],
          contextWrites: [],
        })
      ),
    };
    let $context = new Context({ arr: [1, 2, 3, 4, 5] });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Loop.forEach");
    expect($result.actionReports[0].success).toBe(false);

    expect($action.children.eval.callCount).toBe(0);
  });

  it("should return error if argument is not an array", async () => {
    let $action = new LoopForEach({
      expression: "not_an_arr",
      variable: "var",
    });
    $action.children = {
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [],
          contextWrites: [],
        })
      ),
    };
    let $context = new Context({ not_an_arr: "Lo" });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Loop.forEach");
    expect($result.actionReports[0].success).toBe(false);
    expect(typeof $result.actionReports[0].longSummary).toBe("string");
    expect($action.children.eval.callCount).toBe(0);
  });
});
