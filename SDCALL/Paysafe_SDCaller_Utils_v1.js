/*
   Function: NAME
   Paysafe_SDCaller_Utils
  
   *Author:*
  Joro Klifov

   *Company:*
  Paysafe Group

   *Date created:* 
   29.05.2017

   *Type:* 
   SI
	
   *Table:*
   new_call
   
   *Global:*
   FALSE
*/


var Paysafe_SDCaller_Utils = Class.create();
Paysafe_SDCaller_Utils.prototype = {
	initialize: function() {
	},
	//debugger,			
	debug: true,
	
		
	//Logs all messages with source set to "TechOps: Handle Emails"
	log: function (message) {
		var name = 'Paysafe_SDCaller_Utils';
		if(this.debug) {
			gs.log(message,name);
		}
	},
	
	//Cleans the email subject from reply prefixes
	cleanUpEmailSubject: function(subject) {
		
		try {
		
			this.log('cleanUpEmailSubject: cleaning up ' + subject);
			var prefixes = ['re:','re.:','отн.:', 'отн:', 'aw:', 'aw.:', 'fw:', 'fw.:', 'fwd:', 'fwd.:'];
			subject = subject.toLowerCase();
			
			for(var i = 0; i < prefixes.length; i++) {
				subject = subject.replace(prefixes[i],'');
			}
			this.log('cleanUpEmailSubject: cleaned up ' + subject);
			return subject.trim();
		}
		catch(ex){
			this.log("Exceprion occured in cleanUpEmailSubject() " + ex);
			return;
		}
	},

	//Returns a reference to an already created active incident or change with the same subject or null if there is no such ticket.
	getRecordFromSubject: function(subject) {
		try {
			this.log('getRecordFromSubject: getting first call tkt for ' + subject);
			var existingRecord = new GlideRecord('new_call');
			existingRecord.addQuery('u_index', subject);
			existingRecord.addQuery('u_active','true');
			existingRecord.query();
			if(existingRecord.next()) {
				this.log('getRecordFromSubject: found an record for subject ' + subject);
				return existingRecord.sys_id;
			

			}
			this.log('getRecordFromSubject: couldn\'t find an record for subject ' + subject);
			return null;
		} catch (ex) {
			this.log('getRecordFromSubject: Exception ' + ex);
			return null;
		}
	},
	//Check in sys_user tbl if this email has alredy user account. IN not, create one and return sys_id
	
	checkIfEmailHasUser:  function(from){
		
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
	
	//Check if vendor exists and map it to the ticket. Otherwise it will reject the call as irrelevant
		
	getMyVendor: function (vend) {
		
		try {
			//cleanVend strips all from th email but domain, we use it to search in the table for such name
			//cleanedVendDom is stripping all from email but the part from @ on. Then search in the table for such email/1/2
			//We search with cleaned domain and with email, respectfully by domain1/2 and email1/2/3
			vend = vend.toLowerCase();
			var mail = vend.toLowerCase();
			//var cleanVend = vend.replace(/^(?:[^@\n]+@)?([^\.\/\n]+)/, '');
			var cleanVend = vend.replace(/(^.+@)|(\.+?.{1,3})/, '');
			var cleanVendDom = cleanVend.replace(/(\.+?.{1,3})/, '');
			this.log("Clean cleanVend: " + cleanVend + " cleanVendDom : " + cleanVendDom);
			this.log("Mail " + mail);
			var vd = new GlideRecord('core_company');
			
			vd.addQuery('u_paysafe_vendor', 'yes');
			vd.addQuery('u_active', 'true');
			var x = vd.addQuery('u_primary', cleanVendDom);
			var x2 = x.addOrCondition('u_secondary',cleanVendDom);
			var x3 = x2.addOrCondition('u_email', mail);
			var x4 = x3.addOrCondition('u_email_2', mail);
			var x5 = x4.addOrCondition('u_email_3', mail);
			var x6 = x5.addOrCondition('u_domain', cleanVendDom);
			
			vd.query();
			if(vd.next()){
				this.log("Found provider/vendor " + vd.name);
				return true;
			}
			else {
				this.log("This provider/vendor " + cleanVend + " , with search key = "+ cleanVendDom + " , and original values passed = " + vend + " is not on the list ");
				return false;
				
			}
		}
		catch(ex){
			this.log("Execption in getMyVendor() " + ex);
			return;
		}
	},
	
	//Similar to getMyVendor but for fill
	getVendorCompany: function(user) {
		
		try {
			var comp = new GlideRecord('core_company');
			var x = comp.addQuery('u_email', user);
			var y = x.addOrCondition('u_email_2', user);
			var z = y.addOrCondition('u_email_3', user);
			comp.query();
			if(comp.next()){
				this.log("getVendorCompany => user " + user + "  " + comp.u_domain + "  " + comp.name);
				return comp.sys_id;
			}
				

			else {
				this.log("This passes user => " + user +  " is not on the list ");
				
			}
		}
		catch(ex){
			this.log("Exception in getMyVendor() " + ex);
			return;
		}
	},
	
	//Populate the BS depending on the company 
	getBS: function (comp){
		
		try  {
			var result = {};
			var bs = new GlideRecord('core_company');
			bs.addQuery('u_paysafe_vendor', 'yes');
			bs.addQuery('name', comp);
			bs.query();
			while(bs.next()){
				
				result.push(bs.u_bs);
			} 
			gs.log("Return from getBS is : " + result);
			return result;
		}
		catch(ex){
			this.log("Exception in getBS() " + ex);
			return;
		}
	},
	
	type: 'Paysafe_SDCaller_Utils'
};