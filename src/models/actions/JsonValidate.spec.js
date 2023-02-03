const { JsonValidate } = require("./JsonValidate");
const Context = require("../Context");

describe("JsonValidate", () => {
  it("should return successful result when JSON is valid against supplied schema", async () => {
    let $action = new JsonValidate({
      expression: "foo",
      schema: JSON.stringify({
        type: "object",
        properties: {
          ok: { type: "string" },
        },
      }),
    });

    let $context = new Context({ foo: { ok: "kito kato" } });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Json.validate");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe("JSON at foo passed validation");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failure result when JSON is not-valid against supplied schema", async () => {
    let $action = new JsonValidate({
      expression: "foo",
      schema: JSON.stringify({
        type: "object",
        properties: {
          ok: { type: "string" },
        },
      }),
    });

    let $context = new Context({ foo: { ok: 5 } });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Json.validate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("JSON at foo failed validation");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failure result when supplied value is not JSON at all", async () => {
    let $action = new JsonValidate({
      expression: "foo",
      schema: JSON.stringify({
        type: "object",
        properties: {
          ok: { type: "string" },
        },
      }),
    });

    let $context = new Context({ foo: 15 });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Json.validate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("JSON at foo failed validation");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failure result when JSON object does not exist in context", async () => {
    let $action = new JsonValidate({
      expression: "foo",
      schema: JSON.stringify({
        type: "object",
        properties: {
          ok: { type: "string" },
        },
      }),
    });

    let $context = new Context({});

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Json.validate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Key foo not found");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failure result when schema is not valid json", async () => {
    let $action = new JsonValidate({
      expression: "foo",
      schema: "Adasd",
    });

    let $context = new Context({ foo: { ok: 5 } });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Json.validate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Schema supplied is not valid json");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should fail result when the formatter validation fails", async () => {
    let $action = new JsonValidate({
      expression: "foo",
      schema: JSON.stringify({
        type: "object",
        properties: {
          address: {
            type: "string",
            format: "ipv4",
          },
        },
      }),
    });

    let $context = new Context({ foo: { address: "1.1.1.900" } });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Json.validate");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("JSON at foo failed validation");
    const formatterError = JSON.parse($result.actionReports[0].longSummary).errors[0].message;
    expect(formatterError).toBe('must match format "ipv4"');
  });
});
