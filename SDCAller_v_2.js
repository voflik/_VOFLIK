var Paysafe_SDCaller_Utils = Class.create();
Paysafe_SDCaller_Utils.prototype = {
	initialize: function() {
	},
	//debugger,			
	debug: true,
	//Cleans the email subject from reply prefixes
	cleanUpEmailSubject: function (subject) {
		this.log('cleanUpEmailSubject: cleaning up ' + subject);
		var prefixes = ['re:','re.:','отн.:', 'отн:', 'aw:', 'aw.:', 'fw:', 'fw.:', 'fwd:', 'fwd.:'];
		subject = subject.toLowerCase();
		for(var i = 0; i < prefixes.length; i++) {
			subject = subject.replace(prefixes[i],'');
		}
		this.log('cleanUpEmailSubject: cleaned up ' + subject);
		return subject.trim();
	},
	//Logs all messages with source set to "TechOps: Handle Emails"
	log: function (message) {
		var name = 'Paysafe_SDCaller_Utils';
		if(this.debug) {
			gs.log(message,name);
		}
	},
	//Returns a reference to an already created active incident or change with the same subject or null if there is no such ticket.
	getRecordFromSubject: function (subject) {
		try {
			this.log('getRecordFromSubject: getting incident/changes for ' + subject);
			var existingRecord = new GlideRecord('task');
			existingRecord.addQuery('short_description', subject);
			existingRecord.addNotNullQuery('active');
			existingRecord.query();
			while(existingRecord.next()) {
				this.log('getRecordFromSubject: found an record for subject ' + subject);
				this.log('getRecordFromSubject: checking class ');
								
				if(existingRecord.getRecordClassName() == 'incident') {
					var inc = new GlideRecord('incident');
					inc.addQuery('sys_id', existingRecord.sys_id);
					inc.query();
					if(inc.next()){
						return inc.number;
					}
					
					
				}
				
					if(existingRecord.getRecordClassName() == 'change') {
					var chg = new GlideRecord('change_request');
					chg.addQuery('sys_id', existingRecord.sys_id);
					chg.query();
					if(chg.next()){
						return chg.number;
					}
					
					
				}
			}
			this.log('getRecordFromSubject: couldn\'t find an record for subject ' + subject);
			return null;
		} catch (ex) {
			this.log('getRecordFromSubject: Exception ' + ex);
			return null;
		}
	},
	//Check in sys_user tbl if this email has alredy user account. IN not, create one and return sys_id
	
	checkIfEmailHasUser:  function (from){
		
		try {
			var usr = new GlideRecord('sys_user');
			usr.addQuery('email', from);
			usr.query();
			if(usr.next()){
				return usr.sys_id;
			} 
			
			
			
		} catch(ex){
			this.log('checkIfEmailHasUser: exception occured ' + ex); 
		}
		
	},
	
	addCallToRelationship: function (incident, subject) {
		this.log('addIncidentToSubjectRelationship: setting incident ' + incident + ' for ' + subject);
		var existingRecord = new GlideRecord('u_techops_email_incidents');
		existingRecord.initialize();
		existingRecord.u_incident = incident;
		existingRecord.u_email_subject = subject;
		existingRecord.insert();
	},
	
	//Check if vendor exists and mapp it to the ticket. Otherwise it will reject the call as irrelevant
		
	getMyVendor: function (vend) {
		//cleanVend strips all from th email but domain, we use it to search in the table for such name
		//cleanedVendDom is stripping all from email but the part from @ on. Then search in the table for such email/1/2
		vend = vend.toLowerCase();
		var mail = vend.toLowerCase();
		//var cleanVend = vend.replace(/^(?:[^@\n]+@)?([^\.\/\n]+)/, '');
		var cleanVend = vend.replace(/(^.+@)|(\.+?.{1,3})/, '');
		var cleanVendDom = vend.replace(/(@.*)/, '');
		this.log("Clean vendor " + cleanVend);
		this.log("Mail " + mail);
		var vd = new GlideRecord('core_company');
		
		vd.addQuery('u_paysafe_vendor', 'yes');
		var x = vd.addQuery('u_primary', '=', cleanVend);
		x.addOrCondition('u_secondary','=',cleanVend);
		x.addOrCondition('u_email', mail);
		x.addOrCondition('u_email_2', mail);
		x.addOrCondition('u_email_3', mail);
		
		vd.query();
		if(vd.next()){
			this.log("Found vendor " + vd.name);
			return true;
		}
		else {
			this.log("This vendor  CLEAN => " + cleanVend + " CLEAN DOM => "+ cleanVendDom + " ORIG VAL POASSED ===  " + vend + " is not on the list ");
			return false;
			
		}
	},
	
	//Similar to getMyVendor but for fill
	getVendorCompany: function (user) {
		
		var comp = new GlideRecord('core_company');
		var x = comp.addQuery('u_email', user);
		x.addOrCondition('u_email_2', user);
		x.addOrCondition('u_email_3', user);
		comp.query();
		if(comp.next()){
			this.log("getVendorCompany => user " + user + "  " + comp.u_domain + "  " + comp.name);
			return comp.sys_id;
		}
			

		else {
			this.log("This passes user => " + user +  " is not on the list ");
			
		}
	},
	
	//Populate the BS depending on the company 
	getBS: function (comp){
		
		var bs = new GlideRecord('core_company');
		bs.addQuery('name', comp);
		bs.query();
		if(bs.next()){
			return bs.u_bs;
		} else {
				
			this.log("BS not found for " + bs.name);
		}
			
	},
	
	//This will do a suggestion based on table ml_decision (ML based desision)
	getSuggestion(mail){
		var sub = mail.subject;
		var bdy = mail.body;
		
		var src = new GlideRecord('ml_decision');
		
		
	},
	
	type: 'Paysafe_SDCaller_Utils'
};