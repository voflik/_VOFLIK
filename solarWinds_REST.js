var loggingSource = '\t****FS:CC Lab 1.3 glideRecordLoopRefactored';
// First construct our comparison list
// Remember a one-dimensional array is a comma delimited list of
// values in JavaScript
var incidents = new GlideRecord('incident');
incidents.orderBy('number');
incidents.query();
// push the resultant sys_id recordset to a 1-dimensional array
incidentsList = [];
while (incidents.next()) {
incidentsList.push(incidents.cmdb_ci + '');
}
// remove any duplicates (to minimize our number of loops further)
incidentsList = new ArrayUtil().unique(incidentsList);
// Now do our query with our array using the 'IN' statement
var cmdb_ci = new GlideRecord('cmdb_ci');
cmdb_ci.addQuery('sys_id', 'IN', incidentsList);
cmdb_ci.orderBy('name'); // a bonus! we can now order the list!
cmdb_ci.query();
while (cmdb_ci.next()) {
gs.info('---> {0} {1}',cmdb_ci.name,loggingSource);
}


///////////////////////////////////////////////////


var client = new WSClientAdaptor("http://hi.service-now.com/incident.do?WSDL");
var myname = gs.getProperty("glide.installation.name");
client.impersonate(myname);
client.setMethodName("insert");
var sd = "Logfile match found for file: " + event.parm1
client.setParameter("short_description", event.parm2);
client.setParameter("comments", sd + "\n" + event.parm2);
client.setParameter("category", "Monitor");
var sysid = client.invokeFiltered("//sys_id");
gs.print("LogFileMonitor created incident: " + sysid);


///////////////////////////////////////////////////



var SolarWindsWorkshop = Class.create();

var SUCCESS = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.SUCCESS;
var FAILURE = Packages.com.service_now.mid.probe.tpcon.OperationStatusType.FAILURE;
var Event   = Packages.com.snc.commons.eventmgmt.Event;
var SNEventSenderProvider = Packages.com.service_now.mid.probe.event.SNEventSenderProvider;
var HTTPRequest = Packages.com.glide.communications.HTTPRequest;

var MAX_EVENTS_TO_FETCH = 3000;

SolarWindsWorkshop.prototype = Object.extendsObject(AProbe, {
    
    // test the connection with connector server
    testConnection : function() {
                
        var retVal = {};
        
        try {
            //TODO: run test query

            if (true) //TODO: validate the request response - use (response.getStatusCode() == 200)
                retVal['status']  = "" + SUCCESS.toString();
            else
                retVal['status']  = "" + FAILURE.toString();
            
        } catch (e) {
            retVal['status'] = FAILURE.toString();
        }
        
        ms.log("SolarWindsWorkshop Connector testConnection " + retVal['status'] );
        
        return retVal;
    },
    
    execute: function() {
        
        ms.log("Connector: execute connection ...");
        
        var retVal = {};

        var resultArray = this.getResult(this.getQueryForExecute()); //retrieve all events from SolarWinds
        
        var events = this.getSNEvents(resultArray); //convert raw events to SN events
        if (events == null) {
			ms.log("Execute: Failed to retrieve events");
            retVal['status'] = FAILURE.toString();
            return retVal;
        }
        
		// send all events
		ms.log("Execute: Sending events");
        var sender = SNEventSenderProvider.getEventSender();
        var i = 0;
        var successFlag = true;
        for (; i&lt; events.length; i++) {
            if (events[i]) {
                successFlag = successFlag &amp;&amp; sender.sendEvent(events[i]); //send each event
            }
        }
        
        if (successFlag) {
            retVal['status'] = SUCCESS.toString();
            if (events.length &gt; 0) {
                this.updateLastSignature(events, retVal); //if all events were sent successfuly, update last signature
            }
        } else {
            retVal['status'] = FAILURE.toString();
            return retVal;
        }
        
        ms.log("Connector: sent " + events.length +
        " events. Return to instance: status="+retVal['status'] +
        "  lastDiscoverySignature=" + retVal['last_event'] );
        
        return retVal;
    },
    
    getSNEvents: function(resultArray) {

        if (resultArray == null) {
			ms.log("getSNEvents: No events were found. resultArray is null");
			return null;
		}
            
        
        var events = [];
        
        // if no events were found, return
        if (resultArray.results.length === 0) {
			ms.log("getSNEvents: No events were found. resultArray is empty");
            return events;
		}
        
        // cache all requierd maps with additional information for events
        // var eventTypes = this.getEventTypes(); For example cache event types information

        var latestTimestamp = this.probe.getParameter("last_event");
        var i = 0;
        for (; i&lt;resultArray.results.length; i++) {

            var event = this.createSNEvent(resultArray.results[i]); //pass also cached information if possible, for example eventTypes
            
            // filter out events on first pull
            if (!this.filterEvent(latestTimestamp, event)) {
                events.push(event);
            }
        }
        
        return events;
    },

    //ignore closed and info events on first collection cycle
    filterEvent : function (latestTimestamp, event) {
        if (latestTimestamp == null &amp;&amp; event.isClosing())
            return true;

        return false;
    },

    getQueryForTestConnection : function () {
        var query = "";
		ms.log("test connection query is: " + query);
        return query;
    },

    getQueryForExecute : function () {
        var query = "";
        
        var latestTimestamp = this.probe.getParameter("last_event");
		
        //differ between first collection cycle to all other cycles 
        if (latestTimestamp != null) { //retrieve all events whose time is bigger to latestTimestamp
            
        } 

		ms.log("execute query is: " + query);
        return query;
    },

    getEventTimestampFieldName : function () { //return the name of event timestamp field
        return "";
    },

    getURL : function (host, query) {
        var port =  this.probe.getAdditionalParameter("port"); //retrieve all additional parameters unique to this Source

        var url = 'https://'+host+':' + port + '/SolarWinds/InformationService/v3/Json/Query?query='
        +encodeURIComponent(query);
         return url;
    },

    createSNEvent : function (rawEvent) { //get all cached information as well
        var event = Event();

        event.setSource("SolarWinds");
        var emsName =  this.probe.getParameter("connector_name"); 
        event.setEmsSystem(emsName); //set the connector instance name as source instance
        event.setResolutionState("New");

        //set all event fields
        event.setSeverity(""); //set severity value 1-critical to 4-warning
        event.setHostAddress(""); //for example 1.1.1.1
        event.setField("hostname", ""); //add hostname value to additional info JSON

        return event;
    },

    getResponse : function (query) {
        //return parsed response according to the query type (such as REST or DB);
		
        // return this.getResponseJSON(query);
    },
    
    /*
    getResponseJSON: function(query) {
        var request = this.createRequest(query);
        request.addHeader('Accept','application/json');
        var response = request.get();
        return response;
    },
    */
    
    /*
    getResponseXML: function(query) {
        var request = this.createRequest(query);
        request.addHeader('Content-Type','application/xml');
        request.addHeader('Accept','application/xml');
        var response = request.post(getXmlString());
        return response;
    },

    getXmlString: function() {
        var xmlString = "";
        return xmlString;
    }
    */

    createRequest: function(query) {
        var username =  this.probe.getParameter("username");
        var password =  this.probe.getParameter("password");
        var host =  this.probe.getParameter("host");
     
        var url = this.getURL(host, query);
        var request = new HTTPRequest(url);
        request.setBasicAuth(username, password);
        return request;
    },

    updateLastSignature: function(events, retVal) {
        /*
        var timeOfEvent = this.getEventTimestampFieldName();
        // the result is sorted, but the sort order can differ. Therefore
        // the last signature is either on the first or the last event
        var firstEventSignature = events[0].getField(timeOfEvent); 
        var lastEventSignature = events[events.length-1].getField(timeOfEvent);
            
        if (firstEventSignature &gt;= lastEventSignature)
            retVal['last_event'] = firstEventSignature;
        else
            retVal['last_event'] = lastEventSignature;
        */
    },

     getResult : function (query) {
        
        var response = this.getResponse(query);

        if (response == null) {
            ms.log("Connector: Failed to bring data. Null response");
            return null;
        }
        
        if (response.getStatusCode() != 200) {
            ms.log("Connector Error Code: " +  response.getStatusCode());
            return null;
        }

        return response; //if needed, parse the response to JSON before returning using parseToJSON method

    },

   /*
   //get response and parse it to JSON
    parseToJSON : function (response) {
        var parser = new JSONParser();
        var resultJson =  parser.parse(response.getBody() );
        ms.log("Connector: Found " + resultJson.results.length + " records");
        return resultJson;
        
    },
   */ 

    parseTimeOfEvent: function (sourceTime) {
    // input is yyyy-MM-dd'T'HH:mm:ss.mmm. we are taking yyyy-MM-dd HH:mm:ss
    var timeOfEvent = sourceTime.replace('T',' ');
    timeOfEvent = timeOfEvent.substring(0,19);
    return timeOfEvent;
    },

   /*
    getNodes : function () {
        
    },
   */ 

    type: "SolarWindsWorkshop"
});



////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////


function onLoad(){
resizePlatforms('u_mapr_platform');
resizePlatforms('u_zion_platform');
}
function resizePlatforms(varName){
var height = '120';
var width = '160';
try{
var leftBucket = gel(varName + '_select_0');
var rightBucket = gel(varName + '_select_1');

if(leftBucket){
            if(height){
                leftBucket.style.height = height + 'px';
                rightBucket.style.height = height + 'px';
            }
            if(width){
                leftBucket.style.width = width + 'px';
                rightBucket.style.width = width + 'px';
                                leftBucket.up('.slushbucket').style.width = width*2 + 100 + 'px';
            }
            $(varName + 'recordpreview').up('td').setAttribute('colSpan', '3');
        }
    }catch(e){}
}



/////////
on change

function onLoad(){
resizePlatforms('u_mapr_platform');
resizePlatforms('u_zion_platform');
}
function resizePlatforms(varName){
var height = '120';
var width = '160';
try{
var leftBucket = gel(varName + '_select_0');
var rightBucket = gel(varName + '_select_1');

if(leftBucket){
            if(height){
                leftBucket.style.height = height + 'px';
                rightBucket.style.height = height + 'px';
            }
            if(width){
                leftBucket.style.width = width + 'px';
                rightBucket.style.width = width + 'px';
                                leftBucket.up('.slushbucket').style.width = width*2 + 100 + 'px';
            }
            $(varName + 'recordpreview').up('td').setAttribute('colSpan', '3');
        }
    }catch(e){}
}



////////////////////////////

ON SUBMIT:

function onSubmit() {

//On Submit is executed when Next is clicked. Here current selection is saved and state is calculated
var currentSelection = g_form.getValue('devops_selection');
//
//Get Vars
var selection = g_form.getValue('u_start');
var maprdrop = g_form.getValue('mapr_selection');
var ziondrop = g_form.getValue('zion_selection');

var current = '';
if(selection == 'u_zion'){
	if(ziondrop == "u_zion_platform"){
		current = 'ZionPlat';
	}
	if(ziondrop == "u_zion_application"){
		current = 'ZionApp';
	}
}else{
	if(maprdrop == "u_mapr_platform"){	
		current = 'MapRPlat';
	}
	if(maprdrop == "u_mapr_application"){	
		current = 'MapRApp';
	}
}

	var newSelection = currentSelection != '' ? (currentSelection + ',' + current) : current;
	g_form.setValue('devops_selection', newSelection);
	
	var zionPlatformSelected = newSelection.indexOf('ZionPlat') != -1; // BAD ONE! > -1 NOT DAMN != -1 ? It can be -3,4,5,6
	var zionAppSelected = newSelection.indexOf('ZionApp') != -1;
	var maprPlatformSelected = newSelection.indexOf('MapRPlat') != -1;
	var maprAppSelected = newSelection.indexOf('MapRApp') != -1;

	var zionCompleted = zionPlatformSelected && zionAppSelected;
	var maprCompleted = maprAppSelected && maprPlatformSelected;
	
	if(zionCompleted && maprCompleted){
		g_form.setValue('state', 'finalize');
	}else{
		var showFinalize = false;
		var finalizeSystem = "";
		if(zionCompleted && ! maprPlatformSelected && ! maprAppSelected){
			showFinalize = true;
			finalizeSystem = "MapR";
		}else if(maprCompleted && ! zionPlatformSelected && ! zionAppSelected){
			showFinalize = true;
			finalizeSystem = "Zion";
		}
		
		if(showFinalize){
			
			
			var answer=confirm("Do you want to select items for " + finalizeSystem + "?");
            //var answer=
			//yesOrNo(finalizeSystem);
			
			if (answer==false){
				//Finalize
				g_form.setValue('state', 'finalize');
				
				return;
			}
			
		}
		
		g_form.setValue('state', 'processing');
	}
}


function yesOrNo(finalizeSystem) {
     var cancelIt= function(){
          //probably do nothing here
		   g_form.setValue('state', 'finalize');
		   return;
     };
     var doIt= function(){
          //Set your field values here
         // return;
     };
 
     var gdw = new GlideDialogWindow('pop_up_yes_no');
     gdw.setTitle("Will you do any changes to " + finalizeSystem + "?");
     gdw.setPreference('onYes', cancelIt.bind(this));
     gdw.setPreference('onNo', doIt.bind(this));
     gdw.setSize(300,300);
     gdw.render();
}


/////////////////////////////////////////////
ON LOAD:

function onLoad() {
//Hide system vars
	g_form.setDisplay('state', false);
	g_form.setDisplay('devops_selection', false);
	g_form.setDisplay('master_desc', false);
	g_form.setDisplay('u_end', false);
//Hide/Show controls
//Selection is saved and State is calculated in onSubmit script
//	
//Hide all controls
g_form.setDisplay('mapr_selection', false);
g_form.setDisplay('zion_selection', false);
	
g_form.setDisplay('zion_platform_slush', false);
g_form.setDisplay('zion_app_slush', false);	
	
g_form.setDisplay('mapr_platform_slush', false);
g_form.setDisplay('mapr_app_slush', false);	

	
if(g_form.getValue('state') == 'processing'){
	
	var currentSelection = g_form.getValue('devops_selection');
	g_form.setDisplay('description', false);
	
	

	var lastIndex = currentSelection.lastIndexOf(',');
	var last = '';
	if(lastIndex == -1){
		last = currentSelection;
	}else{
		last = currentSelection.substring(lastIndex + 1);
	}

	var zionPlatformSelected = currentSelection.indexOf('ZionPlat') != -1;
	var zionAppSelected = currentSelection.indexOf('ZionApp') != -1;
	var maprPlatformSelected = currentSelection.indexOf('MapRPlat') != -1;
	var maprAppSelected = currentSelection.indexOf('MapRApp') != -1;

	var zionCompleted = zionPlatformSelected && zionAppSelected;
	var maprCompleted = maprAppSelected && maprPlatformSelected;

	if(zionPlatformSelected){
		g_form.removeOption('zion_selection', 'u_zion_platform');
	}
	if(zionAppSelected){
		g_form.removeOption('zion_selection', 'u_zion_application');
	}
	if(maprPlatformSelected){
		g_form.removeOption('mapr_selection', 'u_mapr_platform');
	}
	if(maprAppSelected){
		g_form.removeOption('mapr_selection', 'u_mapr_application');
	}

	if(zionCompleted){
		g_form.removeOption('u_start', 'u_zion');
	}
	if(maprCompleted){
		g_form.removeOption('u_start', 'u_mapr');
	}


	if(zionCompleted && maprCompleted){
		g_form.setVisible('u_start', false);
		g_form.setValue('state', 'finalize');
		return;
	}

	if(last.startsWith('Zion')){
		if(zionCompleted){
			g_form.removeOption('u_start', 'u_zion');
			g_form.setValue('u_start', 'mapr_selection');
			g_form.setDisplay('mapr_selection', true);
		}else{

			g_form.setDisplay('zion_selection', true);
			g_form.setValue('u_start', 'zion_selection');

			if(zionPlatformSelected){
				g_form.setDisplay('zion_app_slush', true);	
				g_form.setValue('zion_selection', 'u_zion_application');
			}else{
				g_form.setDisplay('zion_platform_slush', true);
				g_form.setValue('zion_selection', 'u_zion_platform');
			}
		}
	}else{
		if(maprCompleted){
			g_form.removeOption('u_start', 'u_mapr');
			g_form.setValue('u_start', 'zion_selection');
			g_form.setDisplay('zion_selection', true);
		}else{
			g_form.setDisplay('mapr_selection', true);
			g_form.setValue('u_start', 'mapr_selection');

			if(maprPlatformSelected){

				g_form.setDisplay('mapr_app_slush', true);	
				g_form.setValue('mapr_selection', 'u_mapr_application');
			}else{

				g_form.setDisplay('mapr_platform_slush', true);
				g_form.setValue('mapr_selection', 'u_mapr_platform');
			}
		}
	}
}
}
	

	///////////////////////////////////
	
ON CHANGE:
var = u_start
function onChange(control, oldValue, newValue, isLoading) {
	//debugger;
	//
	if(isLoading || newValue == ''){
		return;
	}
	
	if(newValue){
		g_form.removeOption('u_start', '-100');
	}
	
	g_form.setDisplay('zion_selection', newValue === 'u_zion');
	g_form.setDisplay('mapr_selection', newValue ==='u_mapr');
	
	g_form.setDisplay('mapr_platform_slush', false);
	g_form.setDisplay('mapr_app_slush', false);
	
	g_form.setDisplay('zion_platform_slush', false);
	g_form.setDisplay('zion_app_slush', false);
	
	//var x = 0;
	debugger;
	
	
}

//////////////////////////////////////////

function onChange(control, oldValue, newValue, isLoading) {
//
	if(isLoading || newValue == ''){
		return;
	}
	if(newValue){
		g_form.removeOption('zion_selection', '-100');
		g_form.setReadOnly('zion_selection', true);
		g_form.setReadOnly('u_start', true);
	}
	g_form.setDisplay('zion_platform_slush', newValue == 'u_zion_platform');
	g_form.setDisplay('zion_app_slush', newValue == 'u_zion_application');
	
}