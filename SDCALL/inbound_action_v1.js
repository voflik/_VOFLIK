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