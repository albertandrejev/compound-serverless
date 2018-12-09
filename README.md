# Serverless appication using Amazon services: S3, Lambda, API Gateway and IAM

I decided that the main idea of this task is to show my ability to create serverless applications using Google or Amazon infrastructura. So front-end side will be simple as possible, only bootstrap and javascript. There will be no any validation, only Google Invisible Captcha. If I was wrong, just let me know and I will add front-end and back-end validation rules.

In order to deploy the task you should run following commands

----
### Bucket Configuration
1. Create S3 bucket with name "compound-test-3678" to store static files
```bash
$ aws s3api create-bucket --acl private --bucket compound-test-3678 --region eu-central-1 --create-bucket-configuration LocationConstraint=eu-central-1
```

2. Apply policy file to bucket to allow public access
```bash
$ aws s3api put-bucket-policy --bucket compound-test-3678 --policy file://bucket_policy.json
```
3. Create static website on S3
```bash
$ aws s3 website s3://compound-test-3678/ --index-document index.html
```
----
### IAM Role Configuration
4. Create IAM role
```
$ aws iam create-role --role-name Compound-Test-Role --assume-role-policy-document file://role_trust_policy.json
```
5. Attach Lambda execution policy
```
$ aws iam attach-role-policy --role-name Compound-Test-Role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
6. Attach S3 full access role. It is possible to restrict access to specific objects only, this approach was used to simplify process only
```
$ aws iam attach-role-policy --role-name Compound-Test-Role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```


