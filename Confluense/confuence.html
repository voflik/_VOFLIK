var accright = new GlideRecord('u_sc_access_rights');
accright.addQuery('u_department', current.variables.department);
accright.addQuery('u_subrole', current.variables.sub_role);
accright.addQuery('u_type', 'Onboarding');
accright.query();

while (accright.next()) {
	
	
	
	var sctask = new GlideRecord('sc_task');
	var noTask = accright.u_no_task;
	gs.log("NO TASK IS: " + noTask);
	if(noTask.toString() === 'false'){
		sctask.request_item = current.sys_id;
		if(accright.u_it_support == true) {
			sctask.assignment_group = new ITRequestFulfillmentHelper().getAssignmentGroupForLocation(current.variables.u_office_location, current.opened_by);
		} else {
			sctask.assignment_group = accright.u_assignment_group;
		}
		if (accright.u_state == ""){
			sctask.state = 1;
		} else {
			sctask.state = accright.u_state;
		}
		sctask.short_description = "New joiner - " + current.variables.first_name + " " + current.variables.last_name + ", " + current.variables.start_date;
		sctask.description = accright.u_access_description;
		sctask.variables = current.variables;
		sctask.description = "Access Description: " + accright.u_access_description + '\n'+ '___________________________________________________________________________________________________'+ '\n' + '\n'+ current.description;
		var ctaskID = sctask.insert();
		
		var checklist = new GlideRecord('u_catalog_tasks_checklist');
		checklist.addQuery('u_type','Onboarding');
		checklist.addQuery('u_assignment_group',sctask.assignment_group);
		checklist.query();
		while(checklist.next()) {
			var check = new GlideRecord('u_checklist');
			check.u_change_task = ctaskID;
			check.u_check_list_item = checklist.u_checklist_item;
			check.insert();
		}
		
	} else if (accright.u_no_task && !accright.u_email.nil()) {
		
		gs.eventQueue("sc_task.onboarding.salesforce", current, accright.u_email, current.assignment_group.getDisplayValue());
		
	}
}
//Include.


{"type":"page","title":"new page",
"space":{"key":"IT"},"body":{"storage":{"value":"<p>This is a new page</p>","representation":
"storage"}}}




BODY
{
"id": "80742740",
"type": "page",
"status": "current",
"title": "Production",
"space":{
"id": 81395714,
"key": "IT",
"name": "Skrill Technology",
"type": "global",
"_links":{
"self": "https://confluence.neterra.paysafe.com/rest/api/space/IT"
},
"_expandable":{
"icon": "",
"description": "",
"homepage": "/rest/api/content/80741908"
}
},
"history":{
"latest": true,
"createdBy":{"type": "known", "profilePicture":{"path": "/s/en_GB/6212/d125ddfe4e16e78d1fea8ef42a18979f09319385.8/_/images/icons/profilepics/default.png",…},
"createdDate": "2013-10-30T00:35:56.000+01:00",
"_links":{
"self": "https://confluence.neterra.paysafe.com/rest/api/content/80742740/history"
},
"_expandable":{
"lastUpdated": "",
"previousVersion": "",
"nextVersion": ""
}
},
"version":{
"by":{"type": "known", "profilePicture":{"path": "/s/en_GB/6212/d125ddfe4e16e78d1fea8ef42a18979f09319385.8/_/images/icons/profilepics/default.png",…},
"when": "2017-05-18T09:50:17.957+02:00",
"message": "",
"number": 338,
"minorEdit": false
},
"extensions":{
"position": 39
},
"_links":{
"webui": "/display/IT/Production",
"tinyui": "/x/VAnQB",
"collection": "/rest/api/content",
"base": "https://confluence.neterra.paysafe.com",
"context": "",
"self": "https://confluence.neterra.paysafe.com/rest/api/content/80742740"
},
"_expandable":{
"container": "/rest/api/space/IT",
"metadata": "",
"operations": "",
"children": "/rest/api/content/80742740/child",
"ancestors": "",
"body": "",
"descendants": "/rest/api/content/80742740/descendant"
}
}