# RapidAPI Testing Workers

API Tests in RapidAPI Testing are executed by **_workers_**. By default, the workers executing your tests live in RapidAPI cloud. However, there are instances where you might want to run a worker locally (for example, calling "localhost" APIs, connecting to a local database, etc.). In order to satisfy these use cases, you can install + run a RapidAPI Testing Worker locally.

## Installing Workers Locally

RapidAPI Testing Worker is available as a package on NPM. You can install RapidAPI Testing workers locally through one of the following methods.

#### Install from the command line

```
npm install -g @rapidapi/testing-worker
```

## Running Workers with Examples

Once you have successfully installed a testing worker on your machine, you can run it by executing `testing-worker` command along with the appropriate options.

### Syntax

```
npx testing-worker [options]
```

### Options

##### `-s, --secret <secret>` (**Required**)

Location secret from which the worker will fetch executions. This is the location secret that you will use to add the worker to the UI.

##### `-k, --key <key>` (**Required**)

Location key for fetching executions. Must match secret.

##### `-c, --context <context>` (**Required**)

API context (user ID or organization ID) for fetching executions

##### `-f, --frequency <frequency>` (**Optional; default is undefined**)

Frequency in which the worker should fetch new test executions, set as period interval in ms. For example, setting frequency as 5000 ms means that new tests will be fetched every 5000 ms. If the frequency is _undefined_ (as is the default), the worker will only fetch new tests once. Please note that with frequency less than 2000 ms, you may get 429 (rate limiting) errors.

##### `-m, --max <max>` (**Optional; default is undefined**)

The amount of time in ms that the worker is going to be active. For example, setting max as 10000 ms means that the worker will be active for 10000 ms, and then exits. Any tests triggered after the worker exists will not be executed until a new worker is started. If max is _undefined_ (as is the default), the worker will continue to run until the process is terminated.

##### `-u, --url <baseUrl>` (**Optional**)

The base URL to fetch executions from (default: "https://rapidapi.com/testing")

##### `-b, --batch <batch>`(**Optional; default is 100**)

You can use this to control the number of test executions to process on each interval.

##### `-V, --version`

Retrieve the version number.

##### `-h, --help`

Display help content for the command.

#####  `-l, --logging`

Use "on", "off" or "cli". "cli" will show additional information at start up.

#####  `--ignore-ssl`

Ignore missing SSL certificates for https requests.

### Example

Below command will run a RapidAPI Testing Worker that fetches 200 new tests every 5 seconds from location queue `3866fd2aaeb474a76fdf236062660fb31df234b8`, defined for context `1234567`, with location key as `custom_worker`.

```
testing-worker -s 3866fd2aaeb474a76fdf236062660fb31df234b8 -k custom_worker -c 1234567 --frequency 5000 --batch 200
```

## Environment variables.

Alternately, you can start the worker with preset env vars and omit the command options entirely.

**The following env vars are supported:**

- `BASE_URL`
- `LOCATION_KEY`
- `LOCATION_SECRET`
- `LOCATION_CONTEXT`
- `FREQUENCY`
- `POLLING_TIME_MAX`
- `BATCH_SIZE`
- `WORKER_LOGGING`
- `IGNORE_MISSING_SSL_CERT`

Once loaded, you can start the work without the command options:

```
testing-worker
```
