gs.include('validators');

(function(current){
	
	var sd = new Paysafe_SDCaller_Utils();
	
	//Checking if email is in forbidden list
	if(sd.checkForForbidden(email.from.toLowerCase())) {
		sd.log("InboundAction: Found forbidden email. Quit...");
		return;
	}
	
	var cleanSubject = sd.cleanUpEmailSubject(email.subject.trim());
	var cleanBody = sd.cleanUpSignature(email.body_text);
	
	if(email.from != ""){
		
		sd.log("InboundAction Email not empty. Create tkt with subject : " + cleanSubject);
		var existingCall = sd.getRecordFromSubject(cleanSubject);
		
		if(existingCall) {
			
			sd.log("InboundAction Found for update!");
			
			
			var rec = new GlideRecord('new_call');
			if(rec.get(existingCall)){
				rec.u_journal_1 = "Update from: " + email.origemail + "\n\n" +  cleanBody;
				rec.update();
				//Adding the relation to email tbl
				sd.setTargetRecord(sys_email.uid, existingCall);
			}
			
		} else {
			
			current.u_active = true;
			current.u_index = cleanSubject;
			
			//For STRY STRY0010259	[Service Desk Caller] - status UNKNOWN and dash
			//BUG with user and company. If user doesnt have related company, company will be null hence no BS
			
			if(sd.getVendorCompany(email.from)) {
				current.company = sd.getVendorCompany(email.from);
				current.description = "New ticket received from: " + '\n' + email.origemail + "\n"  + cleanBody;
				current.short_description = cleanSubject;
				current.u_html = email.html;
				current.call_type = "triage";
				current.caller = email.from;
				current.u_bs = current.company.u_bs;
				current.contact_type = "email";
				current.u_assignment_group = current.u_bs.support_group;
				
			} else {
				current.company.setDisplayValue("UNKNOWN");
				current.description = "New UNKNOWN ticket received from: " + '\n' + email.origemail + "\n"  + email.body_text;
				current.short_description = cleanSubject;
				current.call_type = "triage";
				current.caller = email.from;
				current.contact_type = "email";
				current.u_state = '-100';
			}
			
			
			current.notify = 2;
			
			if (email.body.assign != undefined && email.body.assign != "")
				current.assigned_to = email.body.assign;
			
			if (email.importance != undefined && email.importance != "") {
				if (email.importance.toLowerCase() == "high")
					current.priority = 1;
			}
			
			
			var sysid = current.insert();
			sd.addCallToRelationship(sysid , cleanSubject);
			sd.log("InboundAction New SD CALL ticket created : " + current.number);
			
		}
		
	} else {
		sd.log("InboundAction Nothing to insert/update!");
	}
	
	
})(current);