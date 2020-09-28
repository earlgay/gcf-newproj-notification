# gcf-newproj-notification

This [Google Cloud Functions](https://cloud.google.com/functions) function expects the Pub/Sub topic to receive Cloud Logging events based on the following filter, upon which SendGrid is leveraged to send an email notification:
```
logName:organizations/[ORGANIZATION_ID]/logs/ AND resource.type=project AND protoPayload.methodName=CreateProject
```

**Disclaimer: This is not an officially supported Google project.**

## Prerequisites
1. Sign up for [SendGrid Email](https://console.cloud.google.com/marketplace/details/sendgrid-app/sendgrid-email) API in the GCP Marketplace. 

## Create Pub/Sub Topic
1. Enable API:
```
gcloud services enable pubsub.googleapis.com
```
2. Create Topic:
```
gcloud pubsub topics create createProjectsTopic
```

## Create Aggregated Log Sink
1. Create sink:
```
gcloud logging sinks create createProjectsSink  pubsub.googleapis.com/projects/[PROJECT_NAME]/topics/createProjectsTopic --include-children --organization=[ORGANIZATION_ID]--log-filter="logName:organizations/[ORGANIZATION_ID]/logs/ AND resource.type=project AND protoPayload.methodName=CreateProject"
```
2. Grant IAM permissions on the Pub/Sub Topic to the service account referenced after running the sink create command.
3. Verify the sink was created:
```
gcloud logging sinks list --organization=[ORGANIZATION_ID]
```

Variable definitions:
* [PROJECT_NAME]: Name of the GCP project where the service will be deployed.
* [ORGANIZATION_ID]: ID # of the GCP organization.

Further documentation:
* Operations > Operations Suite > Logging > Documentation > [Creating an aggregated sink](https://cloud.google.com/logging/docs/export/aggregated_sinks#creating_an_aggregated_sink)

## Create Cloud Function
1. Enable APIs:
```
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```
2. Configure environment variable YAML file by editting `.env.yaml` and entering:
```
SOURCE_EMAIL: [SOURCE_EMAIL]
DESTINATION_EMAIL: [DESTINATION_EMAIL]
SENDGRID_API_KEY: [SENDGRID_API_KEY]
```
2. Deploy function:
```
gcloud functions deploy newProjNotification \
--runtime nodejs10 \
--trigger-topic createProjectsTopic
--env-vars-file .env.yaml
```

Variable definitions:
* [SOURCE_EMAIL]: Email address the notification will appear to be from.
* [DESTINATION_EMAIL]: Email address the notification will be sent to. 
* [SENDGRID_API_KEY]: API Key from SendGrid.

Further documentation:
* Cloud Functions > Documentation > [Cloud Pub/Sub Tutorial](https://cloud.google.com/functions/docs/tutorials/pubsub)
* GCP Marketplace > [SendGrid Email API](https://console.cloud.google.com/marketplace/details/sendgrid-app/sendgrid-email)

## Test
1. Create a new test project to trigger an event.
```
gcloud projects create [PROJECT_ID]
```

Variable definitions:
* [PROJECT_ID]: Test project name that will trigger the function.

## Cleanup
1. Remove Cloud Function.
2. Remove Pub/Sub Topic.
3. Remove any test Projects.
4. Remove Log Sink.

## Dependencies
* **@sendgrid/mail**: Twilio SendGrid's v3 Node.js Library

## References
* [Use Log Sinks for Google Cloud Function Triggers](https://www.youtube.com/watch?v=VDQmhywGcts)
