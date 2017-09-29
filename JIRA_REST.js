(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	//TODO: Configure for each instance. [;
	var majorVersion = 6;
	var minorVersion = 1;
	
	var serviceNowAdditionalCommentsString = "(Additional comments)";
	var serviceNowWorkNotesString = "(Work notes)";
	var parser = new global.JSON();
	var body = parser.decode(request.body.dataString);
// 	gs.info('URL: ' +request.url);
	gs.info('Stringified Body: ' + global.JSUtil.describeObject(body));
// 	gs.info('IssueId: ' +request.queryParams.issueId);
// 	gs.info('WebHookEvent parameter: ' +body.webhookEvent);
	
	if(request.body.data) {
		switch(majorVersion+''+minorVersion) {
			case "61": 
				gs.info('Executing CreateComment 61 for issueId' + request.queryParams.issueId);
				CreateComment61(request, body);
				break;
			case "71": 
				gs.info('Executing CreateComment 71 for issueId' + request.queryParams.issueId);
				CreateComment71(request, body);
				break;
			default: 
				gs.error('Unable to find coded use case for jira version: ' +  majorVersion+'.'+minorVersion);
				break;
		}
		//Check whether a status is updated
		gs.info('Changelog: ' + body.changelog);
		if(body.changelog != null && body.changelog.items != null  && body.changelog.items.length >  0) {
			gs.info('Checking items for an jira ticket DONE status...');
			var resolveIncident = new GlideRecord('incident');
			resolveIncident.addQuery('u_jira_ticket_number',request.queryParams.issueId);
			resolveIncident.query();
			
			if(resolveIncident.next()) {
				gs.info('Checking JIRA ticket done state: for project: ' + resolveIncident.u_jira_project.project_key + ' : ' + resolveIncident.u_jira_project.ticket_completed_state.toString().toUpperCase());
				for(var i=0; i<body.changelog.items.length; i++) {
					var item = body.changelog.items[i];
					if(item.field.toUpperCase() === 'STATUS' && item.toString.toUpperCase() === resolveIncident.u_jira_project.ticket_completed_state.toString().toUpperCase()) {
						gs.info('Updating incident resolution...');
						/* Let this stay for now
						resolveIncident.close_code = 'Solved (Permanently)';
						resolveIncident.close_notes = 'Solved in JIRA.';
						resolveIncident.state = 6;
						*/
						resolveIncident.work_notes='JIRA ticket has been closed, please verify with requestor';
						gs.info('Resolving JIRA ticket with number: ' +request.queryParams.issueId+ ' for incident:' + resolveIncident.number);
						resolveIncident.update();
						//Add information to x_paym_jira_integr_jira_outbound_incidents
						var outboundIncident = new GlideRecord('x_paym_jira_integr_jira_outbound_incidents');
						outboundIncident.addQuery('incident_number', resolveIncident.number);
						outboundIncident.query();
						while(outboundIncident.next()) {
							outboundIncident.jira_ticket_closed = true;
							outboundIncident.update();
						}
					}
				}
			}
		}
	}https://jira.neterra.paysafe.com/projects/Paysafecard%20Payment%20Platform/issues/undefined
	// implement resource here
	//Todo: Move to script include
	function CreateComment61(request, body) {
		//Check whether a comment is updated
		//When those fields exist
		//gs.info('body.comment && body.comment.body: ' + body.comment + ', ' + body.comment.body + ' are ' + (body.comment && body.comment.body));
		var commentAction = false;
		if(body.comment && body.comment.body) {
			commentAction = body.comment && body.comment.body && body.comment.body.indexOf(serviceNowAdditionalCommentsString) < 0 && body.comment.body.indexOf(serviceNowWorkNotesString) < 0;
		}
		//Check for recursive comments
		if(commentAction && request.queryParams.issueId !== "") {
			gs.info('Updating incident comment...');
			var incident = new GlideRecord('incident');
			incident.addQuery('u_jira_ticket_number',request.queryParams.issueId);
			incident.query();
			if(incident.next()) {
				incident.comments = body.comment.updateAuthor.displayName + ": " + body.comment.body;
				gs.info('CreateComment61: Updating jira ticket with number: ' +request.queryParams.issueId+ ' for ' + incident.number);
				incident.update();
			}
		}
	}
	function CreateComment71(request, body) {
		//Check whether a comment is updated
		var commentAction = body.webhookEvent === "comment_updated" || body.webhookEvent === "comment_created";
		//Check for recursive comments
		commentAction = commentAction && body.comment.body.indexOf(serviceNowAdditionalCommentsString) < 0 && body.comment.body.indexOf(serviceNowWorkNotesString) < 0;
		if(commentAction && request.queryParams.issueId !== "") {
			gs.info('Updating incident comment...');
			var incident = new GlideRecord('incident');
			incident.addQuery('u_jira_ticket_number',request.queryParams.issueId);
			incident.query();
			if(incident.next()) {
				incident.comments = body.comment.body;
				gs.info('CreateComment61: Updating jira ticket with number: ' +request.queryParams.issueId+ ' for ' + incident.number);
				incident.update();
			}
		}
	}
	
})(request, response);


/////////////////////////
// create ticket in JIRA////////////
///////////////////////
(function executeRule(current, previous /*null when async*/) {
	try {
		var incident = new GlideRecord('incident');
		incident.addQuery('number', current.incident_number);
		incident.query();
		incident.next();
		gs.info('Creating JIRA ticket for incident: ' + incident.number);
		var configuration = new GlideRecord('x_paym_jira_integr_jira_integration_configuration');
		configuration.query();
		configuration.next();	
		var password = configuration.password.getDecryptedValue();
		gs.info('Configuration is: ' + configuration.instance_url + 'rest/api/2/issue' + ' : ' + configuration.username + ' : ' + password, 'ITCE JIRA: Create JIRA ticket');
		var r = new sn_ws.RESTMessageV2();
		r.setHttpMethod('post');
		r.setEndpoint(configuration.instance_url + 'rest/api/2/issue');
		r.setBasicAuth(configuration.username, password);
		//We need an instance of the JSON class to encode our object to a JSON representation
		var json = new global.JSON();		
		var integrationUtilities = new x_paym_jira_integr.ITCE_JIRA_Integration_Utilities();
		var restMessage = {
			fields: integrationUtilities.evaluateFields('rest/api/2/issue',incident.u_jira_project.sys_id.toString(),configuration, incident)
		};
		
		var encodedMessage = json.encode(restMessage);
		gs.info('Setting request body to: ' + encodedMessage, 'ITCE JIRA: Create JIRA ticket');
		r.setRequestHeader('Content-Type', 'application/json');
		r.setRequestBody(encodedMessage);
		var response = r.execute();
		var responseBody = response.getBody();
		gs.info('Response body is: ' + responseBody, 'ITCE JIRA: Create JIRA ticket');
		var httpStatus = response.getStatusCode();
		var decodedResponse = json.decode(responseBody);
		
		
		incident.u_jira_ticket_number = decodedResponse.id;
		incident.u_jira_ticket_url = configuration.instance_url + 'projects/' + incident.u_jira_project.project_key + '/issues/' + decodedResponse.key;
		incident.update();
	}
	catch(ex) {
		var message = global.JSUtil.describeObject(ex);
		gs.info('Unable to create JIRA ticket, message: ' + message, 'ITCE JIRA: Create JIRA ticket');
	}
	
})(current, previous);

////JIRA outbound incident
(function executeRule(current, previous /*null when async*/) {

	var outboundIncident = new GlideRecord('x_paym_jira_integr_jira_outbound_incidents');
	outboundIncident.initialize();
	outboundIncident.incident_number = current.number;
	outboundIncident.short_description = current.short_description;
	outboundIncident.description = current.description;
	outboundIncident.insert();

})(current, previous);
