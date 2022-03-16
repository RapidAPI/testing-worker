const { recursiveReplace } = require("./utils");
const axios = require("axios");
const Context = require("./models/Context");
const { Http } = require("./models/actions/Http");
const consola = require("consola");
const { pick } = require("./utils");

const fetchRequests = async ({ baseUrl, locationSecret, locationKey, locationContext, batchSize, logging }) => {
  let requests = [];
  if (logging) consola.info(`Getting requests from ${baseUrl}/api/location/request?amount=${batchSize}`);
  const headers = {
    "x-location-secret": locationSecret,
  };
  headers["x-location-key"] = locationKey;

  if (locationContext) {
    headers["x-location-context"] = locationContext;
  }
  let requestsResponse = (
    await axios.get(`${baseUrl}/api/location/request?amount=${batchSize}`, {
      headers,
      timeout: 15000,
    })
  ).data;
  requests = requestsResponse["requests"];
  if (requests === undefined) {
    throw new Error("Response from service is incorrect, check the 'BASE_URL'");
  }
  return requests;
};

const sendRequestResult = async (
  request,
  response,
  executionTime,
  { baseUrl, locationSecret, locationKey, locationContext }
) => {
  const headers = {
    "x-location-secret": locationSecret,
    "x-forwarded-tenant-id": request.tenantId || "1", // this value comes from the testing service
  };
  headers["x-location-key"] = locationKey;
  if (locationContext) {
    headers["x-location-context"] = locationContext;
  }
  try {
    await axios.post(
      `${baseUrl}/api/location/request/${request.id}`,
      {
        response,
        executionTime,
      },
      {
        headers,
        timeout: 15000,
      }
    );
  } catch (e) {
    // eslint-disable-next-line
    console.log(e);
  }
};

const processRequest = async (req) => {
  const mockContext = new Context({});
  req.payload = req.data;
  const action = new Http(req);
  const result = await action.eval(mockContext);
  const executionTime = result.actionReports && result.actionReports.length > 0 && result.actionReports[0].time;
  if (!result.response) {
    // Cases where the DNS can not resolve or we don't get a response from the server.
    return {
      response: {
        // This is not entirely correct, but the testing endpoint requires a response object
        // with a statue code when posting back to the service.
        data: "Server did not return a response",
        status: 500,
        headers: {},
      },
      executionTime,
    };
  } else {
    return {
      response: pick(result.response || {}, ["data", "headers", "status"]),
      executionTime,
    };
  }
};

const executeRequest = async (request) => {
  const context = new Context({
    ...(request.envVariables || {}),
    ...(request.testVariables || {}),
  });
  const transformedRequest = recursiveReplace(request.request, context.data);

  return await processRequest(transformedRequest);
};

const executeAndSendRequest = async (request, locationDetails) => {
  const { response, executionTime } = await executeRequest(request);
  return sendRequestResult(request, response, executionTime, locationDetails);
};

const fetchAndExecuteRequests = async (locationDetails) => {
  const requests = await fetchRequests(locationDetails);
  if (locationDetails.logging) {
    // eslint-disable-next-line
    console.log(requests);
  }
  await Promise.all(
    requests.map((request) => {
      try {
        return executeAndSendRequest(request, locationDetails);
      } catch (e) {
        // eslint-disable-next-line
        console.error(e);
      }
    })
  );
  if (locationDetails.logging) consola.success(`Executed ${requests.length} requests\n`);
};

module.exports = {
  fetchAndExecuteRequests,
  executeRequest,
};
