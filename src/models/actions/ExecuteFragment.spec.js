const { ExecuteFragment } = require("./ExecuteFragment");
const Context = require("../Context");
const sinon = require("sinon");

describe("ExecuteFragment", () => {
  it("should return successful result and execute `children`", async () => {
    let $action = new ExecuteFragment({
      testId: "test_1234",
      inputs: {},
    });
    $action.children = {
      // fake sub-test
      eval: sinon.fake.returns({
        contextWrites: [],
        apiCalls: [{}],
        actionReports: [
          {
            action: "My.action",
            success: true,
          },
        ],
      }),
    };

    let $context = new Context({ varName: "hello" });
    let $result = await $action.eval($context);
    expect($result.actionReports[0].action).toBe("My.action");
  });

  it("should pass contextWrites array with scoped variable", async () => {
    let $action = new ExecuteFragment({
      testId: "test_1234",
      variable: "childContext",
      inputs: {},
    });
    $action.children = {
      // fake sub-test
      eval: sinon.fake.returns({
        contextWrites: [{ key: "foo", value: "bar" }],
        apiCalls: [{}],
        actionReports: [
          {
            action: "My.action",
            success: true,
          },
        ],
      }),
    };

    let $context = new Context({ varName: "hello" });
    let $result = await $action.eval($context);
    expect($result.contextWrites).toEqual([{ key: "childContext", value: { foo: "bar" } }]);
  });

  it("should not override the context when vars don't match", async () => {
    let $action = new ExecuteFragment({
      testId: "test_1234",
      inputs: {
        varName2: "bye", // varName2 != varName
      },
    });
    $action.children = {
      // fake sub-test
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [{ action: "fake", success: true }],
        })
      ),
    };

    let $context = new Context({ varName: "hello" });
    await $action.eval($context);
    expect($action.children.eval.args[0][0].data.varName).toBe("hello");
  });

  it("should override the context vars when passed", async () => {
    let $action = new ExecuteFragment({
      testId: "test_1234",
      inputs: {
        varName: "bye",
      },
    });
    $action.children = {
      // fake sub-test
      eval: sinon.spy(
        sinon.fake.returns({
          apiCalls: [],
          actionReports: [{ action: "fake", success: true }],
        })
      ),
    };

    let $context = new Context({ varName: "hello" });
    await $action.eval($context);
    expect($action.children.eval.args[0][0].data.varName).toBe("bye");
  });

  it("should create an error step if `errorFromService` is passed", async () => {
    let $action = new ExecuteFragment({
      testId: "test_1234",
      inputs: {
        varName: "bye",
      },
    });
    $action.errorFromService = "this is an error!";

    let $context = new Context({});
    let $result = await $action.eval($context);
    expect($result.actionReports[0].action).toBe("Execute.Fragment");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("this is an error!");
  });

  it("should return an error if `children` are missing", async () => {
    let $action = new ExecuteFragment({
      testId: "test_1234",
      inputs: {
        varName: "bye",
      },
    });

    let $context = new Context({});
    let $result = await $action.eval($context);
    expect($result.actionReports[0].action).toBe("Execute.Fragment");
    expect($result.actionReports[0].success).toBe(false);
    expect(typeof $result.actionReports[0].shortSummary).toBe("string");
    expect($result.actionReports[0].longSummary).toBe(null);
  });
});
