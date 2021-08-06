```
Usage: testing-worker [options]

Start worker to execute RapidAPI tests and requests

Options:
  -V, --version                output the version number
  -b, --base <base>            The base URL to fetch executions from (default: "https://rapidapi.com/testing")
  -s, --secret <secret>        Location secret for fetching executions
  -k, --key <key>              Location key for fetching executions. Must match secret.
  -c, --context <context>      API context (user ID or organization ID) for fetching executions
  -i, --frequency <frequency>  ms interval between fetching new tests executions. If the frequency is undefined, the worker will only execute once. (default: undefined)
  -m, --max <max>              The max amount of ms to run intervals. If this is undefined, the worker will continue to run until the process is terminated. (default: undefined)
  -b, --batch <batch>          The number of test executions to process each interval (default: 100)
  -h, --help                   display help for command
```
