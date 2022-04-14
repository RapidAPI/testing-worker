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
});
