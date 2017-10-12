/*
Class:
UserHelperUtilsPaysafe

 *Author:*
Joro Klifov

 *Company:*
Paysafe Group

 *Date created:*
03.10.2017

 *Type:*
Script Include Prototype

 *Table:*
various - sys_user, has role, has group

 *Global:*
TRUE / Client Callable

 *NOTE*
THIS CLASS IS TO BE EXTENDED AND USED FOR MOST OF THE CLEANUP OPERATIONS RELATED TO USERS
 */

var UserHelperUtilsPaysafe = Class.create();
UserHelperUtilsPaysafe.prototype = {
	initialize: function() {
	},
	//Set limit for concurrent DB operatins at once
	batch: 250,
	//if = false, no update/delere operations
	run: true,
	//print debug messages
	debug: true,
	//Set to false will not send notifications
	notify: false,
	/*
	@log method
	@param String
	@returns void

	Used to log debug messages
 	*/
	log: function(message) {

		if (this.debug) {
			gs.log(message, this.type);
		}
	},

	/*
	@log getInactiveUsers
	@param String
	@callback
	@returns void

	Get users not logged last 3 months and not being speacial ones
 	*/
	getInactiveUsers: function(role) {

		var notifyUsers = [];

		var users = new GlideRecord('sys_user');
		users.addEncodedQuery("last_login_timeRELATIVELT@month@ago@3^ORlast_login_timeISEMPTY^roles=" + role + "^u_for_strip=false^u_deactivation_exclusion=false^internal_integration_user=false^web_service_access_only=false");
		users.setLimit(this.batch);
		users.query();
		while(users.next()) {

			users.u_first_check = new GlideDateTime(gs.now());
			users.u_for_strip = true;
			users.setForceUpdate(true);
			users.setWorkflow(false);
			if (this.run)
				users.update();
			//   notifyUsers.push(users.email + "");
			this.log("User " + users.email + " updated to Marked for Strip" + notifyUsers);
			if(this.notify) this.createEmailEvent(users, users.email, "Role remover");

		}

		//this.log("Users Array Inactive and For Notify passed. Conatins : " + notifyUsers);
		//return notifyUsers;

	},

	/*
	@log flushUserResetRole
	@param String
	@returns void

	Reset user for new 90 days wait period
 	*/
	flushUserResetRole: function(user) {

		var resetUserRole = new GlideRecord('sys_user');
		resetUserRole.addQuery('email', user);
		resetUserRole.query();
		if (resetUserRole.next()) {

			resetUserRole.last_login = new GlideDateTime(gs.now());
			resetUserRole.u_for_strip = false;
			resetUserRole.u_first_check = new GlideDateTime(gs.now());
			resetUserRole.setForceUpdate(true);
			resetUserRole.setWorkflow(false);
			if (this.run) resetUserRole.update();
				this.log("User " + user + " has been reset for Role Stripping");
		}

	},

	/*
	@checkToDelete method
	@param String
	@callback
	@returns void

	Verifies the users are for role/group strip
 	*/
	checkToDelete: function() {

		var checkUser = new GlideRecord('sys_user');
		checkUser.addEncodedQuery('u_first_checkRELATIVELE@dayofweek@ago@7^u_for_strip=true^active=true');
		checkUser.query();
		while (checkUser.next()) {
			this.log("User is for Role Strip/Delete : " + checkUser.email);
			if (this.roleStripUser(checkUser.sys_id, 'itil')) {

				checkUser.u_remove_role = true;
				checkUser.u_first_check = new GlideDateTime(gs.now());
				checkUser.setForceUpdate(true);
				checkUser.setWorkflow(false);
				checkUser.update();
			}
		}
		//return false;
	},

	/*
	@roleStripUser method
	@param String
	@param String
	@callback
	@returns void

	Used to strip the roles
 	*/
	roleStripUser: function(user, role) {

		var stripUser = new GlideRecord('sys_user_has_role');
		//var usr = this.getSysID('sys_user', user);
		var rol = this.getSysID('sys_user_role', role);
		this.log("SYSIDs : " + user + "  " + rol);
		//stripUser.addQuery('user', usr["sys_id"]);
		stripUser.addQuery('user', user);
		stripUser.addQuery('role', rol);
		stripUser.query();

		while (stripUser.next()) {
			this.log("Role Granted by " + stripUser["granted_by"]);
			//if (stripUser["granted_by"]) this.groupStripUser(usr["sys_id"], stripUser["granted_by"]);
			if (stripUser["granted_by"]) this.groupStripUser(user, stripUser["granted_by"]);
				//stripUser.setWorkflow(false);
			if (this.run) stripUser.deleteRecord();
				this.log("Record Deleted. Stripped Rights for " + user);


		}

	},

	/*
	@groupStripUser method
	@param String
	@param String
	@returns void

	Used to strip groups. Only groups that gave the role, will be removed
 	*/
	groupStripUser: function(user, group) {

		var stripGroup = new GlideRecord('sys_user_grmember');
		stripGroup.addEncodedQuery('user=' + user + '^group=' + group);
		stripGroup.query();
		while (stripGroup.next()) {

			stripGroup.setWorkflow(false);
			if (this.run) stripGroup.deleteRecord();
				this.log("Record Deleted. Group removed. " + user);
		}
	},

	/*
	@getSysID method
	@param String
	@param String
	@returns rel

	Used to return sys_id of a value
 	*/
	getSysID: function(table, value) {

		var rec = new GlideRecord(table);
		if (rec.get(value)) {

			this.log("Got resord, return sys_id  :  " + rec.sys_id + "  for table & field " + table + "  :  " + value);
			return rec.sys_id;
		}
		var recc = new GlideRecord(table);
		recc.addQuery('email', value);
		recc.query();
		if(recc.next()) {
			this.log("Got user record " + recc.sys_id + "  " + recc.email);
			return recc;
		}


	},

	/*
	@createEmailEvent method
	@param String
	@param String
	@param String
	@returns void

	Trigger event creation
 	*/
	createEmailEvent: function (obj, user, msg) {
		gs.eventQueue("notifi.itil.role.removal", obj , user, msg);
		this.log("Event to Notify user triggered");
	},

	/*
	@createEmailEventStripped method
	@param String
	@param String
	@param String
	@returns void

	Trigger event creation
 	*/
	createEmailEventStripped: function (obj, user, msg) {
		gs.eventQueue("notifi.itil.role.stripped", obj , user, msg);
		this.log("Event to Notify Role Stripped user triggered");
	},

	/*
	@stripRolesFromEmail method
	@param String
	@returns void

	Used to remove roles. Triggered by inbound action trigger
 	*/
	stripRolesFromEmail: function(user) {

		var users = new GlideRecord('sys_user');
		users.addQuery('email', user);
		users.query();
		if (users.next()) {
			this.roleStripUser(users.sys_id, "itil");
			users.u_first_check = false;
			users.u_for_strip = false;
			users.u_remove_role = true;
			users.roles = '';
			users.setForceUpdate(true);
			users.setWorkflow(false);
			users.update();
			this.log("Roles Stripped Triggered by Email Rehection. Answer was NO");

		}
	},

	type: 'UserHelperUtilsPaysafe'
};
