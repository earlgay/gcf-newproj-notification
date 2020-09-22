// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail');

// Set these environment variables when deploying the Cloud Function.
const sourceEmail = process.env.SOURCE_EMAIL;
const destinationEmail = process.env.DESTINATION_EMAIL;
const sendgridApiKey = process.env.SENDGRID_API_KEY;

/**
 *  Cloud Function expects the Pub/Sub topic to receive Cloud Logging events based on the following filter, upon which SendGrid is leveraged to send an email notification:
 *      "logName:organizations/[ORGANIZATION_ID]/logs/ AND resource.type=project AND protoPayload.methodName=CreateProject"
 *
 * @param {object} message The Pub/Sub message.
 * @param {object} context The event metadata.
 */
exports.newProjNotification = (message, context) => {
	let msg = JSON.parse(Buffer.from(message.data, 'base64').toString());

    // Pull values from expected message format. A sample event is included within `sample_event.txt`.
	let project = msg.protoPayload.request.project.name;
	let user = msg.protoPayload.authenticationInfo.principalEmail;

	console.log(`User (${msg.protoPayload.authenticationInfo.principalEmail}) created a new GCP project (${msg.protoPayload.request.project.name}).`);

	sgMail.setApiKey(sendgridApiKey);
	const emailMsg = {
		to: destinationEmail,
		from: sourceEmail,
        subject: `New Project Created: ${project}`,
        text: `A new Google Cloud Platform project ${project} has been created by: ${user}.`
	};
	sgMail.send(emailMsg);
    console.log(`Email notification sent to: ${destinationEmail}.`);
};
