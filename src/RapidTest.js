const axios = require("axios");
const TestExecutable = require("./models/TestExecutable");
const Context = require("./models/Context");

async function executeTest(testExecution, locationDetails) {
  let executable, context, testResult;
  let error;
  try {
    executable = new TestExecutable(JSON.parse(testExecution.test.code));
    context = new Context({
      ...testExecution.envVariables,
      ...testExecution.testVariables,
    });
    try {
      testResult = await executable.eval(
        context,
        testExecution.test.timeoutSeconds,
        testExecution.test.stepTimeoutSeconds
      );
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
    "x-forwarded-tenant-id": testExecution.testExecution.tenantId || "1", // this value comes from the testing service
  };
  if (locationDetails.locationKey) {
    headers["x-location-key"] = locationDetails.locationKey;
  }
  if (locationDetails.locationContext) {
    headers["x-location-context"] = locationDetails.locationContext;
  }

  // Send the request back to the testing service, but retry up to 10 times if it fails.
  async function reportTestResult() {
    return new Promise((resolve, reject) => {
      let retry = 1;
      const interval = setInterval(async () => {
        try {
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
          clearInterval(interval);
          resolve();
        } catch (e) {
          if (retry >= 10) {
            clearInterval(interval);
            reject(`Failed to report test execution ${testExecution.testExecution.id} (${retry}) times. Giving up.`);
          } else {
            consola.warn(
              `Failed to report test execution ${testExecution.testExecution.id} (${retry}) times. Retrying...`
            );
            retry += 1;
          }
        }
      }, 3000);
    });
  }
  await reportTestResult();
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
