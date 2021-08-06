# Infra - AWS

We apply cross-region replication for all regions. To apply cross-region replication, run the folling command for each region:

```bash
aws ecr put-replication-configuration \
     --replication-configuration file://crr-setup.json \
     --region us-west-2
```

Below is an example content of `crr-setup.json`. Make sure to replace the registryId with your own account ID (this is for account ID 477364786938) and to remove the object of the region you are configuring with the above command.

```
{
    "rules": [
        {
            "destinations": [
                {
                    "region": "us-east-1",
                    "registryId": "477364786938"
                },
                {
                    "region": "us-west-2",
                    "registryId": "477364786938"
                },
                {
                    "region": "ap-east-1",
                    "registryId": "477364786938"
                },
                {
                    "region": "ap-south-1",
                    "registryId": "477364786938"
                },
                {
                    "region": "ap-northeast-2",
                    "registryId": "477364786938"
                },
                {
                    "region": "ap-southeast-1",
                    "registryId": "477364786938"
                },
                {
                    "region": "ca-central-1",
                    "registryId": "477364786938"
                },
                {
                    "region": "eu-west-3",
                    "registryId": "477364786938"
                },
                {
                    "region": "sa-east-1",
                    "registryId": "477364786938"
                }
            ]
        }
    ]
}
```
