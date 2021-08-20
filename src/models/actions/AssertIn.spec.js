const { AssertIn } = require("./AssertIn");
const Context = require("../Context");

describe("AssertIn", () => {
  it("should return successful result when the value exists in the array of options", async () => {
    let $action = new AssertIn({
      expression: "airport",
      value: ["LAX", "SFO", "LHR", "TLV"],
    });
    let $context = new Context({ airport: "LHR" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.in");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('Value for airport ("LHR") exists in array of options');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when the value doesnt exist in the array of options", async () => {
    let $action = new AssertIn({
      expression: "airport",
      value: ["LAX", "SFO", "LHR", "TLV"],
    });
    let $context = new Context({ airport: "ORD" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.in");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe(
      'airport is "ORD", expected an element from (LAX, SFO, LHR, TLV)'
    );
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when getting an empty array of options", async () => {
    let $action = new AssertIn({
      expression: "airport",
      value: [],
    });
    let $context = new Context({ airport: "ORD" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.in");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe('airport is "ORD", expected an element from ()');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result when no array is recieved", async () => {
    let $action = new AssertIn({
      expression: "airport",
    });
    let $context = new Context({ airport: "ORD" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.in");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Value supplied is not an array");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return failed result value parameter is not an array", async () => {
    let $action = new AssertIn({
      expression: "airport",
      value: 3,
    });
    let $context = new Context({ airport: "ORD" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.in");
    expect($result.actionReports[0].success).toBe(false);
    expect($result.actionReports[0].shortSummary).toBe("Value supplied is not an array");
    expect(typeof $result.actionReports[0].time).toBe("number");
  });

  it("should return successful result when the value exists in the array of options - which is passed in string form", async () => {
    let $action = new AssertIn({
      expression: "airport",
      value: '["LAX", "SFO", "LHR", "TLV"]',
    });
    let $context = new Context({ airport: "LHR" });

    let $result = await $action.eval($context);
    expect($result.actionReports.length).toBe(1);
    expect($result.actionReports[0].action).toBe("Assert.in");
    expect($result.actionReports[0].success).toBe(true);
    expect($result.actionReports[0].shortSummary).toBe('Value for airport ("LHR") exists in array of options');
    expect(typeof $result.actionReports[0].time).toBe("number");
  });
});

// describe('AssertEquals', () => {
//     it('should return successful result when the values are equal', async() => {
//         let $action = new AssertEquals({
//             expression: 'varName',
//             value: 815
//         });
//         let $context = new Context({varName: 815});

//         let $result = await $action.eval($context);
//         expect($result.actionReports.length).toBe(1);
//         expect($result.actionReports[0].action).toBe('Assert.equals');
//         expect($result.actionReports[0].success).toBe(true);
//         expect($result.actionReports[0].shortSummary).toBe('varName == "815"');
//         expect(typeof $result.actionReports[0].time).toBe('number');
//     });

//     it('should return failed result when the values are not equal', async() => {
//         let $action = new AssertEquals({
//             expression: 'varName',
//             value: 815
//         });
//         let $context = new Context({varName: 800});

//         let $result = await $action.eval($context);
//         expect($result.actionReports.length).toBe(1);
//         expect($result.actionReports[0].action).toBe('Assert.equals');
//         expect($result.actionReports[0].success).toBe(false);
//         expect($result.actionReports[0].shortSummary).toBe("varName is \"800\", expected \"815\"");
//         expect(typeof $result.actionReports[0].time).toBe('number');
//     });

//     it('should return failed result when the variable does not exist', async() => {
//         let $action = new AssertEquals({
//             expression: 'varName',
//             value: 815
//         });
//         let $context = new Context({});

//         let $result = await $action.eval($context);
//         expect($result.actionReports.length).toBe(1);
//         expect($result.actionReports[0].action).toBe('Assert.equals');
//         expect($result.actionReports[0].success).toBe(false);
//         expect($result.actionReports[0].shortSummary).toBe("Key varName not found");
//         expect(typeof $result.actionReports[0].time).toBe('number');
//     });
// });
