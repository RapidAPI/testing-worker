const { recursiveReplace } = require("../utils");

const FINISHED_EXECUTION = 0;
const TIMEOUT = 1;

const actionClasses = {
  "Http.get": require("./actions/Http").HttpGet,
  "Http.post": require("./actions/Http").HttpPost,
  "Http.put": require("./actions/Http").HttpPut,
  "Http.patch": require("./actions/Http").HttpPatch,
  "Http.delete": require("./actions/Http").HttpDelete,
  "Http.request": require("./actions/Http").Http,
  "Assert.equals": require("./actions/AssertEquals").AssertEquals,
  "Assert.different": require("./actions/AssertDifferent").AssertDifferent,
  "Assert.type": require("./actions/AssertType").AssertType,
  "Assert.exists": require("./actions/AssertExists").AssertExists,
  "Assert.in": require("./actions/AssertIn").AssertIn,
  "Loop.forEach": require("./actions/LoopFor").LoopForEach,
  "Set.variable": require("./actions/SetVariable").SetVariable,
  "Logic.if": require("./actions/LogicIf").LogicIf,
  "Code.run": require("./actions/CodeRun").CodeRun,
  "Json.validate": require("./actions/JsonValidate").JsonValidate,
  "Misc.group": require("./actions/MiscGroup").MiscGroup,
  "Faker.generate": require("./actions/FakerGenerate").FakerGenerate,
  "JWT.encode": require("./actions/JWTEncode").JWTEncode,
  "JWT.decode": require("./actions/JWTDecode").JWTDecode,
  "Assert.greater_equal": require("./actions/AssertGreaterEqual").AssertGreaterEqual,
  "Assert.smaller_equal": require("./actions/AssertSmallerEqual").AssertSmallerEqual,
  "Connector.database": require("./actions/Database").Database,
  "Execute.Fragment": require("./actions/ExecuteFragment").ExecuteFragment,
};

class TestExecutable {
  constructor(steps = []) {
    // turn steps list into material execution classes
    let actions = [];

    for (let step of steps || []) {
      if (Object.keys(actionClasses).indexOf(step.action) < 0) {
        throw Error(
          `No action of type '${step.action}'). Your worker might be outdated. \
          Please update to the latest worker version.`
        );
      }
      let MaterialClass = actionClasses[step.action];
      let materialStep = new MaterialClass(step.parameters);
      materialStep.action = step.action;
      materialStep.errorFromService = step.errorFromService || null; // used to force a pre-execution error from the testing service.

      if (Object.prototype.hasOwnProperty.call(step, "children")) {
        materialStep.children = new TestExecutable(step.children);
      }
      actions.push(materialStep);
    }
    this.actions = actions;
  }

  async eval(context, timeoutSeconds = 300, stepTimeoutSeconds = 15) {
    var cancelled = false;

    let actions = this.actions.map((a) => Object.assign(Object.create(Object.getPrototypeOf(a)), a)); //deep clone actions so parameter materialization is scoped

    let _apiCalls = [];
    let _actionReports = [];
    let timeoutId;

    // TIMING
    const { performance } = require("perf_hooks");
    const t0 = performance.now();

    let timeoutTimer = new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        cancelled = true;
        resolve(TIMEOUT);
      }, timeoutSeconds * 1000);
    });

    const totalContextWrites = [];
    let testExecution = (async () => {
      for (let action of actions) {
        if (cancelled) {
          break;
        }
        // 1. materialize parameters -- recursive replace based on context

        const originalParameters = { ...action.parameters };
        action.updateParameters(recursiveReplace(originalParameters, context.data));
        action.updateSafeParameters(recursiveReplace(originalParameters, context.safeData));

        let result = { contextWrites: [], apiCalls: [], actionReports: [] };
        //2. evaluate action
        try {
          result = Object.assign(result, await action.eval(context, stepTimeoutSeconds));
        } catch (e) {
          result.actionReports = [
            {
              action: action.action,
              success: false,
              shortSummary: e.message,
              longSummary: null,
              time: 0,
            },
          ];
        }

        //3. append apiCalls and actionReports to lof
        _apiCalls = [..._apiCalls, ...result.apiCalls];
        _actionReports = [..._actionReports, ...result.actionReports];

        //4. perform context writes
        for (let cw of result.contextWrites) {
          context.set(cw.key, cw.value);
        }

        // 5. Pass up the context. In most cases this will be redundant; however,
        // this does need to bubble to the top for child tests to be correctly scoped
        // into a parent.
        totalContextWrites.push(...result.contextWrites);
      }
      // Clear the timeout or else the lambda will hang around until it finishes which is not
      // ideal for default workers without a frequency value.
      clearTimeout(timeoutId);
      return FINISHED_EXECUTION;
    })();
    let result = await Promise.race([timeoutTimer, testExecution]);
    //TIMING
    const t1 = performance.now();
    const elapsedTime = t1 - t0;

    //OVERALL SUCCESS
    let success = _actionReports.filter((a) => a.success == false).length == 0 && result === FINISHED_EXECUTION;
    let _finalReport = _actionReports;

    if(actions.length > _actionReports.length){
      _finalReport = actions.map((e, i) => {
        if(_actionReports[i]){
          return  _actionReports[i];
        }
        return {
          action: e.action,
          success: false,
          shortSummary: i === _actionReports.length ?  `Timed out - Steps timeout in ${stepTimeoutSeconds}s`: "Cancelled due to previous step timing out",
          longSummary: null,
          time: i === _actionReports.length  ?  stepTimeoutSeconds * 1000 : 0
        };
      });
    }

    return {
      contextWrites: totalContextWrites, // optional
      apiCalls: _apiCalls,
      actionReports: _finalReport,
      elapsedTime,
      success,
      timedOut: result === TIMEOUT,
    };
  }
}

module.exports = TestExecutable;
