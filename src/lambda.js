const Sentry = require("@sentry/serverless");
const { execute } = require("./main");
const consola = require("consola");

Sentry.AWSLambda.init({
  dsn: "https://b80a6e238d5d49b7a50010335621e8e8@o493232.ingest.sentry.io/5566344",
  environment: process.env.NODE_ENV || "production",
});
exports.handler = Sentry.AWSLambda.wrapHandler(async (event, context) => {
  consola.log("Running the worker as an AWS lambda function");
  await execute();
});
