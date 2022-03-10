const { FakerGenerate } = require("./FakerGenerate");
const Context = require("../Context");

describe("FakerGenerate", () => {
  it("should properly generate a fake nad place in context", async () => {
    let $action = new FakerGenerate({
      variable: "b",
      category: "name",
      function: "firstName",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Faker.generate");
    expect($result.actionReports[0].success).toBe(true);
    expect(typeof $result.actionReports[0].shortSummary).toBe("string");
    expect(typeof $result.actionReports[0].time).toBe("number");

    // verify context write was performed
    expect(Object.keys($context.data)).toContain("b");
    expect(typeof $context.get("b")).toBe("string");
  });

  it("should fail if no category is passed", async () => {
    let $action = new FakerGenerate({
      variable: "b",
      function: "firstName",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Faker.generate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Category must be selected, got none");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should fail if category is invalid", async () => {
    let $action = new FakerGenerate({
      variable: "b",
      category: "invaliddddd",
      function: "firstName",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Faker.generate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Got invalid category invaliddddd");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should fail if no function is passed", async () => {
    let $action = new FakerGenerate({
      variable: "b",
      category: "name",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Faker.generate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Function must be selected, got none");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should fail if function is invalid", async () => {
    let $action = new FakerGenerate({
      variable: "b",
      category: "name",
      function: "invaliddddd",
    });
    let $context = new Context({ varName: 815 });
    let $result = await $action.eval($context);

    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Faker.generate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Got invalid function invaliddddd");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  describe("with parameters", () => {
    it("should generate a fake date between two years", async () => {
      let $action = new FakerGenerate({
        variable: "b",
        category: "date",
        function: "between",
        parameters: ["2011", "2012"],
      });
      let $context = new Context({ varName: 815 });
      let $result = await $action.eval($context);

      expect($result.actionReports.length).toBe(1);
      expect($result.actionReports[0].success).toBe(true);
      expect($result.actionReports[0].shortSummary).not.toContain("Invalid");
    });

    it("should pass a string value", async () => {
      let $action = new FakerGenerate({
        variable: "b",
        category: "date",
        function: "between",
        parameters: ['"10/22/2011"', 2012],
      });
      let $context = new Context({ varName: 815 });
      let $result = await $action.eval($context);

      expect($result.actionReports[0].shortSummary).not.toContain("Invalid");
    });

    it.only("should pass undefined for missing params", async () => {
      let $action = new FakerGenerate({
        variable: "b",
        category: "date",
        function: "betweens",
        parameters: ["2010", "", 11],
      });
      let $context = new Context({ varName: 815 });
      let $result = await $action.eval($context);
      expect($result.actionReports[0].shortSummary).toContain("Invalid");
      const commas = $result.actionReports[0].shortSummary.split(",");
      expect(commas.length).toBe(11);
    });
  });
});
