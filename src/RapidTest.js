const axios = require("axios");
const TestExecutable = require("./models/TestExecutable");
const Context = require("./models/Context");

async function executeTest(testExecution, locationDetails) {
  let executable, context, testResult;
  let error;
  try {
    executable = new TestExecutable(JSON.parse(testExecution.test.code));
    context = new Context(
      {
        ...testExecution.envVariables,
        ...testExecution.testVariables,
      },
      testExecution.envSecrets // used to mask sensitive context data in the report
    );
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
    if (testResult) {
      // remove internal data not to be returned to the service
      delete testResult.contextWrites;
    } else {
      testResult = {
        apiCalls: [],
        elapsedTime: 0,
        success: false,
        error: error?.message,
        actionReports: [],
        timedOut: false,
      };
    }
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

  function sendToService(result, execution, headers) {
    return axios.post(
      // eslint-disable-next-line
      `${locationDetails.baseUrl}/api/location/${locationDetails.locationKey}/execution/${execution.testExecution.id}`,
      {
        result,
        api: execution.test.api,
        apiParentOwnerId: execution.apiParentOwnerId,
      },
      {
        headers,
        timeout: 10000,
      }
    );
  }

  // Send the request back to the testing service, but retry up to 4 more times if it fails.
  async function reportTestResult() {
    return new Promise((resolve, reject) => {
      let retry = 1;
      sendToService(testResult, testExecution, headers)
        .then(() => {
          resolve();
        })
        .catch(async () => {
          const interval = setInterval(async () => {
            try {
              consola.warn(
                `Failed to report test execution ${testExecution.testExecution.id} (${retry}) times. Retrying...`
              );
              await sendToService(testResult, testExecution, headers);
              clearInterval(interval);
              resolve();
            } catch (e) {
              if (retry >= 4) {
                clearInterval(interval);
                // eslint-disable-next-line max-len
                reject(
                  `Failed to report test execution ${testExecution.testExecution.id} (${retry}) times. Giving up.\n${e}`
                );
              } else {
                retry += 1;
              }
            }
          }, 1000);
        });
    });
  }
  await reportTestResult();
}

async function fetchAndExecuteTests({ baseUrl, locationSecret, locationKey, locationContext, batchSize, logging }) {
  let testExecutions = [];
  const headers = {
    "x-location-secret": locationSecret,
  };
  if (locationKey) {
    headers["x-location-key"] = locationKey;
  }
  if (locationContext) {
    headers["x-location-context"] = locationContext;
  }

  if (logging) {
    consola.info(`Getting executions....`);
  }

  let executionsResponse = (
    await axios.get(`${baseUrl}/api/location/executable?amount=${batchSize}`, {
      headers,
      timeout: 5000,
    })
  ).data;

  testExecutions = executionsResponse["testExecutions"];

  if (logging) {
    consola.info(`Fetched ${testExecutions.length} executions`);
  }

  if (logging) {
    if (testExecutions.length > 0) {
      consola.info(`Processing executions for ${baseUrl}:\n`);
      // Just log the execution and not the whole object as it contains raw passwords
      consola.info(testExecutions.map((execution) => execution.testExecution));
    }
  }

  await Promise.all(
    testExecutions.map((testExecution) => {
      if (!testExecution) {
        consola.error("testExecution is null");
      } else {
        try {
          return executeTest(testExecution, { baseUrl, locationSecret, locationKey, locationContext, batchSize });
        } catch (e) {
          consola.error(e);
        }
      }
    })
  );

  if (logging) {
    if (testExecutions.length > 0) {
      consola.success(`Executed ${testExecutions.length} test executions\n`);
    }
  }
}

module.exports = {
  fetchAndExecuteTests,
};
