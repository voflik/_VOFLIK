/*
   Class: 
   Paysafe_SDCaller_Utils
  
   *Author:*
  Joro Klifov

   *Company:*
  Paysafe Group

   *Date created:* 
   29.05.2017

   *Type:* 
   Script Include Prototype
	
   *Table:*
   new_call
   
   *Global:*
   FALSE
*/


var Paysafe_SDCaller_Utils = Class.create();
Paysafe_SDCaller_Utils.prototype = {
	initialize: function() {
	},
	/*
	@debug variable
	@param bool 
	
	*/			
	debug: true,
	
		
	/*
	@log method
	@param String 
	@returns void
	
	Used to log debug messages
	*/
	log: function (message) {
		var name = 'Paysafe_SDCaller_Utils';
		if(this.debug) {
			gs.log(message,name);
		}
	},
	/*
	@cleanUpEmailSubject method
	@param String 
	@returns Object
	
	Used to clean the mail subject from all prefixes and returns the cleaned up subject, later used for short description
	*/
	cleanUpEmailSubject: function(subject) {
		
		try {
		    var subjArr = [];
			this.log('cleanUpEmailSubject: cleaning up ' + subject);
			var prefixes = ['re:','re.:','отн.:', 'отн:', 'aw:', 'aw.:', 'fw:', 'fw.:', 'fwd:', 'fwd.:','re: ','re.: ','отн.: ', 'отн: ', 'aw: ', 'aw.: ', 'fw: ', 'fw.: ', 'fwd: ', 'fwd.: '];
			//double replace for RE: FW:
			
			for(var i = 0; i < prefixes.length; i++) {
				subject = subject.replace(prefixes[i],'');
			}
			
			this.log('cleanUpEmailSubject: cleaned up ' + subject);
			
			//return subject.replace(/\w{2,3}\:\s{0,1}|\w{2,3}\.\:\s{0,1}|\W{2,3}\:\s{0,1}|\W{2,3}\.\:\s{0,1}/gmi, "");
			return subject.replace(/([r]|[a]|[f]).{1,2}\.?\:\s?gmi, "").replace(/^\s{1}|\s{1,3}$/gmi, "");
		}
		catch(ex){
			this.log("Exceprion occured in cleanUpEmailSubject() " + ex);
			return;
		}
	},
		/*
	@cleanUpSignature method
	@param String 
	@returns String
	
	Used to replace body from signature via RegEx with empty string
	*/
	cleanUpSignature: function(body){
		this.log("cleanUpSignature: cleaning up body from \n" + body + "\n" + body.replace(/^Paysafe Group.*\n{0,3}.*\n.*transmission\./gmi, "").replace(/\[cid\:.*\]/gmi, "").replace(/\n{5,10}/gmi, ""));
		return body.replace(/^Paysafe Group.*\n{0,3}.*\n.*transmission\./gmi, "").replace(/\[cid\:.*\]/gmi, "").replace(/\n{5,10}/gmi, "");
		
	},
	/*
	@getRecordFromSubject method
	@param String 
	@returns reference
	
	Used to query for existing record via its short description = subject
	*/
	getRecordFromSubject: function(subject) {
		try {
			this.log('getRecordFromSubject: Subject:  ' + subject);
			var existingRecord = new GlideRecord('u_sdcall_subject');
			existingRecord.addQuery('u_subject', subject);
			//
			//TODO: Add additional field active in the table so only active records to be updated
			//
			existingRecord.query();
			if(existingRecord.next()) {
				this.log('getRecordFromSubject: found an record for subject ' + subject + "  AND SYSID " + existingRecord.u_sdcall);
				return existingRecord.u_sdcall;
			

			}
			this.log('getRecordFromSubject: couldn\'t find an record for subject ' + subject);
			return null;
		} catch (ex) {
			this.log('getRecordFromSubject: Exception ' + ex);
			return null;
		}
	},
	/*
	@addCallToRelationship method
	@param reference 
	@param String
	@returns void
	
	Used to create the relationship between the subject (from email) and the record (SDCALL reference)
	This is done in relationship table
	*/
	addCallToRelationship: function (sdcall, subject) {
		this.log('addCallToRelationship ' + sdcall + ' for ' + subject);
		var existingRecord = new GlideRecord('u_sdcall_subject');
		existingRecord.initialize();
		existingRecord.	u_sdcall = sdcall;
		existingRecord.u_subject = subject;
		existingRecord.insert();
	},
	/*
	@getMyVendor method
	@param String
	@returns bool
	
	Search for if vendor exists. 
	
	!!! DEPRICATED !!!
	
	*/	
	getMyVendor: function (vend) {
		
		try {
			//cleanVend strips all from th email but domain, we use it to search in the table for such name
			//cleanedVendDom is stripping all from email but the part from @ on. Then search in the table for such email/1/2
			//We search with cleaned domain and with email, respectfully by domain1/2 and email1/2/3
			vend = vend.toLowerCase();
			var mail = vend.toLowerCase();
			//var cleanVend = vend.replace(/^(?:[^@\n]+@)?([^\.\/\n]+)/, '');
			var cleanVend = vend.replace(/(^.+@)/, "").replace(/(\.+?.{1,3})/, "");
			//commented as moved to table based forbidden mails
			//if( cleanVend.toString() === 'skrill' || cleanVend.toString() === 'fireeyecloud' ) return false;
			var cleanVendDom = vend.replace(/(@.*)/g, '');
			var vd = new GlideRecord('core_company');
			vd.addEncodedQuery('u_paysafe_vendor=yes^u_active=true^u_email=' + vend + '^ORu_email_2=' + vend + '^ORu_email_3=' + vend + '^ORu_domain=' + cleanVend + '^ORu_primary=' + cleanVend + '^ORu_secondary=' + cleanVend);
			vd.query();
			if(vd.next()){
				this.log("Found provider/vendor " + vd.name);
				
				return true;
			}
			else {
				this.log("This provider/vendor " + cleanVend + " , and original values passed = " + vend + " is not on the list ");
				return true;
			}
		}
		catch(ex){
			this.log("Execption in getMyVendor() " + ex);
			return;
		}
	},
	
	/*
	@getVendorCompany method
	@param String
	@returns Object
	
	Search for if vendor exists. 
	
	Returns the user's company (vendor/provider)
	
	*/	
	getVendorCompany: function(user) {
		
		try {
			
			var comp = new GlideRecord('core_company');
			comp.addEncodedQuery('u_email=' + user + '^ORu_email_2=' + user + '^ORu_email_3=' + user);
			comp.query();
			if(comp.next()){
				this.log("getVendorCompany => user " + user + "  " + comp.u_domain + "  " + comp.name);
				return comp.sys_id;
			}
			
			var usr = new GlideRecord('sys_user');
			usr.addQuery('email', user);
			usr.query();
			if(usr.next()){
				return usr.getValue('company');
			}
			else {
				
				this.log("This passes user => " + user +  " is not on the list ");
				return "UNKNOWN";
				
			}
		}
		catch(ex){
			this.log("Exception in getMyVendor() " + ex);
			return;
		}
	},
	
	//Get company for user that is not company related( read it vendor/provider)
	getUserCompany: function(user) {
		
		try {
			var comp = new GlideRecord('core_company');
			comp.addEncodedQuery('vendor=true^u_primary=' + user + '^ORu_secondary=' + user);
			comp.query();
			if(comp.next()){
				this.log("getUserCompany => user : " + user + " , vendor : " + comp.u_domain + " , vendor name : " + comp.name);
				return comp.sys_id;
			}
			else {
				
				this.log("This passes user => " + user +  " is not on the list ");
				return "UNKNOWN";
				
			}
		}
		catch(ex){
			this.log("Exception in getMyVendor() " + ex);
			return;
		}
	},
	
	//Populate the BS depending on the company 
	getBS: function(comp){
		
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
	// !!! NOT USED !!!
	//Create new vendor in table notknown
	setUnknownVendor: function(mail){
		try { 
			var vend = new GlideRecord('u_sdcall_unknown_provider');
			var cleanVend = mail.replace(/(^.+@)/,'').replace(/(\.+?.{1,3})/,'');
			vend.initialize();
			vend.u_name = cleanVend;
			vend.email = mail;
			vend.insert();
		} 
		catch(ex){
				this.log("setUnknownVendor error " + ex);
		}
	
	},
	
	getUnknownVendor : function(vend){
		
		try {
			var vendor = new GlideRecord('u_sdcall_unknown_provider');
			vendor.addQuery('u_email', vend);
			vendor.query();
			if(vendor.next()){
				return vendor.u_name;
			}
			else {
				return this.setUnknownVendor(vend);
			}
		}
		catch(ex){
				this.log("getUnknownVendor " + ex);
		}
	},
	/*
	@setRelatedUser method
	@param String 
	@returns void
	
    Set the company for a user with none. For UI action/frontend/user interaction decision
	*/
	setRelatedUser: function(email){
		var domUser = email.replace(/(^.+@)/, "").replace(/(\.+?.{1,3})/, "");
		var company = this.getUserCompany(domUser);
		if(company){
			var user = new GlideRecord('sys_user');
			user.addQuery('user_name', email);
			user.query();
			if(user.next()){
				
				user.company = company;
				user.update();
			
			}
		}
	

	},
	/*
	@setTargetRecord method
	@param String
	@param String
	@returns void
	
	Used to set taret record & table in sys_email table records (emails)
	takes two params - the UID of the sys_email object and the sys_id of the SDCALL record
	*/
	setTargetRecord: function(u, id){
		var email = new GlideRecord('sys_email');
		email.addQuery('uid', u);
		email.orderByDesc('sys_created_on');
		email.query();
		if(email.next()){
			this.log("setTargetRecord: Found email to update " + email.subject);
			email.target_table = 'new_call';
			email.instance = id;
			email.receive_type = 'reply';
			email.update();
		}
		
	},
	/*
	@checkForForbidden method
	@param String 
	@returns boolean
	
	Used to determine if a email or its domain are forbidden to create SDCALL records
	takes one param - the email to be checked for
	*/
	checkForForbidden: function(email){
		
		var rec = new GlideRecord('u_sdcall_forbidden');
		rec.addEncodedQuery('u_email=' + email + '^ORu_name=' + email + '^ORu_domainLIKE' + email.replace(/(^.+@)/, "").replace(/(\.+?.{1,3})/, ""));
		rec.query();
		if(rec.hasNext()){
			this.log("Found match! Emaail or its domain is forbidden to create SDCALL tickets!");
			return true;
		}
		this.log("Email OK for create SDCALL ticket");
		return false;
	},
	
	type: 'Paysafe_SDCaller_Utils'
};