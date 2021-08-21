#!/usr/bin/env node

const axios = require("axios");

const { fetchAndExecuteRequests } = require("./RapidRequest");
const { fetchAndExecuteTests } = require("./RapidTest");
const models = require("./models");
const utils = require("./utils");
const RapidRequest = require("./RapidRequest");
const RapidTest = require("./RapidTest");

const consola = require("consola");
const { program } = require("commander");
const pjson = require("../package.json");

if (require.main === module) {
  execute("cli");
}

async function execute(logLevel = "on") {
  program.version(pjson.version);
  program
    .description("Start worker to execute RapidAPI tests and requests")
    .requiredOption(
      "-u, --url <baseUrl>",
      "The base URL to fetch executions from (env variable: BASE_URL)",
      process.env.BASE_URL || process.env.URL || "https://rapidapi.com/testing"
    )
    .requiredOption(
      "-s, --secret <secret>",
      "Location secret for fetching executions ",
      process.env.LOCATION_SECRET || process.env.KEY
    )
    .requiredOption(
      "-k, --key <key>",
      "Location key for fetching executions. Must match secret.",
      process.env.LOCATION_KEY || process.env.LOCATION
    )
    .requiredOption(
      "-c, --context <context>",
      "API context (user ID or organization ID) for fetching executions",
      process.env.LOCATION_CONTEXT
    )
    .option(
      "-f, --frequency <frequency>",
      "ms interval between fetching new tests executions. If the frequency is undefined, the worker will only execute once. (default: undefined)",
      process.env.FREQUENCY || process.env.INTERVAL
    )
    .option(
      "-m, --max <max>",
      "The max amount of ms to run intervals. If this is undefined, the worker will continue to run until the process is terminated. (default: undefined)",
      process.env.POLLING_TIME_MAX
    )
    .option(
      "-b, --batch <batch>",
      "The number of test executions to process each interval",
      process.env.BATCH_SIZE || 100
    )
    .option(
      "-l, --logging <logging>",
      "The number of test executions to process each interval",
      process.env.WORKER_LOGGING || logLevel
    );

  program.parse();
  const cmd = program.opts();

  const logging = cmd.logging === "on" || cmd.logging === "cli";

  if (cmd.logging === "cli") {
    consola.info("Starting a the worker from the CLI with the following settings:\n");
    consola.info(`RapidAPI Testing base URL <url>: ${cmd.url}`);
    consola.info(`RapidAPI Testing location secret <secret>: ${cmd.secret.substr(0, 3)}********`);
    consola.info(`RapidAPI Testing location key <key>: ${cmd.key}`);
    consola.info(`RapidAPI Testing context (user or organization ID) <context>: ${cmd.context}`);
    consola.info(`Frequency the worker will poll for new test/requests to be executed <frequency>: ${cmd.frequency}`);
    consola.info(`Maximum time this worker will keep polling for tests/requests <max>: ${cmd.max}`);
    consola.info(`Number of requests/tests to dequeue on each interval <max>: ${cmd.batch}\n`);
  }

  const settings = {
    baseUrl: cmd.url,
    locationSecret: cmd.secret,
    locationKey: cmd.key,
    locationContext: cmd.context === "Default" ? undefined : cmd.context,
    batchSize: cmd.batch,
    logging,
  };

  const START_TIMESTAMP = Date.now();

  let cycle = 1;
  if (logging) console.log(`Staring cycle ${cycle++}`);
  try {
    await executeOnce(settings);
  } catch (err) {
    consola.error(err);
  }
  if (cmd.frequency) {
    const interval = setInterval(async function () {
      if (parseInt(cmd.max)) {
        let currentTimestamp = Date.now();
        if (currentTimestamp > parseInt(START_TIMESTAMP) + parseInt(cmd.max)) {
          clearInterval(interval);
        }
      }
      if (logging) console.log(`Staring cycle ${cycle++}`);
      try {
        await executeOnce(settings);
      } catch (err) {
        consola.error(err);
      }
    }, cmd.frequency);
  }
}

async function executeOnce(overwriteDetails = {}) {
  axios.defaults.headers.common["x-rapidapi-location"] = overwriteDetails.locationKey;
  await fetchAndExecuteRequests(overwriteDetails);
  await fetchAndExecuteTests(overwriteDetails);
}

module.exports = {
  execute,
  executeOnce,
  models,
  utils,
  RapidRequest,
  RapidTest,
};
