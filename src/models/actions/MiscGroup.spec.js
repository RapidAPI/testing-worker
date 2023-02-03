const { MiscGroup } = require("./MiscGroup");
const Context = require("../Context");
const sinon = require("sinon");

describe("MiscGroup", () => {
  it("should pass contextWrites from child eval", async () => {
    let $action = new MiscGroup({});
    $action.children = {
      eval: sinon.fake.returns({
        apiCalls: [],
        actionReports: [],
        contextWrites: [{ key: "var", value: "foo" }],
      }),
    };
    let $context = new Context({});
    let $result = await $action.eval($context);
    expect($result.contextWrites).toEqual([{ key: "var", value: "foo" }]);
  });

  it("should pass context and timeouts to child eval", async () => {
    let $action = new MiscGroup({});
    $action.children = {
      eval: sinon.stub(),
    };
    let $context = new Context({ a: 1 });
    await $action.eval($context, 100, 10);
    expect($action.children.eval.getCall(0).args[0].data).toEqual({ a: 1 });
    expect($action.children.eval.getCall(0).args[1]).toEqual(100);
    expect($action.children.eval.getCall(0).args[2]).toEqual(10);
  });
});
