"use strict";

const core = require("@actions/core");

async function main() {
  const pkg = require("../../../package.json");
  core.setOutput("package_version", pkg.version);
}

main().catch((error) => {
  core.setFailed(error.message);
});
