var GetApplicationRunbook = Class.create();
GetApplicationRunbook.prototype = {
	initialize: function() {
	},

	getApplication: function (sys_id, load_all) {

		var excludeApplications = ''; // packages which are to be excluded if "Load missing Packages" UI Action is trigerred
		var alwaysExclude = gs.getProperty('x_cir.integration.package.get.exclude.always'); // packages which are always excluded from the import
        
		var current = new GlideRecord('core_company');
		current.get(sys_id);
		
		var curr = new GlideRecord('x_cir_package');
		
		if (load_all != 'true') {	

			curr.addQuery('customer.customer', sys_id);
			curr.addQuery('package_status', '!=', 'delete');
			curr.addQuery('package_status', '!=', 'New');
			curr.query();

			while (curr.next()) {
				excludeApplications += "\"" + curr.package_name + "*\",";
			}				
		} 

		excludeApplications += "\"" + alwaysExclude + "\"";

		var MID  = "";
		var functionality =  "";
		var source = "Get-SNApplication";
		var ouID = current.x_cir_main_customer_ou.sys_id;
		
		functionality = "sccm";

		var mids = new GlideRecord('x_cir_midofcustomer');
		mids.addQuery('customer', ouID);
		mids.addQuery('functionality', functionality);
		mids.query();


		if (!mids.next()){
			this.addErrorLog('ERROR', 'No MidServer found for Customer ' + curr.customer, source,'IN',MID, ouID, curr.customer);
			//TODO: return with error messge
			gs.info('CKLU No MID found');
		} else {
			//MID = "mid.server." + mids.mid_server.name;
			MID = mids.mid_server.name;

			var payload = "{ \"IncludeApplications\":[],\"ExcludeApplications\":[";
			payload += excludeApplications;
			payload += "]}'}";

			var pb = new global.PowershellCall_Lib(MID, "127.0.0.1",source,"");

			var script = "& {Invoke-SCWSMARunbook -Parameter @{\"InputJson\"='";

			script += payload;
			script += ' -WebServiceEndpoint \" ' + mids.automation_server + '\" -RunbookName \"Get-SNApplication\" -ReturnOutputStream -TimeoutSeconds 900 -Quiet | Select-Object -ExpandProperty \"StreamText\"}';

			pb.setScript(script);
			
			//Changing to FQJSON object
			var response_all = pb.execute(true);
			var response = response_all.output;
			var pre_json = response.replace(/<.*>/gm, "");
			var json = JSON.parse(pre_json);
            
			gs.info('EXECUTED');
			
			var res = json.Success == true ? true : false;
			var res_msg = json.Message;
			
			if(!res) {
				this.addErrorLog('Info', res_msg, source, MID, ouID, "Company: " + sys_id);
			}
			
			//Inject the OU into the JSON
			for (var j in json.Applications) {
				json.Applications[j].OU = current.x_cir_main_customer_ou.sys_id.toString();
				
				for(var k in json.Applications[j].DependencyGroups){
					
					for(var l in json.Applications[j].DependencyGroups[k].DependentApplications){
						
						json.Applications[j].DependencyGroups[k].DependentApplications[l].DependencyGroupName = json.Applications[j].DependencyGroups[k].DependencyGroupName;
					}
					
				}
			}
			
			
			var newGR = new GlideRecord('x_snc_siam_light_queue');
			newGR.initialize();
			newGR.payload = JSON.stringify(json);
			newGR.action = 'insert';
			newGR.state = 'ready';
			newGR.message_type = '2b1bb1d725f823008ec4df308bdeb83d'; // for testing purposes only
			newGR.insert();


		}
    },
    
    gesetApp : function(key){

        var app = new GlideRecord('x_cir_cir_application');
        if(app.get('cir_name', key)){
            
            return app.sys_id;
        } else {
            app.initialize();
            var regex = //;

            
            var id = app.insert();

            return id;

        }


    },

    gesetPublisher : function(key){

        var publisher = new GlideRecord('core_company');
        if(publisher.get('name', key)){

            return publisher.sys_id;
        } else {
            publisher.initialize();
            publisher.name = key;
            publisher.manufacturer = true;
            var id = publisher.insert();

            return id;

        }


    },
	// used with SIAM queue on getApplication runbook (Insert Application)

    createNewApp : function(){

		var rec = new GlideRecord('x_cir_cir_application');
		rec.initialize();
		rec.application_name = 

			
		


    },
	
	addErrorLog: function(type, message, source, direction, mid, ouID, recInfo){
				var grErrorLog = new Interface_Monitor_Log_Lib();
				grErrorLog.addErrorLog(type, message, source, direction, mid, ouID, recInfo);//type, message,source,direction,ouID,recInfo)
			},

	type: 'GetApplicationRunbook'
};




var regex = /current.ApplicationPublisher/
var name = LocalizedApplicationName.replace(current.ApplicationPublisher, ""); current.ApplicationPublisher
name.replace(/$\s/, "").replace(/\s\d.*|-CWP.*/, "" );