# Serverless appication using Amazon services: S3, Lambda, API Gateway and IAM

I decided that the main idea of this task is to show my ability to create serverless applications using Google or Amazon infrastructura. So front-end side will be simple as possible, only bootstrap and javascript. There will be no any validation, only Google Invisible Captcha. If I was wrong, just let me know and I will add front-end and back-end validation rules.

To try this demo please go to http://compound-test-3678.s3-website.eu-central-1.amazonaws.com/ and submit form. To check stored data you can open http://compound-test-3678.s3-website.eu-central-1.amazonaws.com/storage/&lt;email&gt;.json
In case if email already exists you will see json message with error that object already exists.

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
```bash
$ aws iam create-role --role-name Compound-Test-Role --assume-role-policy-document file://role_trust_policy.json
```
5. Attach Lambda execution policy
```bash
$ aws iam attach-role-policy --role-name Compound-Test-Role --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```
6. Attach S3 full access role. It is possible to restrict access to specific objects only, this approach was used to simplify process only
```bash
$ aws iam attach-role-policy --role-name Compound-Test-Role --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess
```
----
### Lambda function
7. Create Lambda function
```bash
$ zip - ./lambda/* -j | aws lambda create-function --function-name CompoundFormSubmitLambda --runtime nodejs8.10 --role arn:aws:iam::373428958371:role/Compound-Test-Role --handler index.handler --environment Variables="{S3_BUCKET=compound-test-3678,STORAGE_PATH=storage/,CAPTCHA_SECRET=6LdLq38UAAAAAFsy4FRCsm9iYdT8ksUa0z9zRawk,SUCCESS_REDIRECT=http://compound-test-3678.s3-website.eu-central-1.amazonaws.com/success.html}" --zip-file fileb:///dev/stdin
```
----
### API Gateway configuration
8. Create API
```bash
$ aws apigateway create-rest-api --name 'Compound Test API' --endpoint-configuration types="EDGE" --region eu-central-1
```
9. Get list of API resources to find parent id. <REST API ID> from previous step output.
```bash
$ aws apigateway get-resources --rest-api-id <REST API ID> --region eu-central-1
```
10. Create API resource. <PARENT REST ID> from previous step output.
```bash
$ aws apigateway create-resource --rest-api-id <REST API ID> --parent-id <PARENT REST ID> --path-part 'form-submit' --region eu-central-1
```
11. Create API method. <RESOURCE ID> from previous step output.
```bash
$ aws apigateway put-method --rest-api-id <REST API ID> --resource-id <RESOURCE ID> --http-method POST --authorization-type "NONE" --no-api-key-required --region eu-central-1
```
12. Create integration with Lambda
```bash
$ aws apigateway put-integration --rest-api-id <REST API ID> --resource-id <RESOURCE ID> --http-method POST --type AWS_PROXY --passthrough-behavior WHEN_NO_MATCH --integration-http-method POST --content-handling CONVERT_TO_TEXT --uri 'arn:aws:apigateway:eu-central-1:lambda:path/2015-03-31/functions/arn:aws:lambda:eu-central-1:373428958371:function:CompoundFormSubmitLambda/invocations' --region eu-central-1
```
13. Create API method response.
```bash
$ aws apigateway put-method-response --rest-api-id <REST API ID> --resource-id <RESOURCE ID> --http-method POST --status-code 200 --response-models "application/json=Empty" --region eu-central-1
```
14. Create API method integration response.
```bash
$ aws apigateway put-integration-response --rest-api-id <REST API ID> --resource-id <RESOURCE ID> --http-method POST --status-code 200 --response-templates '{"application/json": "null"}' --region eu-central-1
```
15. Allow API Gateway to call lambda function
```bash
$ aws lambda add-permission --function-name CompoundFormSubmitLambda --statement-id 1 --principal apigateway.amazonaws.com --action lambda:InvokeFunction --source-arn arn:aws:execute-api:eu-central-1:373428958371:<REST API ID>/*/POST/form-submit
```
16. Deploy API REST endpoint
```bash
$ aws apigateway create-deployment --rest-api-id <REST API ID> --stage-name prod --stage-description 'Development Stage' --description 'First deployment to the dev stage' --region eu-central-1
```
----
### Static web files
1.  Copying static html files to S3 bucket. NB! Do not forget to update form action in index.html and set it to https://&lt;REST API ID&gt;.execute-api.eu-central-1.amazonaws.com/prod/form-submit
```bash
$ aws s3 cp ./public_html s3://compound-test-3678/ --recursive --include "*"
```


