## Lambda Workers

To execute tests in multiple regions, workers are added in the form of Lambda function.

To add a new lambda function:

1. Create a lambda function in the desired location (convention is to call it `rapidapi_testing_local_worker`). Follow default settings.
2. Add environment variables (URL, KEY and LOCATION).
3. Update the functions Handler setting to: `worker_dist/server/worker.handler`.
4. Configure function timeout to `10 mins`.
5. Add function to the "package_worker.sh" script. Make sure to update both the ARN - `--function-name` and the Region - `--region` in the line.
6. Run the package-worker.sh script (`./package_worker.sh`) to deploy code. Refresh lambda editor and validate that the code was deployed.
7. Create CloudWatch (`CloudWatch Events / Event Bridge`) trigger for the function with a new rule: name=`EveryMinute` scheduleExpression=`rate(1 minute)`. Make sure `Enable Trigger` is selected.
8. Run a test with the region as it's target to verify it was deployed correctly.
