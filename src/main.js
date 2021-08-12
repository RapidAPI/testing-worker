const { fetchAndExecuteRequests } = require("./RapidRequest");
const { fetchAndExecuteTests } = require("./RapidTest");
const models = require("./models");
const utils = require("./utils");
const RapidRequest = require("./RapidRequest");
const RapidTest = require("./RapidTest");

async function execute(overwriteDetails = {}) {
  const locationSecret = overwriteDetails.locationSecret || process.env.KEY || process.env.LOCATION_SECRET;
  const locationKey = overwriteDetails.locationKey || process.env.LOCATION || process.env.LOCATION_KEY;
  const locationContext = overwriteDetails.locationContext || process.env.CONTEXT || process.env.LOCATION_CONTEXT;

  const baseUrl = overwriteDetails.baseUrl || process.env.URL || process.env.BASE_URL;
  const batchSize = process.env.BATCH_SIZE || 100;
  const logging = overwriteDetails != undefined ? overwriteDetails.logging : true;

  if (!baseUrl) throw new Error(`URL environment variable not found nor given as command line argument (required)`);
  if (!locationSecret)
    throw new Error(
      `Neither KEY nor LOCATION_SECRET environment variable found nor given as command line argument (required)`
    );
  if (!locationKey)
    throw new Error(
      `Neither LOCATION nor LOCATION_KEY environment variable found nor given as command line argument (required)`
    );

  await fetchAndExecuteRequests({ baseUrl, locationSecret, locationKey, locationContext, batchSize, logging });
  await fetchAndExecuteTests({ baseUrl, locationSecret, locationKey, locationContext, batchSize, logging });
}

module.exports = {
  execute,
  models,
  utils,
  RapidRequest,
  RapidTest,
};
