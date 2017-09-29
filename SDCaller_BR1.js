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
		
		gr.category = current.u_bs.u_category;
		gr.subcategory = current.u_bs.subcategory;
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
	action.setRedirectURL(sysID);
	action.setReturnURL(sysID);
}

function getDomain(){
	// only set the domain if the caller has a domain that is not global
	if (JSUtil.notNil(current.caller) && JSUtil.notNil(current.caller.sys_domain) && current.caller.sys_domain.getDisplayValue() != 'global')
		return current.caller.sys_domain;
	else
		return getDefaultDomain();
}