var ctype = current.call_type;

if (ctype != 'hang_up' && ctype != 'wrong_number' && ctype != 'status_call' && ctype != 'general_inquiry' && ctype != 'sc_request') {
	var gr = new GlideRecord(ctype);
	gr.short_description = current.short_description;
	gr.description = current.description.getHTMLValue();
	gr.contact_type = current.contact_type;
	gr.company = current.company;
	gr.opened_by = current.opened_by;
		
	
	// update taks work notes
	var callerName = current.caller.name;
	var taskType = current.call_type.getDisplayValue();
	var currentLink = "[code]<a href='" + current.getLink() + "'>" + current.number + "</a>[/code]";
	var journalEntry = gs.getMessage("This {0} was created by {1} from {2}", [taskType, callerName, currentLink]);
	gr.work_notes = journalEntry;

	if (GlidePluginManager.isRegistered('com.glide.domain'))
		gr.sys_domain = getDomain();
//Create INC ->
	if (ctype == 'incident'){
		gr.u_sd_call = current.number;
		gr.caller_id = current.caller;
		gr.location = current.caller.location;
		gr.comments = current.description.getHTMLValue();
		
		if(current.u_bs.business_criticality == 'critical'){
			gr.impact = '1 - High';
			gr.urgency = '1 - High';
			gs.priority = '1 - High';
		}
		
		if(current.u_impact) {
			gr.impact = current.u_impact;
		} 
		if(current.u_urgency) {
			gr.urgency = current.u_urgency;
		} 
		subcategory
		gr.u_environment = current.u_bs.u_environment;
		gr.u_impacted_business_service = current.u_bs;
		if(current.company.u_ci){
			gr.cmdb_ci = current.company.u_ci;
		}
		gs.assignment_group = current.u_bs.support_group;
		gs.category = current.u_bs.u_category;
		gs.u_environment = current.u_bs.u_environment;
	}

	if (ctype == 'problem')
		gr.opened_by = current.caller;
//CHANGE ->
	if (ctype == 'change_request')
		gr.requested_by = current.caller;

	var sysID = gr.insert();
	current.transferred_to = sysID;
	var url = ctype + '.do?sys_id=' + sysID;
	gs.addInfoMessage(gs.getMessage("{0} transferred to: <a href='{1}'>{2}</a>", [current.number, url, current.transferred_to.getDisplayValue()]));
}

function getDomain(){
	// only set the domain if the caller has a domain that is not global
	if (JSUtil.notNil(current.caller) && JSUtil.notNil(current.caller.sys_domain) && current.caller.sys_domain.getDisplayValue() != 'global')
		return current.caller.sys_domain;
	else
		return getDefaultDomain();
}



///////////////////////////








gs.include('validators');

(function(current){

	var sd = new Paysafe_SDCaller_Utils();
	
	var cleanSubject = "";
	cleanSubject = email.subject.trim();
	sd.log("EMAIL = "  + "  " + email.subject);
	
	
	if(email.from != ""){
		sd.log("Cleaning Subject from IA " + cleanSubject);
		cleanSubject = sd.cleanUpEmailSubject(cleanSubject);
		var existingCall = sd.getRecordFromSubject(cleanSubject);
		if(existingCall) {
			sd.log("Found for update!");
			var rec = new GlideRecord('new_call');
			rec.get(existingCall);
			rec.u_journal_1 = "Update from: " + email.origemail + "\n\n" +  email.body_text;
			rec.update();
		} else {
			current.u_active = true;
			current.u_index = email.subject.toLowerCase();
			current.description = "New ticket received from: " + '\n' + email.origemail + "\n"  + email.body_text;
			current.short_description = email.subject;
			current.call_type = "triage";
			current.caller = email.from;
			current.company = sd.getVendorCompany(email.from);
			current.u_bs = current.company.u_bs;
			current.notify = 2;
			current.contact_type = "email";
			//current.opened_by = 'NOC';
			current.u_assignment_group = current.u_bs.support_group;
			if (email.body.assign != undefined && email.body.assign != "")
			   current.assigned_to = email.body.assign;

			if (email.importance != undefined && email.importance != "") {
			   if (email.importance.toLowerCase() == "high")
				  current.priority = 1;
			}


			current.insert();
			sd.log("New SD CALL ticket created : " + current.number);
			
		}
		
	} else {
		sd.log("Nothing to insert/update!");
	}


})(current);


		var regex = /INC/;
if(regex.test(current.transferred_to.number)){
//It is INCIDENT
	switch(current.transferred_to.state){
		
		case 1:
			current.u_state = 1;
			break;
		case 2:
			current.u_state = 2;
			break;
		case 3:
			current.u_state = 3;
			break;
		case 4:
			current.u_state = 5;
			break;
		case 5:
			current.u_state = 5;
			break;
		case 6:
			current.u_state = 6;
			break;
		case 7:
			current.u_state = 4;
			break;
		
		
		
	}
	
} else {
 //It is CHANGE
		switch(current.transferred_to.state){
		
		case 1:
			current.u_state = 1;
			break;
		case 2:
			current.u_state = 20;
			break;
		case 100:
			current.u_state = 100;
			break;
		case -5:
			current.u_state = 5;
			break;
		case 110:
			current.u_state = 110;
			break;
		case 120:
			current.u_state = 4;
			break;
		case 6:
			current.u_state = 6;
			break;
		case 3:
			current.u_state = 4;
			break;
		case 4:
			current.u_state = 4;
			break;
		case 7:
			current.u_state = 4;
			break;
	}


}	




var ctype = current.call_type;

if (ctype != 'hang_up' && ctype != 'wrong_number' && ctype != 'status_call' && ctype != 'general_inquiry' && ctype != 'sc_request') {
	var gr = new GlideRecord(ctype);
	gr.short_description = current.short_description;
	gr.description = current.description.getHTMLValue();
	gr.contact_type = current.contact_type;
	gr.company = current.company;
	gr.opened_by = current.opened_by;
		
	
	// update taks work notes
	var callerName = current.caller.name;
	var taskType = current.call_type.getDisplayValue();
	var currentLink = "[code]<a href='" + current.getLink() + "'>" + current.number + "</a>[/code]";
	var journalEntry = gs.getMessage("This {0} was raised on behalf of {1} from {2}", [taskType, callerName, currentLink]);
	gr.work_notes = journalEntry;

	if (GlidePluginManager.isRegistered('com.glide.domain'))
		gr.sys_domain = getDomain();
//INCIDENT ->
	if (ctype == 'incident'){
		gr.caller_id = current.caller;
		gr.location = current.caller.location;
		//gr.comments = current.description.getHTMLValue();
		gr.comments = current.journal.getHTMLValue();
		
		if(current.u_bs.business_criticality == 'critical'){
			gr.impact = '1 - High';
			gr.urgency = '1 - High';
			gs.priority = '1 - High';
		}
		
		if(current.u_impact) {
			gr.impact = current.u_impact;
		} 
		if(current.u_urgency) {
			gr.urgency = current.u_urgency;
		} 
		gr.u_impacted_business_service = current.u_bs;
		gr.category = current.u_bs.u_category;
		gr.u_environment = current.u_bs.u_environment;
		
		
		if(current.company.u_ci){
			gr.cmdb_ci = current.company.u_ci;
		}
		gs.assignment_group = current.u_bs.support_group;
		gs.category = current.u_bs.u_category;
		gs.u_environment = current.u_bs.u_environment;
	}

	if (ctype == 'problem')
		gr.opened_by = current.caller;
//CHANGE ->
	if (ctype == 'change_request')
		gr.requested_by = current.caller;

	var sysID = gr.insert();
	current.transferred_to = sysID;
	var url = ctype + '.do?sys_id=' + sysID;
	gs.addInfoMessage(gs.getMessage("{0} transferred to: <a href='{1}'>{2}</a>", [current.number, url, current.transferred_to.getDisplayValue()]));
}

function getDomain(){
	// only set the domain if the caller has a domain that is not global
	if (JSUtil.notNil(current.caller) && JSUtil.notNil(current.caller.sys_domain) && current.caller.sys_domain.getDisplayValue() != 'global')
		return current.caller.sys_domain;
	else
		return getDefaultDomain();
}