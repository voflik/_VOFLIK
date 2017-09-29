var ITCE_SuccessFactors_Integration_Utils = Class.create();
ITCE_SuccessFactors_Integration_Utils.prototype = {
	initialize: function() {
	},
	debug: true,
	log: function(message) {
		if(this.debug) {
			gs.log(message, this.type);
		}
	},
	//Remove Groups from inactivated users and set notification to 1 (Disabled)
	checkIfInactive: function(email, sfid, id, active) {
		if(active == 'false' || active == false){
			this.log("Found Inactivated user ");
			var uid = "";
			var user = new GlideRecord('sys_user');
			user.addQuery('email', email);
			user.addQuery('user_name', email);
			user.addQuery('u_external_id', id);
			user.addOrQuery('u_successfactors_userid', sfid);
			user.query();
			
			if(user.next()){
				this.log("Found Inactivated User  : " + user.user_name + " and email " + user.email);
				user.notification = 1;
				user.active = active;
				uid = user.sys_id;
				user.setWorkflow(false);
				user.update('Disabled email by successfactors integration.');
				//adding to check if user have groups/roles at all. If not , dont execute action below
				var role = user.getUserRoles();
				role = role.toString();
				role = role.split(",").length;
				var group = user.getMyGroups();
				group = group.toString();
				group = group.split(",").length;
				this.log("Roles are : " + role + " Groups are : " + group);
				//if role or group length is bigger than 0 start group removal
				if((group > 0 || role > 0) && typeof(role)!= 'undefined' || typeof(group) != 'undefined'){
					var userGroup = new GlideRecord('sys_user_grmember');
					userGroup.addQuery('user' , uid);
					userGroup.query();
					while (userGroup.next()){
						
						userGroup.deleteRecord();
						this.log("Deleted " + userGroup.group.getDisplayValue() + " from user " + user.user_name);
						
					}
					return true;
				}
				
			}
		}
		else {
			
			return false;
		}
	},
	getServiceNowManager: function(successFactorsUserId) {
		var user = new GlideRecord('sys_user');
		user.addQuery('u_successfactors_userid', successFactorsUserId);
		user.query();
		this.log('Searching for manager with Id: ' + successFactorsUserId);
		if(user.next()) {
			this.log('Found manager with Id: ' + successFactorsUserId + ' - ' + user.name);
			return user.sys_id;
		}
		this.log('Could not find manager with Id: ' + successFactorsUserId);
		return;
	},
	
	getServiceNowCompany: function(successFactorsCompany) {
		this.log('Searching for existing or mapped company: ' + successFactorsCompany);
		var existingCompany = new GlideRecord('core_company');
		existingCompany.addQuery('name', successFactorsCompany);
		existingCompany.query();
		if(existingCompany.next()) {
			this.log('Found existing company ' + successFactorsCompany + '. Will not search for mapping.');
			return existingCompany.sys_id;
		}
		var companyMapping = new GlideRecord('u_successfactors_company_mapping');
		companyMapping.addQuery('u_successfactors_company', successFactorsCompany);
		companyMapping.query();
		if(companyMapping.next()) {
			this.log('Found mapped company ' + successFactorsCompany + ' - ' + companyMapping.u_servicenow_company);
			return companyMapping.u_servicenow_company.sys_id;
		}
		
		this.log('Could not find mapped or existing company ' + successFactorsCompany + ', returning SF passed company.');
		//We need the company with its suffix - eg. Paysafe (BULGARIA), Paysafe (IOM)
		// hence if no such record is found we will pass the company and insert into company table
		if(successFactorsCompany.toString() != 'null' || successFactorsCompany.toString() != '' || successFactorsCompany != null || !successFactorsCompany.nil()){
			var newCompany = new GlideRecord('core_company');
			newCompany.initialize();
			newCompany.name = successFactorsCompany;
			if(!source.u_location.nil() || source.u_location.toUpperCase() != 'N/A' || source.u_location != 'null'){
				newCompany.u_location = this.getServiceNowLocation(source.u_location.replace(/\(.+?\)/,""));
			}
			if(!source.u_country.nil() || source.u_country != 'null'){
				newCompany.country = source.u_country;
			}
			var sys = newCompany.insert();
			this.log("New COMPANY IS : newCompany.name " + newCompany.name +  " company.getDisplayName() " + newCompany.sys_id);
			this.log("LOCATION IS : " + newCompany.u_location);
			
			return sys;
		}
		else {
			this.log('No Company found or passed, so escaping null recs and retrn Not defined');
			//'Not provided' company - change it with default comp. on prod !!!
			//return 'c5bb002b6f579100685246916e3ee405';
			return 'Not provided';
		}
		
	},
	
	//Method checkCostCenter() to map/create cost centers as passed from SF
	checkCostCenter: function(cost){
		var cc = new GlideRecord('cmn_cost_center');
		cc.addQuery('name', cost);
		cc.query();
		if(cc.next()){
			this.log("Found existing Cost Center for " + target.user_name + " = " + cc.name);
			return cc.sys_id;
		}
		else {
			if(this.validate(cost, 'Not provided')){
				
				var newcc = new GlideRecord('cmn_cost_center');
				newcc.initialize();
				newcc.name = cost.toString();
				newcc.code = this.validate(source.u_costcentercode, 'Not provided');
				newcc.account_number = this.validate(source.u_businessunitcode, 'Not provided');
				var newCostCenter = newcc.insert();
				this.log("New Cost Center added : " + newcc.name + " sysid is : " + newCostCenter + " AND NAME FOR SYSID " + newCostCenter.name);
				//
				return newCostCenter;
							
			}
			//Sys_if of cost center "Not provided"
			return 	'8714e1350fa9ba409eca83fc22050e7d';
			
		}
		
		
	},
	
	//Lamers
	getServiceNowLocation: function(successFactorsLocation) {
		this.log('Searching for existing or mapped location: ' + successFactorsLocation);
		var existingLocation = new GlideRecord('cmn_location');
		existingLocation.addQuery('name', successFactorsLocation);
		existingLocation.query();
		if(existingLocation.next()) {
			this.log('Found existing location ' + successFactorsLocation + '. Will not search for mapping.');
			return existingLocation.sys_id;
		}
		var locationMapping = new GlideRecord('u_successfactors_location_mapping');
		locationMapping.addQuery('u_successfactors_location', successFactorsLocation);
		locationMapping.query();
		if(locationMapping.next()) {
			this.log('Found mapped location ' + successFactorsLocation + ' - ' + locationMapping.u_servicenow_location);
			return locationMapping.u_servicenow_location.sys_id;
		}
		else{
			this.log('Could not find mapped or existing location ' + successFactorsLocation + ', returning empty string.');
			gs.eventQueue('successfactors.new.location.hr.notify', null, successFactorsLocation, null);
			//'Not provided' location. Change it with sys_id on prod!!!
			return;//'df33a9b10fa9ba409eca83fc22050ebc';
		}
		
	},
	//Method validate() validates if the passed data is not null or undefined.
	//otherwise the system creates new 'null' string records.
	
	validate: function(val, def) {
		
		this.log("REAL VAL is : " + val + " TYPE IS " + typeof(val));
		this.log("BEFORE String is : " + val + " and type : " + typeof(val));
		var cleanStr = val.replace(/null/g,"").trim();
		this.log("AFTER String is : " + cleanStr + " and type : " + typeof(val) + " AND TYPE OF CLEAN IS " + typeof(cleanStr));
		if(typeof(cleanStr) == 'undefined' || cleanStr.toString() == 'null' || cleanStr.toString() == '' || cleanStr.nil() || cleanStr == null || cleanStr === null || cleanStr === 'null'){
			this.log("RETUENING NULL HITTED + " + cleanStr + " passing back : " + def + "  type of : " + typeof(def));
			if(def == '' || def.nil() || def == 'Not defined'){
				return 'Not provided';
				//def = '1460fb5d0fe5fa0095ae079ce1050ec2';
			}
			return def;
		}
		
		return cleanStr;
	},
	
	emailValid: function(email) {
		var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},
	
	//Added to escape double quotes 13.02.17 JKlifov
	normalizeNames: function(string) {
		
		return string.replace(/(\'\')|(\")|(\"\")/, "'");
	},
	
	//type of the class object
	type: 'ITCE_SuccessFactors_Integration_Utils'
};


