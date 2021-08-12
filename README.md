# RapidAPI Testing Workers
API Tests in RapidAPI Testing are executed by ***workers***. By default, the workers executing your tests live in RapidAPI cloud. However, there are instances where you might want to run a worker locally (for example, calling "localhost" APIs, connecting to a local database, etc.). In order to satisfy these use cases, you can install + run a RapidAPI Testing Worker locally. For more information on working with GitHub packages, see [this article](https://docs.github.com/en/enterprise-server@2.22/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

## Installing Workers Locally
RapidAPI Testing Worker is available as a package in GitHub. You can install RapidAPI Testing workers locally through one of the following methods.

#### Install from the command line
```
npm install -g @rapidapi/testing-worker@0.0.3
```

#### Install via package.json
```json
"@rapidapi/testing-worker": "0.0.3"
```


## Running Workers with Examples
Once you have successfully installed a testing worker on your machine, you can run it by executing `testing-worker` command along with the appropriate options. 

### Syntax
```
testing-worker [options]
```

### Options

##### ```-s, --secret <secret>``` (**Required**)

Location secret from which the worker will fetch executions. This is the location secret that you will use to add the worker to the UI.

##### ```-k, --key <key>``` (**Required**)

Location key for fetching executions. Must match secret.

##### ```-c, --context <context>``` (**Required**)

API context (user ID or organization ID) for fetching executions

##### ```-f, --frequency <frequency>``` (**Optional; default is undefined**)

Frequency in which the worker should fetch new test executions, set as period interval in ms. For example, setting frequency as 5000 ms means that new tests will be fetched every 5000 ms. If the frequency is _undefined_ (as is the default), the worker will only fetch new tests once. Please note that with frequency less than 2000 ms, you may get 429 (rate limiting) errors. 

##### ```-m, --max <max>``` (**Optional; default is undefined**)

The amount of time in ms that the worker is going to be active. For example, setting max as 10000 ms means that the worker will be active for 10000 ms, and then exits. Any tests triggered after the worker exists will not be executed until a new worker is started. If max is _undefined_ (as is the default), the worker will continue to run until the process is terminated. 

##### ```-u, --url <baseUrl>``` (**Optional**)

The base URL to fetch executions from (default: "https://rapidapi.com/testing")

##### ```-b, --batch <batch>```(**Optional; default is 100**)

You can use this to control the number of test executions to process on each interval.

##### ```-V, --version``` 

Retrieve the version number

##### ```-h, --help```                   

Display help content for the command

### Example

Below command will run a RapidAPI Testing Worker that fetches 200 new tests every 5 seconds from location queue `3866fd2aaeb474a76fdf236062660fb31df234b8`, defined for context `1234567`, with location key as `custom_worker`. 

```
testing-worker -s 3866fd2aaeb474a76fdf236062660fb31df234b8 -k custom_worker -c 1234567 --frequency 5000 --batch 200
```
