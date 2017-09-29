/*
*Author:*
Jürgen Fehse (juergen.fehse@wsp-consulting.de)

*Company:*
WSP-Consulting GmbH

*Date created:*
2014-01-28

*Description:*
Utilities for Incident Client Scripts
*/

// form container
var incidentUtils_formContainer = {};
var incidentUtils_emailClientWindow = null;
function onLoad() {
	
    //incidentUtils_refreshDataLookups(true);
}

/*
Function:
incidentUtils_refreshDataLookups

*Author:*
Jürgen Fehse (juergen.fehse@wsp-consulting.de)

*Company:*
WSP-Consulting GmbH

*Date created:* 
2014-03-12

Parameters:
isLoading – identify if form is loading or not (boolean)

Returns:
Nothing.

See Also:
*/


function incidentUtils_refreshDataLookups(isLoading) {
	if(!g_form.getControl('u_impacted_business_service')) {
        return;
    }
    var fieldName = 'u_impacted_business_service';
    var control = g_form.getControl(fieldName);
    var oldValue = '';
    var newValue = g_form.getValue(fieldName);
    var isLoading = false;

    // Call the priority datalookup handler after copy again
    window.DataLookup.process(control, oldValue, newValue, isLoading, '302849102b031000de0aba36a3fd5631');

    // Call the assignment datalookup handler after copy again
	window.DataLookup.process(control, oldValue, newValue, isLoading, '95bd23372b321000de0aba36a3fd5644');
	
}


/*
 Function:
 getRolesFromGroup

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-01-13

 Parameters:
 sys_id – sys id of assignment group (string)
 callback - callback function (function)

 Returns:
 Nothing.

 See Also:
 <wsp_SI_incidentUtils::getRolesFromGroup>

 Called From:
 wsp_CS_onChangeAssignmentGroup

 */

function incidentUtils_getRolesFromGroup(sys_id, callback) {
	var ga = new GlideAjax('wsp_SI_incidentUtils');
    ga.addParam('sysparm_name', 'getRolesFromGroup');
    ga.addParam('sysparm_sys_id', sys_id);
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
            callback(answer.split(','));
        }
    });
}

/*
 Function: incidentUtils_openEmailClient
 open the email client dialog window

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-24

 Parameters:

 Returns:
 Nothing
 */
/*function incidentUtils_openEmailClient() {
 //incidentUtils_emailClientWindow = new top.window.GlideDialogWindow('wsp_email_client');
 incidentUtils_emailClientWindow = new GlideDialogWindow('wsp_email_client');
 incidentUtils_emailClientWindow.setTitle('Email Client');
 incidentUtils_emailClientWindow.setSize(900, 700);
 incidentUtils_emailClientWindow.setPreference("parm_table", g_form.getTableName().toString());
 incidentUtils_emailClientWindow.setPreference("parm_sys_id", g_form.getUniqueValue().toString());
 incidentUtils_emailClientWindow.render();
 }*/
function incidentUtils_openEmailClient() {
	var box = GlideBox.get('wsp_email_client');
    if (box)
        box.close(0);

    var sysId = g_form.getUniqueValue();
    var table = g_form.getTableName();
    box = new GlideBox({
        id : 'wsp_email_client',
        iframe : 'wsp_email_client.do?parm_sys_id=' + sysId + "&parm_table=" + table + "&parm_box_id=wsp_email_client",
        iframeId : 'wsp_email_client',
        width : '60%',
        height : '95%',
        title : "Email Client",
        noTitle : true
    });
    box.render();
    box.showFooterResizeGrips();

    var g_feedResizer;
    Event.observe(window, 'resize', function() {
        g_feedResizer = setTimeout(function() {
            box.autoPosition();
            box.autoDimension();
        }, 50);
    });
}

/*
 Function:
 incidentUtils_containerSetValue

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-07

 Parameters:
 fieldName – fieldname - key in form container (String)
 value - value to set to the form container

 Returns:
 return the value from form container

 */
function incidentUtils_containerSetValue(fieldName, value) {
	incidentUtils_formContainer[fieldName] = value;
}

/*
 Function:
 incidentUtils_containerGetValue

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-07

 Parameters:
 fieldName – fieldname - key in form container (String)

 Returns:
 return the value from form container

 */
function incidentUtils_containerGetValue(fieldName) {
	if (incidentUtils_formContainer[fieldName])
        return incidentUtils_formContainer[fieldName];
    else
        return '';
}

/*
 Function:
 incidentUtils_populateToWatchList

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-01-28

 Parameters:

 Returns:
 Nothing.

 See Also:

 Called From:
 - wsp_CS_onChangeConfigItem
 - wsp_CS_onChangeImpactedService

 See Also:
 <wsp_SI_incidentUtils::getAllInfoGrpMembers>
 */
function incidentUtils_populateToWatchList() {
	var ga = new GlideAjax('wsp_SI_incidentUtils');
    ga.addParam('sysparm_name', 'getAllInfoGrpMembers');
    ga.addParam('sysparm_impacted_service', g_form.getValue('u_impacted_business_service'));
    ga.addParam('sysparm_affected_ci', g_form.getValue('cmdb_ci'));
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
			var previous_watchlist = g_form.getValue('watch_list').split(',');
			var watchlist = previous_watchlist.concat(answer.split(','));
			//g_form.setValue('watch_list', arrayUtil.unique(watchlist));
			g_form.setValue('watch_list', watchlist);
        }
    });
}

/*
 Function:
 incidentUtils_populateToAssginmentGrp

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-07

 Parameters:

 Returns:
 Nothing.

 Called From:
 - wsp_CS_onChangeImpactedService

 See Also:
 <wsp_SI_incidentUtils::getSupportGroup>
 */
function incidentUtils_populateToAssginmentGrp() {
	// GlideAjax Call to Script Include to get support Group
	
	if(g_form.getValue('assignment_group') != "") {
		var ga = new GlideAjax('wsp_SI_incidentUtils');
		ga.addParam('sysparm_name', 'getSupportGroup');
		ga.addParam('sysparm_sys_id', g_form.getValue('u_impacted_business_service'));
		ga.addParam('sysparm_sys_class_name', 'cmdb_ci_service');
		ga.getXML(function(response) {
			var answer = response.responseXML.documentElement.getAttribute("answer");
			if (answer && answer != "") {
				g_form.setValue('assignment_group', answer);
			}
		
    	});
	}
}

/*
 Function:
 incidentUtils_copyBusinessCriticality

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-11

 Parameters:

 Returns:
 Nothing.

 Called From:
 - wsp_CS_onChangeImpactedService

 See Also:
 <wsp_SI_incidentUtils::getBusinessCriticality>
 */
function incidentUtils_copyBusinessCriticality() {
	// GlideAjax Call to Script Include to get support Group
    var ga = new GlideAjax('wsp_SI_incidentUtils');
    ga.addParam('sysparm_name', 'getBusinessCriticality');
    ga.addParam('sysparm_sys_id', g_form.getValue('u_impacted_business_service'));
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
            g_form.setValue('u_business_criticality', answer);
        }
    });
}

/*
 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-17

 Parameters:

 Returns:
 Nothing.

 Called From:
 - wsp_CS_onChangeImpactedService

 See Also:
 <wsp_SI_incidentUtils::getBusinessServiceLocation>
 */
function incidentUtils_copyBusinessServiceLocation() {
	// GlideAjax Call to Script Include to get support Group
    var ga = new GlideAjax('wsp_SI_incidentUtils');
    ga.addParam('sysparm_name', 'getBusinessServiceLocation');
    ga.addParam('sysparm_sys_id', g_form.getValue('u_impacted_business_service'));
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
            g_form.setValue('u_business_service_location', answer);
        }
    });
}

/*
 Function:
 incidentUtils_calculateImpact

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-05

 Parameters:

 Returns:
 Nothing.

 Called from:
 - wsp_CS_onChangeEnvironment

 See Also:
 <wsp_SI_incidentUtils::calculateImpact>

 */
function incidentUtils_calculateImpact() {
	// Only if new Record
    if (!g_form.isNewRecord()) {
        return false;
    }

    var ga = new GlideAjax('wsp_SI_incidentUtils');
    ga.addParam('sysparm_name', 'calculateImpact');
    ga.addParam('sysparm_u_environment', g_form.getValue('u_environment'));

    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
            g_form.setValue('impact', answer);
        }
    });
}

/*
 Function:
 incidentUtils_calculateUrgency
 deprecated till workshop 10.02.2014 - 12.02.2014. Values mapped directly from
 "how many customers are affected" (Portal)
 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-02-05

 Parameters:

 Returns:
 Nothing.

 Called from:
 - wsp_CS_onChangeEnvironment
 - wsp_CS_onChangeIsAffectedUser

 See Also:
 <wsp_SI_incidentUtils::calculateUrgency>
 */
function incidentUtils_calculateUrgency() {
	// Only if new Record
    if (!g_form.isNewRecord()) {
        return false;
    }

    var ga = new GlideAjax('wsp_SI_incidentUtils');
    ga.addParam('sysparm_name', 'calculateUrgency');
    ga.addParam('sysparm_u_environment', g_form.getValue('u_environment'));
    ga.addParam('sysparm_u_is_customer_affected', g_form.getValue('u_is_customer_affected'));

    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
            g_form.setValue('urgency', answer);
        }
    });
}

/*
 Function:
 incidentUtils_getUserLocation

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-03-12

 Parameters:
 user_id – sys_id of user (string)
 callback - callback function (function)

 Returns:
 Nothing.

 See Also:
 <wsp_SI_userUtils::getLocation>
 */
function incidentUtils_getUserLocation(user_id, callback) {
	var ga = new GlideAjax('wsp_SI_userUtils');
    ga.addParam('sysparm_name', 'getLocation');
    ga.addParam('sysparm_user_id', user_id);

    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer");
        if (answer && answer != "") {
            if ( typeof callback == 'function') {
                callback(answer);
            }
        }
    });
}

/*
 Function:
 incidentUtils_fireEvent

 *Author:*
 Jürgen Fehse (juergen.fehse@wsp-consulting.de)

 *Company:*
 WSP-Consulting GmbH

 *Date created:*
 2014-03-04

 Parameters:
 element – element to trigger event (object)
 event – event to trigger event (object)
 Returns:
 Nothing.

 See Also:
 */
function incidentUtils_fireEvent(element, event) {
	if (document.createEventObject) {
        // dispatch for IE
        var evt = document.createEventObject();
        return element.fireEvent('on' + event, evt);
    } else {
        // dispatch for firefox + others
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, true, true);
        // event type,bubbling,cancelable
        return !element.dispatchEvent(evt);
    }
}