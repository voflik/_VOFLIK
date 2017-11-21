u_IEA_IncCreator.prototype = {

    // This software is supplied "AS IS" without any warranties or support.
    // The author assumes no responsibility or liability for the use of the software, conveys no license or title or any patent, copyright, or mask work right to the product.
    // The author makes no guarantee or implication of its fitness for use.
    // By using this code, the user accepts all responsibility for potentially undesireable outcomes.

    initialize: function () {
    },

    // This object property is used for parsing out email addresses received as body codes.
    EMAIL_DOMAIN: 'yourdomain.com',  //if your users' email addresses end with @karate.com, put karate.com here

    // Includes the stop_processing directive when enabled
    STOP_PROCESSING_EMAIL_ACTIONS_ON_SUCCESS: true,

    // Add affected CIs
    ADD_AFFECTED_CIS: true,

    // Add Watchlist
    ADD_WATCHLIST: true,

    // Required Fields - MUST exactly match a valid body code documented below.  If any are missing INC creation will fail.
    REQUIRED_FIELDS: ['short_description', 'description', 'impact', 'urgency', 'primary_configuration_item', 'assignment_group'],

    // Maps impact/urgency code to a 1, 2 or a 3
    // Users can use: 3, 2, 1, med, medium, high, low strings
    getImpactUrgencyOrdinal: function (lowMedHighString) {
        lowMedHighString = lowMedHighString.toLowerCase().trim();
        var o = { 'low': '3', '3': '3', 'lo': '3', 'medium': '2', '2': '2', 'med': '2', 'high': '1', '1': '1', 'hi': '1' };
        var returnVal = o[lowMedHighString];
        if (JSUtil.nil(returnVal)) {
            gs.logError('Unable to parse impact/urgency value:' + lowMedHighString, 'SI:u_IEA_IncCreator->getImpactUrgencyOrdinal()');
        }
        return returnVal;
    },

    /*************************************************************************************************************************
 	*  Email Body Codes:
 	*
 	*   Description - single line of text or multiple lines wrapped in tokens Description: [$$ description text $$].
 	*   		 + Multi-line:
 	*			   The line must begin with "description: [$$" (case insensitive)
 	*    	       The description must be ended with the token "$$]"
 	*    		+ Single-line - use the simple body code:
 	*				description: value
 	*   Short Description - single line of text
 	* 			short_description: value
 	*   Impact - single line of text
 	*			impact: value
 	*   Urgency - single line of text
 	* 			urgency: value
 	*   Primary Configuration Item - single line of text
 	*			primary_configuration_item: value
 	*   Assignment Group - comma separated list of names of CIs *exactly as it appears on the name of the CI*
 	*			assignment_group: value
 	*   Category - single line of text
 	* 			category: value
 	*   Subcategory - single line of text
 	* 			subcategory: value
 	*   Comments - single line of text
 	*			comments: value
 	*   Caller Email - single email address
 	*			caller_email: value
 	*   Watch List - comma separated list of email addresses of active users
 	*			watch_list: value
 	*         + Controlled by constant: ADD_WATCHLIST
 	*   Affected Configuration Items - comma separated list of names of CIs *VALUE MUST EXACTLY MATCH NAME FIELD FOR THE CI RECORD*
 	* 			affected_configuration_items: value
 	*         + This assumes that you have added a related list of affected configuration items (task_ci) to the INC form.
 	*         + Toggle on or off using the ADD_AFFECTED_CIS constant.
 	*
 	*   Set the REQUIRED_FIELDS constant to control which fields are required.
 	*  	   + If required fields are missing, INC creation will fail.
 	*         + Required missing fields will result in the following message being logged:
 	*             	Missing required fields:[comma separated list of body codes for missing required fields]
 	*
 	*   YOU MUST SET THE EMAIL_DOMAIN CONSTANT PRIOR TO USE.
 	*   	  + If you fail to set this constant, INC Creation will fail and the following error message will be logged:
 	*		  "You must set the EMAIL_DOMAIN constant prior to using the u_IEA_IncCreator script include.  No INC was created due to this configuration error."
 	*
 	*************************************************************************************************************************/
    createInc: function (current, email, event) {

        if (this.EMAIL_DOMAIN == 'yourdomain.com') {
            gs.logError('You must set the EMAIL_DOMAIN constant prior to using the u_IEA_IncCreator script include.  No INC was created due to this configuration error.', 'u_IEA_IncCreator->createInc()');
            return;
        }

        var retrievedValues = {};
        try {
            retrievedValues['short_description'] = email.body.short_description || '';

            retrievedValues['description'] = this.getDescription(email) || '';

            retrievedValues['impact'] = this.getImpactUrgencyOrdinal(email.body.impact) || '';

            retrievedValues['urgency'] = this.getImpactUrgencyOrdinal(email.body.urgency) || '';

            retrievedValues['primary_configuration_item'] = email.body.primary_configuration_item || '';

            retrievedValues['assignment_group'] = email.body.assignment_group || '';

            retrievedValues['category'] = email.body.category || '';

            retrievedValues['sub_category'] = email.body.sub_category || '';

            retrievedValues['comments'] = email.body.comments || '';

            var callerId = undefined;
            if (email.body.caller_email) {
                callerId = this.getSysIdFromEmail(this.getEmail(email.body.caller_email)) || '';
            }
            else {
                callerId = email.from;
            }
            retrievedValues['caller_email'] = callerId;//This looks weird but it's actually okay. We're just trying to make sure we got a value.
        } catch (e) {
            //This makes trouble-shooting easier if some property did not come through into the generated INC
            var vals = 'short_description:' + retrievedValues['short_description'] + '/';
            vals += 'description:' + retrievedValues['description'] + '/';
            vals += 'impact:' + retrievedValues['impact'] + '/';
            vals += 'urgency:' + retrievedValues['urgency'] + '/';
            vals += 'primaryCi:' + retrievedValues['primary_configuration_item'] + '/';
            vals += 'assignmentGrp:' + retrievedValues['assignment_group'] + '/';
            vals += 'category:' + retrievedValues['category'] + '/';
            vals += 'subCategory:' + retrievedValues['sub_category'] + '/';
            vals += 'comments:' + retrievedValues['comments'] + '/';
            vals += 'caller_id:' + callerId + '/';

            gs.logError('Error getting values from email.body.foo codes: vals:' + vals + ' --> Error:' + e.message, 'u_IEA_IncCreator->createInc()');
            return;
        }

        var watchList;
        try {
            if (this.ADD_WATCHLIST) {
                retrievedValues['watch_list'] = (!JSUtil.nil(email.body.watch_list)) ? this.getUserIdArrayFromUserEmailArray(email.body.watch_list.split(',')) : '';
            }
        } catch (e) {
            gs.logError(e.message, 'u_IEA_IncCreator->createInc()...parsing watch_list');
        }

        var affectedCis;
        try {
            if (this.ADD_AFFECTED_CIS) {
                retrievedValues['affected_configuration_items'] = (!JSUtil.nil(email.body.affected_configuration_items)) ? this.getCiIdArrayFromCiNameArray(email.body.affected_configuration_items.split(',')) : '';
            }
        } catch (e) {
            gs.logError(e.message, 'u_IEA_IncCreator->createInc()...retrieving afffected CIs');
        }

        // Exit w/o creating INC if required fields are missing
        var missingFields = this.missingRequiredFields(retrievedValues);
        if (missingFields.length > 0) {
            gs.logError('Missing required fields:' + missingFields + ' Required fields are configured via the REQUIRED_FIELDS constant.', 'u_IEA_IncCreator->createInc()');
            return;
        }

        //Now create the INC
        var incId;
        try {
            current.short_description = retrievedValues['short_description'];
            current.description = retrievedValues['description'];
            current.impact = retrievedValues['impact'];
            current.urgency = retrievedValues['urgency'];
            current.cmdb_ci.setDisplayValue(retrievedValues['primary_configuration_item']);
            current.assignment_group.setDisplayValue(retrievedValues['assignment_group']);
            current.caller_id = callerId;
            current.contact_type = 'email';
            current.category = retrievedValues['category'];
            current.subcategory = retrievedValues['sub_category'];
            current.comments = retrievedValues['comments'];
            current.incident_state = 1;

            if (this.ADD_WATCHLIST && !JSUtil.nil(retrievedValues['watch_list'])) {
                current.watch_list = retrievedValues['watch_list'].toString();
            }
            incId = current.update();
            incId = incId || current.sys_id;
        } catch (e) {
            var errMsg = 'Error setting properties on current and calling update (Creating INC record):' + e.message;
            gs.logError(errMsg, 'u_IEA_IncCreator->Error setting properties on current and calling update (Creating INC record)');
        }

        if (this.ADD_AFFECTED_CIS) {
            this.addAffectedCis(retrievedValues['affected_configuration_items'], incId);
        }

        //if an INC was created, stop processing further IEAs
        if (incId != undefined && this.STOP_PROCESSING_EMAIL_ACTIONS_ON_SUCCESS) {
            event.state = "stop_processing";
        }

        return incId;
    },

    //This function is used to get the sys_id for a user when you pass in the email
    getSysIdFromEmail: function (email) {
        try {
            if (JSUtil.nil(email) || typeof email != 'string') {
                return null;
            }

            var grUser = new GlideRecord('sys_user');

            if (grUser.get('email', email)) {
                return grUser.sys_id;
            }
        } catch (e) {
            var errMsg = 'Error getting user sys_id from email. ' + e.message;
            gs.logError(errMsg, 'u_IEA_IncCreator->createInc()->getSysIdFromEmail()');
        }

        return null;
    },

    // Links a task (here an INC) with n CIs via the task_ci table
    // Param:affectedCis  is an array containing CI sys ids
    // Param:incId  is the sys_id of the INC
    addAffectedCis: function (affectedCis, incId) {
        try {
            if (this.ADD_AFFECTED_CIS && affectedCis && affectedCis.length > 0) {
                for (var i = 0; i < affectedCis.length; i++) {
                    var currentCi = affectedCis[i];
                    var grIns = new GlideRecord("task_ci");
                    grIns.initialize();
                    grIns.setValue("ci_item", currentCi);
                    grIns.setValue('task', incId);
                    grIns.insert();
                }
            }
        } catch (e) {
            var errMsg = 'Error linking INC:' + incId + ' & CI:' + currentCi + ' : ' + e.message;
            gs.logError(errMsg, 'u_IEA_IncCreator->createInc()->addAffectedCis()');
        }
    },

    // Service Now converts email strings from first.last@domain.com to first.last@domain.com&lt;mailto:first.last@domain.com&gt;
    // This function grabs the simple email string from the beginning. (scrubs off the &lt;mailto...)
    // This function makes the assumption that all emails will come from a single domain defined in the Constant: EMAIL_DOMAIN
    getEmail: function (emailWithMailto) {
        if (!/mailto/i.test(emailWithMailto)) {
            return emailWithMailto;
        }
        var emailEnd = emailWithMailto.toString().indexOf('@' + this.EMAIL_DOMAIN) + ('@' + this.EMAIL_DOMAIN).length;
        return emailWithMailto.substr(0, emailEnd).trim();
    },

    // Returns a list of active CI ids when handed a list of CI Names
    // Logs misses to the error log
    getCiIdArrayFromCiNameArray: function (arrayOfCiNames) {
        var ciIdArray = [];
        try {
            if (!JSUtil.nil(arrayOfCiNames) && arrayOfCiNames.length != undefined && arrayOfCiNames.length > 0) {
                for (var i = 0; i < arrayOfCiNames.length; i++) {
                    var gr = new GlideRecord("cmdb_ci");
                    gr.addQuery('active', true);
                    gr.addQuery('name', arrayOfCiNames[i].toString().trim());
                    gr.query();

                    if (gr.next()) {
                        ciIdArray.push(gr.sys_id);
                    } else {
                        gs.logError('Failed attempt to lookup Active CI by name:' + arrayOfCiNames[i], 'u_IEA_IncCreator->_getCiIdArrayFromCiNameArray()');
                    }
                }
                return ciIdArray;
            }
        } catch (e) {
            gs.logError(e.message, 'u_IEA_IncCreator->getCiIdArrayFromCiNameArray()');
        }
        return null;
    },

    // Returns a list of active User ids when handed an array of user emails
    // Logs misses to the error log
    getUserIdArrayFromUserEmailArray: function (arrayOfEmails) {
        var userIdArray = [];
        if (!JSUtil.nil(arrayOfEmails) && arrayOfEmails.length > 0) {
            for (var i = 0; i < arrayOfEmails.length; i++) {

                var email = this.getEmail(arrayOfEmails[i]);
                var gr = new GlideRecord("sys_user");
                gr.addQuery('active', true);
                gr.addQuery('email', email);
                gr.query();

                if (gr.next()) {
                    userIdArray.push(gr.sys_id);
                } else {
                    gs.logError('Failed attempt to lookup Active user by email:' + email, 'u_IEA_IncCreator->_getUserIdArrayFromUserEmailArray()');
                }
            }
            return userIdArray;
        }
        return null;
    },

    // Checks to see if any required fields are missing. Returns an array of the missing required field names
    // Param is an object where the keys are all of the possible email body codes and the corresponing value is the value retrieved via that body code.
    missingRequiredFields: function (retrivedFldVals) {
        var aryMissingFields = [];
        for (var i = 0; i < this.REQUIRED_FIELDS.length; i++) {
            var fld = this.REQUIRED_FIELDS[i];
            if (JSUtil.nil(retrivedFldVals[fld])) {
                aryMissingFields.push(fld);
            }
        }
        return aryMissingFields;
    },

    // Description could be contained in a simple email.body.description on a line or it could span multiple lines in the body.
    // If it is multi-line, then the desciption should be prefaced with the token Description: [$$ and ended with the $$] token
    getDescription: function (email) {
        //Single line simple case, no [$$ $$] tokens around the description
        if (!JSUtil.nil(email.body.description) && !/\[\$\$/.test(email.body.description)) {
            return email.body.description;
        }
        //Get multi-line description using [$$ $$] tokens.
        try {
            var text = email.body_text.toString();
            var beginToken = new RegExp("Description: *\\[\\$\\$ *", "i");
            var match = text.match(beginToken);
            var endToken = '$$]';
            var beginTokenPos = text.search(beginToken);
            var endTokenPos = text.indexOf(endToken);

            if (match && beginTokenPos != -1 && endTokenPos != -1 && endTokenPos > beginTokenPos) {
                var beginTokenLen = match[0].length;
                var value = text.substring(beginTokenPos + beginTokenLen, endTokenPos);
                if (value) {
                    return value;
                }
            }
        } catch (e) {
            gs.logError(e.message, 'u_IEA_IncCreator->getDescription() attempting to parse out message using [$$ $$] tokens.');
        }

        return null;
    },

    type: 'u_IEA_IncCreator'
}

////////////////
///////////////
////////////////////
//////////////////
/////////////////
/////////////////




routeIt();

function routeIt(){
	var sysEmailRec = getMailRec(email.uid);
	if (sysEmailRec){
		var match = false;
		var pmRule = new GlideRecord("email_routing_rule");
		pmRule.addQuery("active", true);
		pmRule.orderBy("order");
		pmRule.query();
		while (pmRule.next() && !match) {
			if (checkCondition(sysEmailRec, pmRule.condition)){
				createRec(pmRule, sysEmailRec.sys_id.toString());
				match = true;
				event.state="stop_processing";
			}
			//If no matching rule, continue with other Inbound actions
		}
	}
}

//Get the sys_email record, based on email uid
function getMailRec(uid){
	var mail = new GlideRecord("sys_email");
	mail.addQuery("uid", uid);
	mail.query();
	if (mail.next()) {
		return mail;
	}
	else{
		gs.log('**** - No valid sys_email match found for incoming mail w/ uid ' + email.uid);
	}
	return;
}

//Check condition field for match
function checkCondition(gr, query) {
	return GlideFilter.checkRecord(gr,query);
}

//Create destination record
function createRec(rule, emailID){
	var newRec;
	//For service-catalog items, spawn proper REQ/RITM records and get appropriate record for template
	if (rule.destination_table == 'sc_request' || rule.destination_table == 'sc_req_item'){
		var cart = new Cart();
		cart.addItem(rule.catalog_item);
		newRec = cart.placeOrder();
		if (rule.destination_table == 'sc_req_item'){
			gs.sleep(3000); //Wait for the workflow to create the RITM
			var recSysId = newRec.sys_id.toString();
			newRec = new GlideRecord("sc_req_item");
			newRec.addQuery("request", recSysId);
			newRec.query();
			if (newRec.next()){}
			}
	}
	//For non-service-catalog items, spawn the appropriate record type
	else{
		newRec = new GlideRecord(rule.destination_table);
		newRec.initialize();
	}
	
	//Apply template to created record
	if (!rule.template.nil())
		newRec.applyTemplate(rule.template.name);
	
	//Eval to apply email body and short description to the appropriate fields
	eval("newRec." + rule.email_body_to + " = 'Received from: ' + email.origemail + ':  ' + email.body_text;");
	eval("newRec." + rule.email_subject_to + " = email.subject;");
	
	//Apply other table-specific settings
	if (rule.destination_table == 'incident')
		newRec.caller_id = gs.getUserID();
	
	//Apply script to record
	if (rule.apply_script == true){
		try{eval(rule.script);}
		catch(err){}
	}
	
	newRec.update();
	
	//Copy attachments from email to created record
	GlideSysAttachment.copy('sys_email', emailID, newRec.getTableName(), newRec.sys_id.toString());
}


/////////////////////////////
/////////////////////////////
/////////////////////////////
////////////////////////////

routeIt();

function routeIt(){
	var sysEmailRec = getMailRec(email.uid);
	if (sysEmailRec){
		var match = false;
		var pmRule = new GlideRecord("email_routing_rule");
		pmRule.addQuery("active", true);
		pmRule.orderBy("order");
		pmRule.query();
		while (pmRule.next() && !match) {
			if (checkCondition(sysEmailRec, pmRule.condition)){
				createRec(pmRule, sysEmailRec.sys_id.toString());
				match = true;
				event.state="stop_processing";
			}
			//If no matching rule, continue with other Inbound actions
		}
	}
}

//Get the sys_email record, based on email uid
function getMailRec(uid){
	var mail = new GlideRecord("sys_email");
	mail.addQuery("uid", uid);
	mail.query();
	if (mail.next()) {
		return mail;
	}
	else{
		gs.log('**** - No valid sys_email match found for incoming mail w/ uid ' + email.uid);
	}
	return;
}

//Check condition field for match
function checkCondition(gr, query) {
	return GlideFilter.checkRecord(gr,query);
}

//Create destination record
function createRec(rule, emailID){
	var newRec;
	//For service-catalog items, spawn proper REQ/RITM records and get appropriate record for template
	if (rule.destination_table == 'sc_request' || rule.destination_table == 'sc_req_item'){
		var cart = new Cart();
		cart.addItem(rule.catalog_item);
		newRec = cart.placeOrder();
		if (rule.destination_table == 'sc_req_item'){
			gs.sleep(3000); //Wait for the workflow to create the RITM
			var recSysId = newRec.sys_id.toString();
			newRec = new GlideRecord("sc_req_item");
			newRec.addQuery("request", recSysId);
			newRec.query();
			if (newRec.next()){}
			}
	}
	//For non-service-catalog items, spawn the appropriate record type
	else{
		newRec = new GlideRecord(rule.destination_table);
		newRec.initialize();
	}
	
	//Apply template to created record
	if (!rule.template.nil())
		newRec.applyTemplate(rule.template.name);
	
	//Eval to apply email body and short description to the appropriate fields
	eval("newRec." + rule.email_body_to + " = 'Received from: ' + email.origemail + ':  ' + email.body_text;");
	eval("newRec." + rule.email_subject_to + " = email.subject;");
	
	//Apply other table-specific settings
	if (rule.destination_table == 'incident')
		newRec.caller_id = gs.getUserID();
	
	//Apply script to record
	if (rule.apply_script == true){
		try{eval(rule.script);}
		catch(err){}
	}
	
	newRec.update();
	
	//Copy attachments from email to created record
	GlideSysAttachment.copy('sys_email', emailID, newRec.getTableName(), newRec.sys_id.toString());
}