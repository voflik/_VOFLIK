/*** Changes made to this script are not supported by PagerDuty ***/
/*
 * PagerDuty API REST methods
 */

var PagerDuty_REST = Class.create();
PagerDuty_REST.prototype = {
  initialize: function() {
   t his.JSON = new global.JSON();

    //API properties
    this.authToken = gs.getProperty("x_pd_integration.api_key");
    this.baseRestEndpoint = gs.getProperty("x_pd_integration.rest_api_endpoint");
    this.eventsEndpoint = gs.getProperty("x_pd_integration.events_api_endpoint");

    this._errorMsg = "";
    this._hasError = false;
  },


  /**
   * Post message to generic async event API
   * @param {String} request body
   * @return {RESTResponse} post response
   */
  postEvent: function(body) {
    var bodyJSON = this.JSON.encode(body);
    gs.debug("_postEvent:body: " + bodyJSON);

    // Construct message
    try {
      var restMessage = new sn_ws.RESTMessageV2();
      restMessage.setHttpMethod("post");
      restMessage.setEndpoint(this.eventsEndpoint);
      restMessage.setRequestBody(bodyJSON);
      var response = restMessage.execute();

    } catch (ex) {
      this._setError("postEvent", ex);
      gs.error("_postEvent error: {0}", ex);
    } finally {
      return response;
    }
  },


  /**
   * Put message body to specific feature
   * @param {String} endpoint feature
   * @param {String} request body
   * @return {RESTResponse} post response
   */
  putREST: function(feature, body) {
    try {
      var bodyJSON = this.JSON.encode(body);
      gs.debug("putREST:body: " + bodyJSON);


      var restMessage = new sn_ws.RESTMessageV2();
      restMessage.setHttpMethod("put");
      restMessage.setRequestHeader("Authorization", "Token token=" + this.authToken);
      restMessage.setRequestHeader("Content-Type", "application/json");
      restMessage.setEndpoint(this.baseRestEndpoint + "/" + feature);
      restMessage.setRequestBody(bodyJSON);

      //Execute
      var response = restMessage.execute();
      var status = response.getStatusCode();
      gs.debug("putREST response status:{0}, body:{1}, haveError:{2}, errorMessage:{3}", status, response.getBody(),
        response.haveError(), response.getErrorMessage());

    } catch (ex) {
      this._setError("putREST", ex);
      gs.error("putREST error: {0}", ex);
    } finally {
      return response;
    }

  },


  /**
   * Post message body to specific feature
   * @param {String} endpoint feature
   * @param {String} request body
   * @return {RESTResponse} post response
   */
  postREST: function(feature, body) {
    try {
      var bodyJSON = this.JSON.encode(body);
      gs.debug("postREST:body: " + bodyJSON);


      var restMessage = new sn_ws.RESTMessageV2();
      restMessage.setHttpMethod("post");
      restMessage.setRequestHeader("Authorization", "Token token=" + this.authToken);
      restMessage.setRequestHeader("Content-Type", "application/json");
      restMessage.setEndpoint(this.baseRestEndpoint + "/" + feature);
      restMessage.setRequestBody(bodyJSON);

      //Execute
      var response = restMessage.execute();
      var status = response.getStatusCode();
      gs.debug("postREST response status:{0}, body:{1}, haveError:{2}, errorMessage:{3}", status, response.getBody(),
        response.haveError(), response.getErrorMessage());

    } catch (ex) {
      this._setError("postREST", ex);
      gs.error("postREST error: {0}", ex);
    } finally {
      return response;
    }

  },


  /**
   * Get query with parameters
   * @param {String} endpoint feature
   * @param {Object} message parameters
   * @return {RESTResponse} post response
   */
  getREST: function(feature, params) {
    // Send web request via PagerDuty's REST API

    // Configure REST message
    try {
      var restMessage = new sn_ws.RESTMessageV2();
      restMessage.setHttpMethod("get");
      restMessage.setRequestHeader("Authorization", "Token token=" + this.authToken);
      restMessage.setRequestHeader("Content-Type", "application/json");
      restMessage.setEndpoint(this.baseRestEndpoint + "/" + feature);

      for (parm in params) {
        restMessage.setStringParameter(parm, params[parm]);
      }

      //Execute
      var response = restMessage.execute();
      var status = response.getStatusCode();
      gs.debug("getREST response status:{0}, body:{1}, haveError:{2}, errorMessage:{3}", status, response.getBody(),
        response.haveError(), response.getErrorMessage());

    } catch (ex) {
      this._setError("getREST", ex);
      gs.error("_postEvent error: {0}", ex);
    } finally {
      return response;
    }

  },


  /**
   * Track error
   * @param {String} method reporting error
   * @param {String} error message
   * @return void
   */
  _setError: function(method, msg) {
    this._errorMsg = method + " error: " + msg;
    this._hasError = true;
  },

  /**
   * Does class have an error
   * @return {Boolean} has error
   */
  hasError: function() {
    return this._hasError;
  },


  /**
   * Get last error message
   * @return {String} error message
   */
  getError: function() {
    if (!gs.nil(this._errorMsg))
      return this._errorMsg;
  },

  type: 'PagerDuty_REST'
};





/*** Changes made to this script are not supported by PagerDuty ***/
/*
 * Class for testing PagerDuty components
 *
 * Usage: run scripts from background scripts to test a specific function
 *
 * var pdtest = new x_pd_integration.PagerDutyTest();
 * pdtest.testGetREST();
 *
 */


var PagerDutyTest = Class.create();
PagerDutyTest.prototype = {
	initialize: function() {},

	 /**
	  * Test API connection settings by making a REST get call for incident count 
	  * @return void - see debug output
	  */
	testConnection: function() {
		try {
			gs.info("Testing PagerDuty API connection");
			var testFeature = "incidents/count";
			var token = gs.getProperty("x_pd_integration.api_key");
			var baseEndpoint = gs.getProperty("x_pd_integration.rest_api_endpoint");

			if (gs.nil(token) || gs.nil(baseEndpoint)) {
				gs.warn("You must set the base endpoint and access key properties first");
				return;
			}

			var rest = new x_pd_integration.PagerDuty_REST();
			var response = rest.getREST(testFeature, {});
			var status = response.getStatusCode();
			if (status == "200")
				gs.info("Connection test successful (200)");
			else
				gs.info("Connection test failed (" + status + ")");
		} catch (ex) {
			gs.error("PagerDuty API test script failed: ${0}", ex);
		}
	},


	/**
	 * Test PagerDuty_REST put wrapper
	 * @param {String} feature path
	 * @param {Object} request body
	 * @return void - see debug output
	 */
	testPutREST: function(feature, body) {
		try {
			var rest = new x_pd_integration.PagerDuty_REST();
			var feature = feature;
			var response = rest.putREST(feature, body);

			gs.debug("testPutREST status:{0}, body:{1}, haveError:{2}, errorMessage:{3}",
				response.getStatusCode(),
				response.getBody(),
				response.haveError(),
				response.getErrorMessage());
		} catch (ex) {
			gs.error("testPutREST error: {0}", ex);
		}
	},


	/**
	 * Test PagerDuty_REST get wrapper
	 * @return void - see debug output
	 */
	testGetREST: function(feature) {
		try {
			var rest = new x_pd_integration.PagerDuty_REST();
			var response = rest.getREST(feature);

			gs.debug("testGetREST status:{0}, body:{1}, haveError:{2}, errorMessage:{3}",
				response.getStatusCode(),
				response.getBody(),
				response.haveError(),
				response.getErrorMessage());
		} catch (ex) {
			gs.error("testGetREST error: {0}", ex);
		}
	},


	/**
	 * Test REST post wrapper
	 * @param {String} feature path
	 * @param {Object} request body
	 * @return void - see debug output
	 */
	testPostREST: function(feature, body) {
		try {
			var rest = new x_pd_integration.PagerDuty_REST();
			var feature = feature;
			var response = rest.putREST(feature, body);

			gs.debug("testPostREST status:{0}, body:{1}, haveError:{2}, errorMessage:{3}",
				response.getStatusCode(),
				response.getBody(),
				response.haveError(),
				response.getErrorMessage());
		} catch (ex) {
			gs.error("testPostREST error: {0}", ex);
		}
	},


	/**
	 * Test REST post event wrapper
	 * @return void - see debug output
	 */
	testPostEvent: function(body) {
		try {
			var rest = new x_pd_integration.PagerDuty_REST();
			var response = rest.postEvent(postBody);
			gs.debug("testPostREST status:{0}, body:{1}, haveError:{2}, errorMessage:{3}",
				response.getStatusCode(),
				response.getBody(),
				response.haveError(),
				response.getErrorMessage());
		} catch (ex) {
			gs.error("testPostEvent error: {0}", ex);
		}
	},


	type: 'PagerDutyTest'
}





/*** Changes made to this script are not supported by PagerDuty ***/
var PagerDutyProvisioning = Class.create();
PagerDutyProvisioning.prototype = {
  initialize: function() {
    this.JSON = new global.JSON();
    this.hasError = false;
    this.errorMsg = "";
    this.autoProvisionUsers = gs.getProperty("x_pd_integration.auto_provision_users");
  },

  /**
   * Provision a PagerDuty user, if user with email exists then update the ServiceNow user with PagerDuty ID
   * @param {GlideRecord} user record
   * @return void
   */
  provisionUser: function(user) {
    var me = "provisionUser";
    var pd = new x_pd_integration.PagerDuty();
    var id = pd.getUserIdByEmail(user.getValue("email"));
    gs.debug("{0} user lookup for {1}, id = {2}", me, user.getDisplayValue(), id);
    if (gs.nil(id)) {
      gs.debug("{0} no PagerDuty user found for {1}, creating user", me, user.getDisplayValue());

      //create a new user
      id = this._createPDUser(user, "user");

      //create contact method for user's phones
      var phoneFields = ["phone", "mobile_phone"];
      //TODO - add support for E164 fields
      for (var i = 0; i < phoneFields.length; i++) {
        var field = phoneFields[i];
        var type = "phone"; //default
        if (field == "mobile_phone")
          type = "SMS";

        var number = user.getValue(field);
        if (!gs.nil(number)) {
          //TODO add support for country code
          var contactID = this._createContactMethod(id, type, number);
          if (!gs.nil(contactID)) {
            //create notification rules
            this._createNotificationRule(id, contactID);
          }
        }
      }

    } else {
      gs.debug("{0} found PagerDuty user for {1}, id = {2}", me, user.getDisplayValue(), id);
      this._updateUser(user, id);
    }
    return id;
  },


  /**
   * Create user contact methods from user phone number
   * @param {String} User PagerDuty ID
   * @param {String} contact type [email, SMS, phone]
   * @param {String} address
   * @return {String} contact method ID
   */
  _createContactMethod: function(userID, type, address, countryCode) {
    var me = "_createContactMethod";
    gs.debug("{0} creating contact method for userID {1}, type:{2}, address:{3}", me, userID, type, address);

    var postBody = {
      contact_method: {
        type: type,
        address: address
      }
    }

    if (!gs.nil(countryCode))
      postBody.country_code = countryCode;

    var rest = new x_pd_integration.PagerDuty_REST();
    var feature = "users/" + userID + "/contact_methods";
    var response = rest.postREST(feature, postBody);
    var body = this.JSON.decode(response.getBody());
    var status = response.getStatusCode();
    gs.debug("{0} response: {1}:{2}", me, status, response.getBody());

    if (response.haveError()) {
      var errCode = body.error.code;
      var errors = body.error.errors.toString();
      var errorMessage = "error: " + body.error.message;

      this._setError(me, errCode + ":" + errorMessage + ":" + errors);
      return;
    }

    if (status == 200 || status == 201) {
      gs.debug("{0} body.contact_method= {1}", me, this.JSON.encode(body.contact_method));
      var contactID = body.contact_method.id;
      gs.debug("{0} userId = {1}, contactID = {2}", me, userID, contactID);
      return contactID;

    } else {
      this._setError(me, "unknown error, (" + status + ") body:" + response.getBody());
    }
  },


  /**
   * Create user contact methods from user phone number
   * @param {String} contact method ID
   * @return void
   */
  _createNotificationRule: function(userID, contactID) {
    var me = "_createNotificationRule";
    gs.debug("{0} creating notifcation rule for contactID {1}", me, contactID);

    if (gs.nil(contactID)) {
      this._setError(me, "Missing required contactID");
      return;
    }

    var postBody = {
      notification_rule: {
        contact_method_id: contactID,
        start_delay_in_minutes: 0
      }
    }

    var rest = new x_pd_integration.PagerDuty_REST();
    var feature = "users/" + userID + "/notification_rules";
    var response = rest.postREST(feature, postBody);
    var body = this.JSON.decode(response.getBody());
    var status = response.getStatusCode();
    gs.debug("{0} response: {1}:{2}", me, status, response.getBody());

    if (response.haveError()) {
      var errCode = body.error.code;
      var errors = body.error.errors.toString();
      var errorMessage = "error: " + body.error.message;

      this._setError(me, errCode + ":" + errorMessage + ":" + errors);
      return;
    }

    if (status == 200 || status == 201) {
      gs.debug("{0} body.notification_rule= {1}", me, this.JSON.encode(body.notification_rule));
    } else {
      this._setError(me, "unknown error, (" + status + ") body:" + response.getBody());
    }
  },


  /**
   * Update ServiceNow user record with PagerDuty ID, using import table
   * @param {GlideRecord} user record
   * @param {String} PagerDuty ID for user
   * @return void
   */
  _updateUser: function(user, id) {
    var me = "_updateUser";
    //update user through import set for tracking purposes
    var gr = new GlideRecord("x_pd_integration_pagerduty_user_import");
    gr.setValue("user_sysid", user.getUniqueValue());
    gr.setValue("id", id);
    gr.insert();
    gs.debug("{0} added import for for user {1} with id:{2}", me, user.getDisplayValue(), id);
  },


  /**
   * Creat a new PagerDuty user
   * @param {GlideRecord} user record
   * @param {String} PagerDuty role level ('user|admin')
   * @return void
   */
  _createPDUser: function(user, role) {
    var me = "_createPDUser";
    gs.debug("{0} creating user for {1} with {2} role", me, user.getDisplayValue(), role);
    var postBody = {
      name: user.getDisplayValue(),
      email: user.getValue("email"),
      role: role
    }

    var title = user.getValue("title");
    if (!gs.nil(title))
      postBody.job_title = title;

    var rest = new x_pd_integration.PagerDuty_REST();
    var feature = 'users';
    var response = rest.postREST(feature, postBody);
    var body = this.JSON.decode(response.getBody());
    var status = response.getStatusCode();
    gs.debug("{0} response: {1}:{2}", me, status, response.getBody());

    if (response.haveError()) {
      var errCode = body.error.code;
      var errors = body.error.errors.toString();
      var errorMessage = "error: " + body.error.message;

      this._setError(me, errCode + ":" + errorMessage + ":" + errors);
      return;
    }

    if (status == 200 || status == 201) {
      gs.debug("{0} body.user = {1}", me, this.JSON.encode(body.user));
      var userId = body.user.id;
      gs.debug("{0} userId = {1}", me, userId);

      this._updateUser(user, userId);
      return userId;

    } else {
      this._setError(me, "unknown error, (" + status + ") body:" + response.getBody());
    }

  },

  /**
   * Provision a group service and esclation policy
   * @param {GlideRecord} sys_user_group record
   * @return void
   */
  provisionGroupService: function(group, userID) {
    var me = "provisionGroupService";
    gs.debug("{0} group:{1}, userID:{2}", me, group.getDisplayValue(), userID);
    if (gs.nil(userID)) {
      var user = new GlideRecord("sys_user");
      user.get(gs.getUserID());
      var userID = user.getValue("x_pd_integration_pagerduty_id");
      gs.debug("{0} found userID {1} in user record", me, userID);
    }

    if (gs.nil(userID)) {
      if (this.autoProvisionUsers == "true") {
        //TODO fix these vars
        gs.debug("{0} auto-provisioning enabled, creating current user for {1}:{2}", me, user.getDisplayValue());

        gs.info(
          "{0} current user '{1}' does not have a PagerDuty ID, auto-provisioning enabled, attempting to create it",
          me, user.getDisplayValue());
        userID = this.provisionUser(user);
        //TODO fix vars
        gs.debug("{0} provisioned new user {1}:{2}", me, user.getDisplayValue(), userID);
      } else {
        //attempt to use default user from property
        var defaultUserID = gs.getProperty("x_pd_integration_x.default_user");
        if (gs.nil(defaultUserID)) {
          gs.debug("{0} attempting to use default user property but it is empty, aborting group provisioning", me);
          return;
        }
      }
    }

    if (!gs.nil(group.x_pd_integration_pagerduty_service)) {
      gs.debug("{0} group {1} already has a service ID, aborting provisioning", me, group.getDisplayValue());
      return;
    }

    var policyID = this._createPolicy(group, userID);
    if (gs.nil(policyID)) {
      gs.error("{0} failed to create escalation policy, cannot create group service", me);
      return;
    }
    var serviceID = this._createGroupService(group, policyID);
    if (gs.nil(serviceID)) {
      gs.error("{0}: failed to create service", me);
      return;
    }
    this.createServiceWebhook("ServiceNow", serviceID);

    this._updateGroup(group, serviceID, policyID);
  },


  /**
   * Add webhook for service
   * @param {String} serviceID
   * @return void
   */
  createServiceWebhook: function(name, serviceID) {
    var me = "createServiceWebhook";
    var rest = new x_pd_integration.PagerDuty_REST();
    var feature = 'webhooks';
    var baseURL = gs.getProperty("glide.servlet.uri");
    var webhookKey = gs.getProperty("x_pd_integration.webhook_key");
    var webhookProcessor = gs.getProperty("x_pd_integration.webhook_processor");
    var webhookUrl = baseURL + webhookProcessor + "?webhook_key=" + webhookKey;

    var postBody = {
      "webhook": {
        "name": "ServiceNow",
        "url": webhookUrl,
        "webhook_object": {
          "id": serviceID,
          "type": "service",
          "object": {
            "service": {
              "id": serviceID,
              "type": "service"
            }
          }
        }
      }
    }
    var response = rest.postREST(feature, postBody);
    var body = this.JSON.decode(response.getBody());
    var status = response.getStatusCode();
    gs.debug("{0} response: {0}:{1}", me, status, response.getBody());


    if (response.haveError()) {
      var errCode = body.error.code;
      var errors = body.error.errors.toString();
      var errorMessage = " error: " + body.error.message;

      this._setError(me, errCode + ":" + errorMessage + ":" + errors);
      return;
    }

    if (status == 200 || status == 201) {
      gs.debug("{0} created webhook '{1}' for service:{2}", me, webhookUrl, serviceID);
    } else {
      this._setError(me, "unknown error, body:" + response.getBody());
    }
  },


  /**
   * Update ServiceNow group record with PagerDuty service and policy IDs, using import table
   * @param {GlideRecord} user record
   * @param {String} PagerDuty ID for user
   * @return void
   */
  _updateGroup: function(group, serviceID, escalationID) {
    var me = "_updateGroup";
    //update user through import set for tracking purposes
    var gr = new GlideRecord("x_pd_integration_pagerduty_group_import");
    gr.setValue("group_sysid", group.getUniqueValue());
    gr.setValue("escalation_id", escalationID);
    gr.setValue("service_id", serviceID);
    gr.insert();
    gs.debug("{0} added import for for group {1} with service:{2} and policy:{3}", me, group.getDisplayValue(),
      serviceID,
      escalationID);
  },


  /**
   * Create a PagerDuty service for a group
   * @param {GlideRecord} sys_user_group record
   * @param {String} esclation policy ID
   * @return {String} new service ID
   */

  _createGroupService: function(group, policyID) {
    var me = "_createGroupService";

    var rest = new x_pd_integration.PagerDuty_REST();
    var feature = 'services';
    // ServiceNow vendor id = PRC098W
    var postBody = {
      "name": "SN:" + group.getDisplayValue(),
      "escalation_policy_id": policyID,
      "type": "integration",
      "vendor_id": "PRC098W"
    }
    var response = rest.postREST(feature, postBody);
    var body = this.JSON.decode(response.getBody());
    var status = response.getStatusCode();
    gs.debug("{0} response: {1}:{2}", me, status, response.getBody());

    if (response.haveError()) {
      var errCode = body.error.code;
      var errors = body.error.errors.toString();
      var errorMessage = "error: " + body.error.message;

      this._setError(me, errCode + ":" + errorMessage + ":" + errors);
      return;
    }

    if (status == 200 || status == 201) {
      var id = body.service.id;
      gs.debug("{0} id = {1}", me, id);
      return id;
    } else {
      gs.error("Error in createPolicy: " + response.getErrorMessage());
    }
  },


  /**
   * Create a PagerDuty escalation policy for a group
   * @param {GlideRecord} sys_user_group record
   * @param {String} current user PagerDuty ID, used as default target since one is required
   * @return {String} new policy ID
   */
  _createPolicy: function(group, userID) {
    var me = "_createPolicy";
    var rest = new x_pd_integration.PagerDuty_REST();
    var feature = 'escalation_policies';
    var postBody = {
      "name": "SN:" + group.getDisplayValue(),
      "escalation_rules": [{
        "escalation_delay_in_minutes": 30,
        "targets": [{
          "type": "user",
          "id": userID
        }]
      }]
    }
    var response = rest.postREST(feature, postBody);
    var status = response.getStatusCode();
    gs.debug("createPolicy response: {0}:{1}", status, response.getBody());

    if (status == 200 || status == 201) {
      var body = this.JSON.decode(response.getBody());
      var id = body.escalation_policy.id;
      gs.debug("createPolicy.id = {0}", id);

      return id;

    } else {
      gs.error("Error in createPolicy: " + response.getErrorMessage());
    }
  },


  /**
   * Track error
   * @param {String} method reporting error
   * @param {String} error message
   * @return void
   */
  _setError: function(method, msg) {
    this.errorMsg = method + " error: " + msg;
    this.hasError = true;
    gs.error("{0} error: {1}", method, msg);
  },

  /**
   * Does class have an error
   * @return {Boolean} has error
   */
  hasError: function() {
    return this.hasError;
  },


  /**
   * Get last error message
   * @return {String} error message
   */
  getError: function() {
    if (!gs.nil(this.errorMsg))
      return this.errorMsg;
  },


  type: 'PagerDutyProvisioning'
};





/*** Changes made to this script are not supported by PagerDuty ***/
var PagerDutyInbound = Class.create();
PagerDutyInbound.prototype = {
  initialize: function() {

    //array helper
    this.ArrayUtil = new global.ArrayUtil();
    this.JSON = new global.JSON();
    this.importTable = "x_pd_integration_webhook_import";

    //handled events
    this.EVENTS = ["incident.trigger", "incident.acknowledge", "incident.unacknowledge",
      "incident.resolve", "incident.assign", "incident.escalate", "incident.delegate"
    ];
  },

  /**
   * process inbound processor request
   * @param {GlideServletRequest} scripted processor request
   * @param {GlideServletResponse} scripted processor response
   * @param {GlideScriptedProcessor} scripted processor
   * @return void
   */
  process: function(gRequest, gResponse, gProcessor) {
    var me = "process";
    var messages = this._getMessages(gRequest);
    gs.debug("{0} {1} messages", me, messages.length);

    for (var i = 0; i < messages.length; i++) {
      gs.debug("{0} messages[{1}]: {2}", me, i, this.JSON.encode(messages[i]));
      var type = messages[i].type;
      gs.debug("{0} type={1}", me, type);
      var data = messages[i].data;
      gs.debug("{0} data={1}", me, this.JSON.encode(data));

      this._processData(type, data);
    }
  },


  /**
   * process request data, create import set row with webhook callback data
   * @param {String} PagerDuty message type
   * @param {Object} request data object
   * @return void
   */
  _processData: function(type, data) {
    var me = "_processData";
    var incidentData = data.incident;
    gs.debug("{0} creating import row with incident:{1}", me, this.JSON.encode(incidentData));
    var importRow = new GlideRecord(this.importTable);
    importRow.incident_key = incidentData.incident_key; //coalesce on original incident sys_id
    importRow.id = incidentData.id;

    if (!gs.nil(incidentData.trigger_summary_data)) {
      importRow.subject = incidentData.trigger_summary_data.subject;
    }
    // Which ServiceNow group did we pass along via the query string?
    importRow.group = g_request.getParameter("group");

    // PD Service Name
    importRow.service_name = incidentData.service.name;
    importRow.service_id = incidentData.service.id;

    // Assigned To User
    if (!gs.nil(incidentData.assigned_to_user)) {
      importRow.assigned_to_email = incidentData.assigned_to_user.email;
      importRow.assigned_to_name = incidentData.assigned_to_user.name;
    }

    // Message Type
    importRow.message_type = type;

    // Resolved By User
    if (!gs.nil(incidentData.resolved_by_user)) {
      importRow.resolved_by_email = incidentData.resolved_by_user.email;
      importRow.resolved_by_name = incidentData.resolved_by_user.name;
    }

    // Status
    importRow.status = incidentData.status;

    // URL
    importRow.url = incidentData.html_url;

    // PD Incident #
    importRow.pagerduty_number = incidentData.incident_number;

    // Last status changed By User
    if (!gs.nil(incidentData.last_status_change_by)) {
      importRow.updated_by_email = incidentData.last_status_change_by.email;
      importRow.updated_by_name = incidentData.last_status_change_by.name;
    }

    // Escalation policy
    if (!gs.nil(incidentData.escalation_policy)) {
      importRow.escalation_policy = incidentData.escalation_policy.name;
      importRow.escalation_policy_id = incidentData.escalation_policy.id;
    }

    importRow.insert();
    gs.debug("{0} inserted import row {1}", me, importRow.getDisplayValue());
  },


  /**
   * get message object from request body
   * @param {GlideServletRequest} scripted processor request
   * @return {Array} array of message objects
   */
  _getMessages: function(request) {
    var me = "_getMessages";
    var messageParm = request.getParameter("messages");
    if (gs.nil(messageParm)) {
      gs.error("{0}: no value for 'messages' parameter", me);
      return;
    }
    gs.debug("{0}: messages string = {1}", me, this.JSON.encode(messageParm));
    //get object from JSON string
    //var messages = this.JSON.decode(messageParm);
    var messages = messageParm;
    return messages;
  },

  type: 'PagerDutyInbound'
};





/*** Changes made to this script are not supported by PagerDuty ***/
var PagerDuty = Class.create();
PagerDuty.prototype = {
  initialize: function() {
    this.JSON = new global.JSON();
    this._errorMsg = "";
    this._hasError = false;

    this._autoProvisionUsers = gs.getProperty("x_pd_integration.auto_provision_users");
    this.assignOnAckOnly = gs.getProperty("x_pd_integration.assign_on_ack_only");
    this.closeOnUnknownUserGroup = gs.getProperty("x_pd_integration.close_incident_on_unknown");
    this.defaultUserID = gs.getProperty("x_pd_integration.default_user");


  },


  /**
   * Get PagerDuty ID for a user, either from database or PagerDuty if needed
   * @param {String} user email address
   * @return {String} PagerDuty user ID
   */
  getUserIdByEmail: function(email, sysid) {
    if (gs.nil(email))
      return;

    gs.debug("getUserIdByEmail for {0}", email);

    var feature = 'users?query=' + gs.urlEncode(email);
    var rest = new x_pd_integration.PagerDuty_REST();

    var response = rest.getREST(feature);
    var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
    var status = response.getStatusCode();
    gs.debug("getUserIdByEmail response: {0}:{1}", status, responseBody);

    if (status == 200) {
      var body = this.JSON.decode(response.getBody());
      if (gs.nil(body.users[0])) {
        this._setError("getUserIdByEmail", "PagerDuty could not find user for email " + email);
        return;
      }

      var userId = body.users[0].id;
      if (!gs.nil(userId)) {
        //add id to user so we don't have to ask again
        this._updateUser(sysid, userId);
        return userId;
      }
    }
  },



  /**
   * Get a user's PagerDuty ID
   * if not in user record, either auto-provision or use default user property
   * @param {String} value to query for
   * @param {String} field on sys_user table to query
   * @param {Boolean} use default user property if valid user is not found
   * @return {String} PagerDuty ID for the user
   */
  getUserIDFromFieldData: function(userData, userField, useDefault) {
    var me = "getUserIDFromFieldData";
    if (gs.nil(userData) || gs.nil(userField))
      return;

    //check the sys_user record for id
    var user = new GlideRecord("sys_user");
    if (!user.isValidField(userField)) {
      gs.error("{0} error querying for {1}={2}, invalid field", me, userField, userData);
      return;
    }
    user.addQuery(userField, userData);
    user.setLimit(1);
    user.query();
    gs.debug("{0} query for user '{1}' has {2} result", me, user.getEncodedQuery(), user.getRowCount());
    if (!user.next()) {
      gs.error("{0}: user record for {1}={2} could not be found", me, userField, userData);
      return;
    }

    gs.debug("{0} found user {1}, pagerduty_id={2}", me, user.getDisplayValue(), user.getValue(
      "x_pd_integration_pagerduty_id"));
    var userID = user.getValue("x_pd_integration_pagerduty_id");
    if (!gs.nil(userID)) {
      gs.debug("{0} found current userID {1} in user record for {2}", me, userID, user.getDisplayValue());
      return userID;
    }

    //query PagerDuty for user based on email
    var email = user.getValue("email");
    userID = this.getUserIdByEmail(email, user.getUniqueValue());
    if (!gs.nil(userID)) {
      gs.debug("{0} found current userID {1} in PagerDuty based on email {2}", me, userID, email);
      return userID;
    }

    //auto provision user if enabled
    if (this._autoProvisionUsers == "true") {

      gs.info("{0} user {1} does not have a PagerDuty ID, auto-provisioning enabled, attempting to create it",
        me, user.getDisplayValue());
      var pdp = new x_pd_integration.PagerDutyProvisioning();
      userID = pdp.provisionUser(user);

      gs.debug("{0} provisioned new user {1}:{2}", me, user.getDisplayValue(), userID);
      return userID;
    }

    //attempt to use default user from property
    if (!useDefault) {
      gs.info("{0} could not find user {1} and useDefault parameter was set to false", me, userField);
      return;
    }

    var defaultUserID = gs.getProperty("x_pd_integration_x.default_user");
    if (!gs.nil(defaultUserID)) {
      gs.debug("{0} using default user property {1}", me, defaultUserID);
      return defaultUserID;
    }

    //still can't get a user id
    gs.error("{0} attempting to use default user property but it is empty", me);
  },


  /**
   * Get group escalation policy from group service id
   * @param {String} group service ID
   * @return {String} PagerDuty escalation policy id
   */
  getServicePolicyFromGroup: function(serviceID) {
    gs.debug("getServicePolicyFromGroup for {0}", serviceID);
    var feature = 'services/' + serviceID;
    var rest = new x_pd_integration.PagerDuty_REST();

    var params = {
      "include": "escalation_policy"
    };
    var response = rest.getREST(feature, params);
    var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
    var status = response.getStatusCode();
    gs.debug("getServicePolicyFromGroup response: {0}:{1}", status, responseBody);

    if (status == 200) {
      var body = this.JSON.decode(response.getBody());

      if (gs.nil(body.service[0])) {
        gs.debug("getServicePolicyFromGroup could not find policy for group service ID {0}", serviceID);
        return;
      }

      var service = body.service[0].id;
      return service;
    }

  },


  /**
   * Create a PagerDuty incident from incident GlideRecord
   * @param {GlideRecord} incident triggering event
   * @return void
   */
  triggerIncident: function(incident, workNotes) {

    if (!incident.isValidRecord()) {
      gs.error("Invalid GlideRecord passed to triggerIncident()");
      return;
    }

    var url = gs.getProperty('glide.servlet.uri') + incident.getLink();

    var notes = "";
    var serviceID = incident.assignment_group.x_pd_integration_pagerduty_service.toString();
    if (gs.nil(serviceID)) {
      notes = gs.getMessage("Incident {0} assignment group {1} does not have a PagerDuty Service ID value",
        incident.getDisplayValue(), incident.getDisplayValue("assignment_group"));
      this._setError("triggerIncident", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    var serviceKey = this.getServiceKeyFromID(serviceID);
    if (gs.nil(serviceKey)) {
      notes = "Unable to get assignment group service key for service id " + serviceID + ", group:" + incident.getDisplayValue(
        "assignment_group");
      this._setError("triggerIncident", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    var description = incident.getValue("number") + ":" + incident.getValue(
      "short_description");

    var details = {
      AssignmentGroup: incident.getDisplayValue("assignment_group"),
      Priority: incident.getDisplayValue("priority"),
      WorkNote: workNotes
    };

    // Create POST body
    var postBody = {
      client_url: url,
      incident_key: incident.getUniqueValue(),
      service_key: serviceKey,
      description: description,
      client: 'ServiceNow',
      details: details,
      event_type: 'trigger'
    };

    // Issue command
    var rest = new x_pd_integration.PagerDuty_REST();
    var response = rest.postEvent(postBody);
    var responseBody = response.getBody();
    var status = response.getStatusCode();
    gs.debug("triggerIncident response: {0}:{1}", status, responseBody);

    if (rest.hasError()) {
      notes = gs.getMessage("PagerDuty REST failed to trigger an incident ({0})", rest.getError());
      this._setError("triggerIncident", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    if (response.haveError()) {
      var errCode = responseBody.error.code;
      var errors = responseBody.error.errors.toString();
      var errorMessage = "error: " + responseBody.error.message;

      notes = gs.getMessage("triggerIncident error:{0},{1}, {2}", errCode, errorMessage, errors);
      this._setError("triggerIncident", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    if (status == 200) {
      gs.debug("triggerIncident for {0}, response body: {1}", incident.getDisplayValue(), response.getBody());

      var body = this.JSON.decode(response.getBody());
      var incidentKey = body.incident_key;
      gs.debug("body.incident_key: {0}", body.incident_key);
      gs.debug("triggerIncident.incidentKey = {0}", incidentKey);

      incident.work_notes = gs.getMessage("PagerDuty created incident for group {0}, waiting for incident id",
        incident.getDisplayValue(
          "assignment_group"));
      incident.x_pd_integration_incident = "---waiting---";
      incident.update();

    } else {
      notes = response.getErrorMessage();
      this._setError("triggerIncident", notes);
      this._addIncidentWorkNote(incident, notes);
    }
  },


  /**
   * Resolve related PagerDuty incident
   * @param {GlideRecord} incident record
   * @return void
   */
  resolveIncident: function(incident) {
    gs.debug("resolveIncident {0}", incident.getDisplayValue());

    var description = gs.getMessage(
      "Incident was changed to '{0}' state by {1}. PagerDuty incident closed (if re-opened a new alert will be created)", [
        incident.getDisplayValue("state"), incident.getValue("sys_updated_by")
      ]);

    var details = {
      AssignmentGroup: incident.getDisplayValue("assignment_group"),
      ResolvedByUser: incident.getDisplayValue("resolved_by"),
      Code: incident.close_code.getDisplayValue(),
      Note: incident.getDisplayValue("close_notes")
    };

    var incidentKey = incident.getUniqueValue();

    var notes = "";
    var serviceID = this.getServiceIDFromIncidentID(incident.x_pd_integration_incident.toString());
    if (gs.nil(serviceID)) {
      notes = gs.getMessage("Incident {0} assignment group {1} does not have a PagerDuty Service ID value",
        incident.getDisplayValue(), incident.getDisplayValue("assignment_group"));
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(notes);
      return;
    }

    var serviceKey = this.getServiceKeyFromID(serviceID);
    if (gs.nil(serviceKey)) {
      notes = "Unable to get assignment group service key for service id " + serviceID + ", group:" + incident.getDisplayValue(
        "assignment_group");
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(notes);
      return;
    }


    // Create POST body
    var body = {
      service_key: serviceKey,
      event_type: 'resolve',
      incident_key: incidentKey,
      description: description,
      details: details
    };

    // Issue command
    var rest = new x_pd_integration.PagerDuty_REST();
    var response = rest.postEvent(body);

    var responseBody = response.getBody();
    var status = response.getStatusCode();
    gs.debug("resolveIncident response: {0}:{1}", status, responseBody);

    if (response.haveError()) {
      var errCode = responseBody.error.code;
      var errors = responseBody.error.errors.toString();
      var errorMessage = "error: " + responseBody.error.message;

      notes = gs.getMessage("resolveIncident error:{0},{1}, {2}", errCode, errorMessage, errors);
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }


    if (status == 200) {
      notes = gs.getMessage("PagerDuty incident was closed");
      this._addIncidentWorkNote(incident, notes);
    } else {
      notes = response.getErrorMessage();
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(incident, notes);
    }
  },


  /**
   * Resolve related PagerDuty incident when PD incident is unreferenced
   * @param {GlideRecord} incident record
   * @param {string} previous PagerDuty ID before deletion
   * @return void
   */
  resolveOnUnreference: function(incident, pagerDutyID) {

    gs.debug("resolveOnUnreference {0}", incident.getDisplayValue());
    var description = gs.getMessage(
      "ServiceNow incident has been unlinked, this incident has been set to resolved");

    var details = {
      AssignmentGroup: incident.getDisplayValue("assignment_group"),
      ResolvedByUser: incident.getDisplayValue("resolved_by"),
      Code: description,
      Note: description
    };

    var incidentKey = incident.getUniqueValue();

    var notes = "";
    var serviceID = this.getServiceIDFromIncidentID(pagerDutyID);
    if (gs.nil(serviceID)) {
      notes = gs.getMessage("Incident {0} assignment group {1} does not have a PagerDuty Service ID value",
        incident.getDisplayValue(), incident.getDisplayValue("assignment_group"));
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(notes);
      return;
    }

    var serviceKey = this.getServiceKeyFromID(serviceID);
    if (gs.nil(serviceKey)) {
      notes = "Unable to get assignment group service key for service id " + serviceID + ", group:" + incident.getDisplayValue(
        "assignment_group");
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(notes);
      return;
    }


    // Create POST body
    var body = {
      service_key: serviceKey,
      event_type: 'resolve',
      incident_key: incidentKey,
      description: description,
      details: details
    };

    // Issue command
    var rest = new x_pd_integration.PagerDuty_REST();
    var response = rest.postEvent(body);

    var responseBody = response.getBody();
    var status = response.getStatusCode();
    gs.debug("resolveIncident response: {0}:{1}", status, responseBody);

    if (response.haveError()) {
      var errCode = responseBody.error.code;
      var errors = responseBody.error.errors.toString();
      var errorMessage = "error: " + responseBody.error.message;

      notes = gs.getMessage("resolveIncident error:{0},{1}, {2}", errCode, errorMessage, errors);
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }


    if (status == 200) {
      var pdUrl = this.getPdIncidentUrl("incidents", pagerDutyID);
      notes = gs.getMessage("PagerDuty incident (" + pagerDutyID +
        ") was resolved since the ServiceNow incident was unlinked \nOld link: " + pdUrl);
      this._addIncidentWorkNote(incident, notes);
    } else {
      notes = response.getErrorMessage();
      this._setError("resolveIncident", notes);
      this._addIncidentWorkNote(incident, notes);
    }
  },

  /**
   * Change esclation policy on PagerDuty incident
   * @param {GlideRecord} incident record
   * @param {String} user sysid
   * @return void
   */
  assignIncidentToPolicy: function(incident, currentUserSysid) {
    gs.debug("assignIncidentToPolicy: incident {0}, currentUserSysid {1}", incident, currentUserSysid);
    if (gs.nil(currentUserSysid) || currentUserSysid == "system" || currentUserSysid == "guest") {
      var userID = this.defaultUserID
    } else {
      var currentUser = new GlideRecord("sys_user");

      if (!currentUser.get(currentUserSysid)) {
        this._setError("assignIncidentToPolicy", "Invalid current user sysid passed, using default user");
        var userID = this.defaultUserID;
        var userEmail = currentUser.getValue("email");
      }
    }

    //Group escalation policy from sys_user_group reference
    var escalationPolicy = incident.assignment_group.x_pd_integration_pagerduty_escalation.toString();
    if (gs.nil(escalationPolicy)) {
      if (this.closeOnUnknownUserGroup) {
        notes = incident.getDisplayValue() + " assignment group '" + incident.getDisplayValue("assignment_group") +
          "' does not have a PagerDuty policy, closing PagerDuty incident, and removing reference";
        gs.debug(notes);
        //remove reference to PD incident, this will also resolve the PD incident
        incident.x_pd_integration_incident = "---unlinked---";
        this._addIncidentWorkNote(incident, notes);
        //   incident.update();
        return;

      } else {
        notes = incident.getDisplayValue() + " assignment group '" + incident.getDisplayValue("assignment_group") +
          "' does not have a PagerDuty policy, could not reassign policy";
        gs.debug(notes);
        this._setError("assignIncidentToPolicy", notes);
        this._addIncidentWorkNote(incident, notes);
        return;
      }
    }


    //if we dont have user PD id, look it up
    if (gs.nil(userID)) {
      // var userID = this.getUserIdByEmail(userEmail, currentUserSysid);
      var userID = this.getUserIDFromFieldData(currentUser.getValue("email"), "email", true);
    }

    //abort if we still don't have a valid PD user
    if (gs.nil(userID)) {
      userID = this.defaultUserID;
    }
    // notes = gs.getMessage(
    //   "Could not find value PagerDuty user for '{0}', will not assign incident to new escalation policy",
    //   userEmail);
    // this._setError("assignIncidentToPolicy", notes);
    // this._addIncidentWorkNote(incident, notes);
    // return;
    //  }

    gs.debug("assignIncidentToPolicy userEmail:{0}, userID:{1}", userEmail, userID);
    // Use PagerDuty's REST API to assign

    var notes = "";
    var incidentID = incident.x_pd_integration_incident;
    if (gs.nil(incidentID)) {
      notes = incident.getDisplayValue() + " does not have a PagerDuty ID so it could not re-assign the policy";
      this._setError("assignIncidentToPolicy", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    // Construct endpoint
    var feature = 'incidents/' + incidentID + '/reassign';
    gs.debug("assignIncidentToPolicy feature: {0}, escalationPolicy: {1}", feature, escalationPolicy);

    // Contstruct payload
    var body = {
      requester_id: userID,
      escalation_policy: escalationPolicy
    };

    // Make web request
    var rest = new x_pd_integration.PagerDuty_REST();
    var response = rest.putREST(feature, body);

    var responseBody = response.getBody();

    var status = response.getStatusCode();
    gs.debug("assignIncidentToPolicy response: {0}:{1}", status, responseBody);

    if (response.haveError()) {
      var errCode = responseBody.error.code;
      var errors = responseBody.error.errors.toString();
      var errorMessage = "error: " + responseBody.error.message;

      notes = gs.getMessage("assignIncidentToPolicy error:{0},{1}, {2}", errCode, errorMessage, errors);
      this._setError("assignIncidentToPolicy", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }


    if (status == 200) {
      notes = gs.getMessage("PagerDuty incident was reassigned to the {0} group escalation policy", incident.getDisplayValue(
        "assignment_group"));
      this._addIncidentWorkNote(incident, notes);
    } else {
      this._setError("assignIncidentToPolicy", "response status:" + status + ", error:" + response.getErrorMessage());
      this._addIncidentWorkNote(incident, notes);
    }
  },


  /**
   * Assign PagerDuty incident to a user
   * @param {GlideRecord} incident record
   * @param {String} assigned to user email
   * @param {String} email of user making the change
   * @return void
   */
  assignIncidentToUser: function(incident, assignedToUserSysid, currentUserSysid) {
    var me = "assignIncidentToUser";
    var notes = "";

    var currentUser = new GlideRecord("sys_user");
    if (!currentUser.get(currentUserSysid)) {
      this._setError("assignIncidentToUser", "Invalid current user sysid passed, using default");
      var currentUserID = this.defaultUserID;
    } else {
      //get user info from sys_userv
      var currentUserEmail = currentUser.getValue("email");
      var currentUserID = currentUser.getValue("x_pd_integration_pagerduty_id");
    }



    //if we dont have user PD id for current user, try to look it up from email
    if (gs.nil(currentUserID)) {
      //currentUserID = this.getUserIdByEmail(currentUserEmail, currentUserSysid);
      currentUserID = this.getUserIDFromFieldData(currentUserEmail, "email");
    }

    if (gs.nil(currentUserID)) {
      notes = gs.getMessage(
        "Could not find valid PagerDuty user for current user '{0}', using default",
        currentUserEmail);
      this._setError("assignIncidentToPolicy", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }


    var assignedToUser = new GlideRecord("sys_user");
    if (!assignedToUser.get(assignedToUserSysid)) {
      this._setError("assignIncidentToUser", "Invalid assigned to user sysid passed, aborting");
      return;
    }

    var assignedToUserEmail = assignedToUser.getValue("email");
    var assignedToUserID = assignedToUser.getValue("x_pd_integration_pagerduty_id");

    //if we dont have user PD id, look it up from email
    if (gs.nil(assignedToUserID)) {
      //assignedToUserID = this.getUserIdByEmail(assignedToUserEmail, assignedToUserSysid);
      assignedToUserID = this.getUserIDFromFieldData(assignedToUserEmail, "email");
    }

    //handle cases where assigned to user still doesn't have a PagerDuty account
    if (gs.nil(assignedToUserID)) {
      notes = gs.getMessage(
        "Could not find valid PagerDuty user for assignment user '{0}', will not assign incident to user in PagerDuty",
        assignedToUser.getDisplayValue());

      this._setError(me, notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    var incidentID = incident.x_pd_integration_incident;
    var feature = 'incidents/' + incidentID + '/reassign';

    // Contstruct payload
    var body = {
      requester_id: currentUserID,
      assigned_to_user: assignedToUserID
    };

    // Make web request
    var rest = new x_pd_integration.PagerDuty_REST();
    var response = rest.putREST(feature, body);

    var responseBody = response.getBody();

    var status = response.getStatusCode();
    gs.debug("assignIncident response: {0}:{1}", status, responseBody);

    if (response.haveError()) {
      var errCode = responseBody.error.code;
      var errors = responseBody.error.errors.toString();
      var errorMessage = "error: " + responseBody.error.message;

      notes = gs.getMessage("assignIncidentToUser error:{0},{1}, {2}", errCode, errorMessage, errors);
      this._setError("assignIncidentToUser", notes);
      this._addIncidentWorkNote(incident, notes);
      return;
    }

    if (status == 200) {
      notes = gs.getMessage("PagerDuty incident was reassigned to {0}", assignedToUser.getDisplayValue());
      this._addIncidentWorkNote(incident, notes);
    } else {
      notes = gs.getMessage("PagerDuty error in assignIncidentToUser: {0}", response.getErrorMessage());
      this._addIncidentWorkNote(incident, notes);
      this._setError("assignIncidentToUser", notes);
    }
  },

  /**
   * query PagerDuty for service key given a service ID
   * @param {String} service id
   * @return {String} service key
   */
  getServiceKeyFromID: function(serviceID) {
    gs.debug("getServiceKeyFromID for {0}", serviceID);
    var feature = 'services/' + serviceID;
    var rest = new x_pd_integration.PagerDuty_REST();

    var response = rest.getREST(feature, {});
    var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
    var status = response.getStatusCode();
    gs.debug("getServiceKeyFromID response: {0}:{1}", status, responseBody);

    if (status == 200) {
      var body = this.JSON.decode(response.getBody());
      var key = body.service.service_key;
      gs.debug("getServiceKeyFromID ID:{0} returned Key:{1}", serviceID, key);
      return key;
    }
  },


  /**
   * query PagerDuty for service ID given an incident ID
   * @param {String} service id
   * @return {String} service key
   */
  getServiceIDFromIncidentID: function(incidentID) {
    gs.debug("getServiceIDFromIncidentID for {0}", incidentID);
    var feature = 'incidents/' + incidentID;
    var rest = new x_pd_integration.PagerDuty_REST();

    var response = rest.getREST(feature, {});
    var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
    var status = response.getStatusCode();
    gs.debug("getServiceIDFromIncidentID response: {0}:{1}", status, responseBody);

    if (status == 200) {
      var body = this.JSON.decode(response.getBody());
      var id = body.service.id;
      gs.debug("getServiceIDFromIncidentID ID:{0} returned ID:{1}", incidentID, id);
      return id;
    }
  },

  /**
   * Get incident notes from PagerDuty incident to import
   * @param {String} incident ID
   * @return {array} collection of note objects
   */
  getIncidentNotes: function(incidentID) {
    gs.debug("getIncidentNotes for {0}", incidentID);
    var feature = 'incidents/' + incidentID + "/notes?time_zone=UTC";
    var rest = new x_pd_integration.PagerDuty_REST();

    var params = {};
    var response = rest.getREST(feature, params);
    var responseBody = response.haveError() ? response.getErrorMessage() : response.getBody();
    var status = response.getStatusCode();
    gs.debug("getIncidentNotes response: {0}:{1}", status, responseBody);

    if (status == 200) {
      var body = this.JSON.decode(response.getBody());

      if (gs.nil(body.notes)) {
        gs.debug("getIncidentNotes could not find notes for incident ID {0}", incidentID);
        return;
      }

      var notes = body.notes;
      return notes;
    }
  },


  /**
   * Post work note to PagerDuty incident note
   * @param {String} pagerDuty incident ID
   * @param {String} note
   * @return void
   */
  postIncidentNote: function(incidentID, content, createdBy) {
    gs.debug("postIncidentNote {0}:{1} created by {2}", incidentID, content, createdBy);

    if (gs.nil(incidentID) || gs.nil(content))
      return;


    var worknote = {};
    worknote.content = content;

    if (gs.nil(createdBy))
      var requestorID = this.defaultUserID;
    else
      var requestorID = this.getUserIDFromFieldData(createdBy, "user_name");

    if (gs.nil(requestorID))
      requestorID = this.defaultUserID;


    var feature = "incidents/" + incidentID + "/notes";

    // Create POST body
    var body = {
      note: worknote,
      requester_id: requestorID,
    };

    // Issue command
    var rest = new x_pd_integration.PagerDuty_REST();
    var response = rest.postREST(feature, body);

    var responseBody = response.getBody();
    var status = response.getStatusCode();
    gs.debug("postIncidentNote response: {0}:{1}", status, responseBody);

    if (response.haveError()) {
      var errCode = responseBody.error.code;
      var errors = responseBody.error.errors.toString();
      var errorMessage = "error: " + responseBody.error.message;

      var errNotes = gs.getMessage("postIncidentNote error:{0},{1}, {2}", errCode, errorMessage, errors);
      //  this._setError("postIncidentNote", errNotes);
      return;
    }

    if (status == 200 || status == 201) {
      var body = this.JSON.decode(response.getBody());
      // if (gs.nil(body.note))
      //    return;

      var noteID = body.note.id;
      gs.debug("postIncidentNote successfully created note {0} in PagerDuty incident {1}", noteID, incidentID);


      this.updateIncidentNoteIDs(incidentID, noteID);

    } else {
      var errNotes = response.getErrorMessage();
      this._setError("postIncidentNote", errNotes);
    }
  },


  /**
   * Update the incident pagerduty notes datestamp
   * @param {String} pagerduty incidentID
   * @param {GlideDateTime} date stamp (optional)
   * @return void
   */
  updateIncidentNoteIDs: function(incidentID, noteID) {
    gs.debug("updateIncidentNoteIDs updating note ID list on incident ID {0} with {1}", incidentID, noteID);
    if (gs.nil(incidentID) || gs.nil(noteID))
      return;

    var gr = new GlideRecord("incident");
    gr.addQuery("x_pd_integration_incident", incidentID);
    gr.query();
    if (!gr.next()) {
      gs.debug("updateIncidentNoteIDs incidentID {0} not found for note {1}", incidentID, noteID);
    }

    var currentNoteIDs = gr.getValue("x_pd_integration_notes_ids");
    if (gs.nil(currentNoteIDs)) {
      gr.setValue("x_pd_integration_notes_ids", noteID);
    } else {
      gr.setValue("x_pd_integration_notes_ids", currentNoteIDs + "," + noteID);
    }

    gr.update();
    gs.debug("updateIncidentNoteIDs incidentID {0} updated note {1}, now has '{2}'", incidentID, noteID, gr.getValue(
      "x_pd_integration_notes_ids"));
  },


  /**
   * Create PagerDuty notes improt records
   * @param {array} collection of note objects
   * @return void
   */
  createNoteImports: function(incidentID, notes) {
    gs.debug("createNoteImports starting import of '{0}' notes for incidentID:{1}", notes.length, incidentID);
    if (gs.nil(notes))
      return;

    for (var i = 0; i < notes.length; i++) {

      var note = notes[i];
      if (gs.nil(note))
        continue;

      var user = note.user;

      var gr = new GlideRecord("x_pd_integration_inc_note_import");
      gr.setValue("note_created_at", note.created_at);
      gr.setValue("incident_id", incidentID);
      gr.setValue("note_id", note.id);
      gr.setValue("user_id", user.id);
      gr.setValue("user_email", user.email);
      gr.setValue("user_name", user.name);
      gr.setValue("content", note.content);
      gr.insert();
      gs.debug("createNoteImports created import row, incidentID:{0}, noteID:{1}", incidentID, note.id);
    }

  },

  /**
   * Get the last work notes journal entry record for an incident_id
   * @param {String} incident sysid
   * @param {String} sys_user.user_name
   * @return {GlideRecord} sys_journal_field record
   */
  getLastIncidentWorknote: function(incidentSysId, createdBy) {
    var me = "getLastIncidentWorknote";
    gs.debug("{0} query for last worknote on {1} by {2}", me, incidentSysId, createdBy);
    if (gs.nil(incidentSysId))
      return;



    var gr = new GlideRecord("sys_journal_field");
    gr.addQuery("name", "task");
    gr.addQuery("element", "work_notes");
    gr.addQuery("element_id", incidentSysId);
    gr.addQuery("sys_created_by", createdBy);
    gr.setLimit(1);
    gr.orderByDesc("sys_created_on");
    gr.query();
    gs.debug("{0} query results for '{1}'={2} results", me, gr.getEncodedQuery(), gr.getRowCount());
    gr.next();
    return gr;

  },


  /**
   * Add work notes to an incident
   * @param {GlideRecord} incident
   * @param {String} notes
   * @return void
   */
  _addIncidentWorkNote: function(incident, notes) {
    try {
      incident.work_notes = notes;
      incident.update();
    } catch (ex) {
      gs.error("_addIncidentWorkNote error " + ex);
    }
  },


  /**
   * Create a PagerDuty user
   * @param {String} sys_user sysid
   * @return {String} PagerDuty user id
   */
  _createPDUser: function(userSysid) {
    var user = new GlideRecord("sys_user");
    if (user.get(userSysid)) {
      gs.info("Creating new user for {0} since auto-provisioning is enabled", user.getDisplayValue());
      var pdp = new x_pd_integration.PagerDutyProvisioning();
      return pdp.provisionUser(user);
    }

  },


  /**
   * Update ServiceNow user record with PagerDuty ID, using import table
   * @param {GlideRecord} user record
   * @param {String} PagerDuty ID for user
   * @return void
   */
  _updateUser: function(userSysId, id) {
    var me = "_updateUser";
    //update user through import set for tracking purposes
    var gr = new GlideRecord("x_pd_integration_pagerduty_user_import");
    gr.setValue("user_sysid", userSysId);
    gr.setValue("id", id);
    gr.insert();
    gs.debug("{0} added import for for user {1} with id:{2}", me, userSysId, id);
  },


  /**
   * Get PagerDuty URL
   * @param {String} PagerDuty endpoint feature
   * @param {String} PagerDuty ID for feature record
   * @return {String} url
   **/
  getPdIncidentUrl: function(feature, id) {
    var baseUrl = gs.getProperty('x_pd_integration.instance_url')
    var url = baseUrl + "/" + feature + "/" + id;
    return url;
  },


  /**
   * Track error
   * @param {String} method reporting error
   * @param {String} error message
   * @return void
   */
    _setError: function(method, msg) {
    this._errorMsg = method + " error: " + msg;
    this._hasError = true;
    gs.error("{0} error: {1}", method, msg);
  },

  /**
   * Does class have an error
   * @return {Boolean} has error
   */
  hasError: function() {
    return this._hasError;
  },


  /**
   * Get last error message
   * @return {String} error message
   */
  getError: function() {
    if (!gs.nil(this._errorMsg))
      return this._errorMsg;
  },


  type: 'PagerDuty'
};





<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:g2="null" xmlns:g="glide" xmlns:j2="null" xmlns:j="jelly:core">

  <!-- get the scope of the current record and list of tables to display-->
  <g:evaluate var="jvar_my_scope">
    var scope = new GlideRecord("sys_scope"); scope.get("scope", gs.getCurrentScopeName()); scope;
  </g:evaluate>
  <g:evaluate expression="scope.getDisplayValue()" var="jvar_my_scope_name"/>
  <g:evaluate expression="scope.getUniqueValue()" var="jvar_my_scope_id"/>
  <g:evaluate expression="gs.getProperty(scope.scope + '.config_file_tables','')" var="jvar_config_tables"/>

  <!-- notify user if we don't have tables property -->
  <j:if test="${jvar_config_tables == ''}">
    The required property 'config_file_tables' in scope ''${scope.scope}'' is missing
  </j:if>
  <j:if test="${jvar_config_tables != ''}">
    <nav class="navbar navbar-default" role="navigation" style="min-width:935px;">
      <div class="container-fluid">
        <div class="navbar-header">
          <h1 class="navbar-title" style="display:inline-block;">Configuration files for ${jvar_my_scope_name}</h1>
        </div>
        <div class="nav navbar-right"></div>
      </div>
    </nav>
    <g:inline template="tabs2.xml"/>

    <TABLE border="0" cellPadding="0" cellSpacing="0" id="testtable" width="100%">
      <TR>
        <TD valign="top">
          <j:set value="cardboard" var="jvar_list_type"/>
          <br/>
          <!-- tabstrip for related lists -->
          <div class="tabs2_strip" id="tabs2_list">
            <!-- hack for IE bug when tab strip causes a horizontal scroll bar to appear -->
            <img alt="" height="1px" src="images/s.gifx" style="margin-right: 0px;" width="1px"/>
          </div>
          <!--
                  Start with the lists not displayed so that we do not impact the page scroll position - gets shown in
                  the onLoad event below
               -->
          <span id="list_span" style="display:none;border-top: 1px solid black; padding-top: 5px; margin-top: -7px;">
            <j:set value="true" var="jvar_use_name_for_list_id"/>

            <j:forEach items="${jvar_config_tables.split(',')}" var="jvar_config_table">
              <!-- make sure we have a valid table -->
              <g:evaluate jelly="true" var="jvar_valid_table">
                var isValid = false; var tableName = jelly.jvar_config_table.trim(); var configTable = new GlideRecord(tableName); if (configTable.isValid()) isValid = true; isValid;
              </g:evaluate>
              <j:if test="${jvar_valid_table == true}">
                <!-- display the table list of filtered records -->
                <g:inline source="${jvar_my_scope_id}" table="${jvar_config_table.trim()}" table_field="sys_scope" template="personalize_all_list.xml"/>
              </j:if>
            </j:forEach>
          </span>

        </TD>
      </TR>
    </TABLE>
    <script>
      addLoadEvent(function () {
        var tabs = new GlideTabs2("tabs2_list", gel("list_span"), 0, '');
        tabs.activate();
        show("list_span");
      });
    </script>
  </j:if>
</j:jelly>




///////
///////
// NEXT is the MACRO for the UI PagerDuty/////
///////

<?xml version="1.0" encoding="utf-8" ?>
	<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<g:evaluate var="jvar_guid" expression="gs.generateGUID(this);" />
	<j:set var="jvar_n" value="show_pagerduty_${jvar_guid}:${ref}"/>
	<g:evaluate var="jvar_pd_base_url" expression="gs.getProperty('x_pd_integration.instance_url')"/>
		
	<j:if test="${jvar_ref_table == 'sys_user'}">
		<j:set var="jvar_feature" value="users"/>
	</j:if>
	<j:if test="${jvar_ref_table == 'incident'}">
		<j:set var="jvar_feature" value="incidents"/>
	</j:if>
	<j:if test="${jvar_ref_table == 'sys_user_group'}">
		<j:if test="${jvar_element == 'x_pd_integration_pagerduty_service'}">
			<j:set var="jvar_feature" value="services"/>
		</j:if>
		<j:if test="${jvar_element == 'x_pd_integration_pagerduty_escalation'}">
			<j:set var="jvar_feature" value="escalation_policies"/>
		</j:if>
	</j:if>
	<g:reference_decoration id="${jvar_n}" field="${ref}"	
		onclick="openPagerDuty_${jvar_element}();"
		title="${gs.getMessage('Open in PagerDuty')}"/>

<script>
	function openPagerDuty_${jvar_element}() {
	
	var go = confirm("${gs.getMessage('PagerDuty will open in a new window')}");
	if (!go)
	   return;
	var id = g_form.getValue("${jvar_element}");
	var pdUrl = "${jvar_pd_base_url}/${jvar_feature}/" + id;
	window.open(pdUrl, "_blank");
	}
	</script>
</j:jelly> 



//assign ticket BRule
function onAfter(current, previous) {
	
	var eventName = "x_pd_integration.trigger_incident";
	gs.debug("Firing event {0} for {1} since it was reassigned to a PagerDuty group", eventName, current.getDisplayValue());
	gs.eventQueue(eventName, current, current.work_notes);
}

