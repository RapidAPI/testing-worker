const axios = require("axios");
const TestExecutable = require("./models/TestExecutable");
const Context = require("./models/Context");

async function executeTest(testExecution, locationDetails) {
  let executable, context, testResult;
  let error;
  try {
    executable = new TestExecutable(JSON.parse(testExecution.test.code));
    context = new Context({
      c: "a",
      ...testExecution.testVariables,
      ...testExecution.envVariables,
    });
    try {
      testResult = await executable.eval(context, testExecution.test.timeoutSeconds);
    } catch (e) {
      consola.warn("Failed to execute test");
      consola.warn(e);
      error = e;
    }
  } catch (e) {
    consola.error("Failed to build test");
    consola.error(e);
    error = e;
  } finally {
    testResult = testResult || {
      apiCalls: [],
      elapsedTime: 0,
      success: false,
      error: error?.message,
      actionReports: [],
      timedOut: false,
    };
  }

  const headers = {
    "x-location-secret": locationDetails.locationSecret,
    "x-tenant-id": testExecution.tenantId || "1", // this value comes from the testing service
  };
  if (locationDetails.locationKey) {
    headers["x-location-key"] = locationDetails.locationKey;
  }
  if (locationDetails.locationContext) {
    headers["x-location-context"] = locationDetails.locationContext;
  }

  await axios.post(
    // eslint-disable-next-line
    `${locationDetails.baseUrl}/api/location/${locationDetails.locationKey}/execution/${testExecution.testExecution.id}`,
    {
      result: testResult,
      api: testExecution.test.api,
      apiParentOwnerId: testExecution.apiParentOwnerId,
    },
    {
      headers,
      timeout: 15000,
    }
  );
}

async function fetchAndExecuteTests({ baseUrl, locationSecret, locationKey, locationContext, batchSize, logging }) {
  let testExecutions = [];
  if (logging) consola.info(`Getting test executions from ${baseUrl}/api/location/executable?amount=${batchSize}`);
  const headers = {
    "x-location-secret": locationSecret,
  };
  if (locationKey) {
    headers["x-location-key"] = locationKey;
  }
  if (locationContext) {
    headers["x-location-context"] = locationContext;
  }
  let executionsResponse = (
    await axios.get(`${baseUrl}/api/location/executable?amount=${batchSize}`, {
      headers,
    })
  ).data;
  testExecutions = executionsResponse["testExecutions"];

  if (logging) consola.info("Test executions:\n");
  // eslint-disable-next-line
  if (logging) console.info(testExecutions);

  await Promise.all(
    testExecutions.map((testExecution) => {
      if (!testExecution) {
        // eslint-disable-next-line
        console.error("testExecution is null");
      } else {
        try {
          return executeTest(testExecution, { baseUrl, locationSecret, locationKey, locationContext, batchSize });
        } catch (e) {
          // eslint-disable-next-line
          console.error(e);
        }
      }
    })
  );

  if (logging) consola.success(`Executed ${testExecutions.length} test executions\n`);
}

module.exports = {
  fetchAndExecuteTests,
};
