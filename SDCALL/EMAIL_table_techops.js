(function executeRule(current, previous /*null when async*/) {
	gs.log('Checking NET/Techops incident with subject ' + current.subject + ' with recipients ' + current.recipients,'TechOps: Append Incident Subject');
	if(current.recipients.toLowerCase().indexOf('techopsalert@paysafe.com')>=0 ||
		current.recipients.toLowerCase().indexOf('internalsupport@optimalpayments.com')>=0 ||
	current.recipients.toLowerCase().indexOf('technicaloperations@optimalpayments.com')>=0 ||
	current.recipients.toLowerCase().indexOf('netops-requests@optimalpayments.com')>=0 ||
	current.recipients.toLowerCase().indexOf('netops-requests@paysafe.com') >=0 ||
	current.recipients.toLowerCase().indexOf('test-techop-snow@paysafe.com')>=0 ||
	current.recipients.toLowerCase().indexOf('technicaloperations@paysafe.com')>=0 || 
	current.recipients.toLowerCase().indexOf('internalsupport@paysafe.com')>=0 || 
	current.recipients.toLowerCase().indexOf('techopsalert@optimalpayments.com')>=0)  {
		gs.log('Processing NET/Techops incident with subject ' + current.subject,'TechOps: Append Incident Subject');
		var rePrefixes = ['re:','re.:','отн.:', 'отн:', 'aw:', 'aw.:'];
		var fwdPrefixes = ['fw:', 'fw.:', 'fwd:', 'fwd.:'];
		var emailUtils = new ITCE_EmailUtilities();
		var cleanedUpSubject = emailUtils.cleanUpEmailSubject(current.subject);
		gs.log('Incident cleaned up subject is: ' + cleanedUpSubject,'TechOps: Append Incident Subject');
		var existingIncident = "";
		gs.log('Getting incident from subject:' + cleanedUpSubject,'TechOps: Append Incident Subject');
		existingIncident = emailUtils.getIncidentFromSubject(cleanedUpSubject);
		gs.log('Got incident from subject:' + cleanedUpSubject + ': ' + existingIncident,'TechOps: Append Incident Subject');
		if(existingIncident != null) {
			var incident = new GlideRecord('incident');
			incident.get(existingIncident);
			current.subject = current.subject + ' '+ incident.number;
			//Check if this is a forward email and append suffix
			for(var i = 0; i<fwdPrefixes.length; i++) {
				if(current.subject.toLowerCase().indexOf(fwdPrefixes[i]) === 0) {
					current.subject = "RE: " + current.subject + ' (#FWD)';
					current.receive_type = 'reply';
					gs.log('Email with subject ' + current.subject + ' is forward. Transforming to reply in order to attach attachments.','TechOps: Append Incident Subject');
					break;
				}
			}
			var reply = false;
			//Check if this is a new email and append suffix
			for(var j = 0; j<rePrefixes.length; j++) {
				if(current.subject.toLowerCase().indexOf(rePrefixes[j]) === 0) {
					reply = true;
					break;
				}
			}
			if(!reply) {
				current.receive_type = 'reply';
				current.subject = "RE: " + current.subject + ' (#NEW)';
				gs.log('Email with subject ' + current.subject + ' is new. Transforming to reply in order to attach attachments.','TechOps: Append Incident Subject');
			}
		} else {
			current.subject = "RE: " + current.subject + ' (#NEW)';
			current.receive_type = 'reply';
			gs.log('Email with subject ' + current.subject + ' is new. Transforming to reply in order to attach attachments.','TechOps: Append Incident Subject');
		}
		
	}
	
})(current, previous);