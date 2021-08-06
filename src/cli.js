#!/usr/bin/env node

const consola = require("consola");
const { execute } = require("./main");
const { program } = require("commander");

if (require.main === module) {
  program.version("0.0.1");
  // start agent
  program
    .description("Start worker to execute RapidAPI tests and requests")
    .requiredOption(
      "-b, --base <base>",
      "The base URL to fetch executions from",
      process.env.BASE_URL || process.env.URL || "https://rapidapi.com/testing"
    )
    .requiredOption(
      "-s, --secret <secret>",
      "Location secret for fetching executions",
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
      "-i, --frequency <frequency>",
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
    );

  program.parse();
  const cmd = program.opts();

  consola.log("Starting a the worker from the CLI with the following settings:\n");
  consola.log(`RapidAPI Testing base URL <base>: ${cmd.base}`);
  consola.log(`RapidAPI Testing location secret <secret>: ${cmd.secret.substr(0, 3)}********`);
  consola.log(`RapidAPI Testing location key <key>: ${cmd.key}`);
  consola.log(`RapidAPI Testing context (user or organization ID) <context>: ${cmd.context}`);
  consola.log(`Frequency the worker will poll for new test/requests to be executed <frequency>: ${cmd.frequency}`);
  consola.log(`Maximum time this worker will keep polling for tests/requests <max>: ${cmd.max}`);
  consola.log(`Number of requests/tests to dequeue on each interval <max>: ${cmd.batch}`);

  const START_TIMESTAMP = Date.now();

  const settings = {
    baseUrl: cmd.base,
    locationSecret: cmd.secret,
    locationKey: cmd.key,
    locationContext: cmd.context === "Default" ? undefined : cmd.context,
    batchSize: cmd.batch,
  };
  execute(settings).catch((err) => {
    consola.error(err);
  });
  if (cmd.frequency) {
    setInterval(() => {
      if (parseInt(cmd.max)) {
        let currentTimestamp = Date.now();
        if (currentTimestamp > parseInt(START_TIMESTAMP) + parseInt(cmd.max)) {
          process.exit(0);
        }
      }
      execute(settings).catch((err) => {
        consola.error(err);
      });
    }, cmd.frequency);
  }
}
