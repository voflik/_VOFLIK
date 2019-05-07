var AppSetRunbook = Class.create();
AppSetRunbook.prototype = {
	initialize: function () {
	},

	callPSSync2SCSM: function (sys_id, source, action) {
		//gs.addInfoMessage('Starting sync.. expected time less than 2 min for results');

		var curr = new GlideRecord('x_cir_app_set');
		if (curr.get(sys_id))
			// preparation
			// prepare call

		var MID = "";
		var instanceName = "";
		var functionality = "SCCM";

		//different MID for different customer		
		//only one MID is to be used if more than 1 found
		var mids = new GlideRecord('x_cir_midofcustomer');
		mids.addQuery('customer', curr.customer.sys_id);
		mids.addQuery('functionality', functionality);
		mids.setLimit(1);
		mids.query();

		if (!mids.next()) {
			//	gs.addInfoMessage('No MidServer found for Customer ' + curr.customer);
			var errMsg = 'No MidServer found for Customer ' + curr.customer;
			this.addErrorLog('ERROR', errMsg, 'SCSM', 'OUT', '');
			return errMsg;
		}

		//MID =	"mid.server." + mids.mid_server.name;
		MID = mids.mid_server.name;
		//gs.info("CKLU: AppSetRunbook MID Server found");
		var script = "";
		var pb = new global.PowershellCall_Lib(MID, "127.0.0.1", source, "");

		// verify if it isCurrent == true, and define a string to add to the json
		//PAssing isCurrent always with relevant values true/false
		var isCurrent = "";

		if (curr.is_current == true)
			isCurrent = "\"ApplicationSetFlags\":[{\"FlagName\":\"isCurrent\",\"FlagValue\":\"" + curr.is_current + "\"}],";

		if (action == 'CREATE') {

			script = "& {Invoke-SCWSMARunbook -Parameter @{\"InputJson\"='{\"AppSets\":[";

			//gs.info("CKLU: AppSetRunbook script: " +script);
			var applist = '';
			var app = '';
			var i = 0;

			//Fetch curent Appset

			app = '{\"ApplicationSetName\":\"';
			app = app + curr.unique_name + '\",';
			app = app + '\"ApplicationSetDescription\":\"' + curr.short_description + '\",';
			app = app + '\"ApplicationSetStage\":\"' + curr.status + '\",';
			app = app + isCurrent;
			app = app + "\"Applications\":";
			script += app;

			var m2mapp = new GlideRecord('x_cir_m2m_packages_app_sets');
			m2mapp.addQuery('app_set', sys_id);
			m2mapp.addQuery('package.package_status', 'Productive');
			m2mapp.orderBy('order');
			m2mapp.query();
			
			while (m2mapp.next()) {

				i = i + 1;
				if (i > 1)
					applist = applist + ',';

					applist = applist + '{\"ApplicationName\":\"';
					applist = applist + this.getPkName(m2mapp.getValue('package')) + '\",';
					applist = applist + '\"OrderNumber\":\"' + m2mapp.order + '\"}';
				gs.warn("APPLIST " + applist);
			}
			if(i == 0) applist = '{\"\"}';

			//m2mapp.package.package_name
			script += applist + "}]}'}";


			script += " -WebServiceEndpoint \" " + mids.automation_server + "\" -RunbookName \"Set-SNApplicationSet\" -ReturnOutputStream -TimeoutSeconds 900 -Quiet | Select-Object -ExpandProperty \"StreamText\"}";

		}
		else {
			script = "& {Invoke-SCWSMARunbook -Parameter @{\"InputJson\"='{\"AppSets\":[{\"ApplicationSetName\":\"" + curr.unique_name + "\"}]}'" + " -WebServiceEndpoint \" " + mids.automation_server + "\" -RunbookName \"Remove-SNApplicationSet\" -ReturnOutputStream -TimeoutSeconds 900 -Quiet | Select-Object -ExpandProperty \"StreamText\"}";
		}

		gs.warn("CKLU:\n" + script);
		pb.setScript(script);

		var response = pb.execute(true);

		//Using JSON.parse() the stringified obj
		if (response.error == 'null' || response.error == null) {
			gs.addInfoMessage("AppSet was synched successfully to SCSM");
			return response.output.toString();
		}
		else {
			gs.addErrorMessage("Error on synching AppSet with SCSM");
			return response.error.toString();
		}
	},


	getScript: function (curr) {

		var id = curr.sys_id;
		// replacement
		var st = 0;
		var descSup = "[";
		var app = new GlideRecord('x_cir_package_2_package_dependency');
		app.addQuery('u_package', id);
		app.addQuery('u_relationship', 1); // Replacement
		app.query();
		while (app.next()) {
			if (st == 1) {
				descSup = descSup + ",";
			}

			descSup = descSup + "{";
			descSup = descSup + "\"SupersedingApplicationDeploymentTypeName\":\"" + app.u_package.package_name + "_" + app.u_package.packaging_technology + "\",";
			descSup = descSup + "\"SupersededApplicationName\":\"" + app.u_related_package.package_name + "\",";
			descSup = descSup + "\"SupersededApplicationDeploymentTypeName\":\"" + app.u_related_package.package_name + "_" + app.u_related_package.packaging_technology + "\"}";
			st = 1;
		}

		descSup = descSup + "]";

		var existSup = true;
		if (descSup == '[]')
			existSup = false;

		// PreReq						
		var descDep = this.getItemPackageByApp(id);

		var existDep = true;
		if (descDep == '[]')
			existDep = false;

		//Header

		var mainApp = new GlideRecord('x_cir_package');
		mainApp.get(id);

		var head = "{\"Applications\": [{\"ApplicationName\": \"" + mainApp.package_name + "\",\"ApplicationStage\": \"" + mainApp.package_status + "\",\"ManageDependencies\": " + existDep + ",\"ManageSupersedence\": " + existSup + ", \"DependencyGroups\": " + descDep + ",\"SupersededApplications\": " + descSup + "}]}";

		return head;
	},

	getItemPackageByApp: function (id) {
		var descDep = '[';
		var appl = '';
		var app = new GlideRecord('x_cir_package_2_package_dependency');
		app.addQuery('u_package', id);
		app.addQuery('u_relationship', 'IN', '2,3'); // PreReq - PostReq
		app.query();

		while (app.next()) {
			if (appl.indexOf(app.u_related_package.application) == -1)
				appl = appl + app.u_related_package.application + ',';
		}

		var it = 0;
		var applArray = appl.split(',');
		for (var i = 0; i < applArray.length - 1; i++) {

			if (it == 1)
				descDep = descDep + ",";

			descDep = descDep + "{\"DependencyGroupName\":\"Prereq" + i + "\",\"DependentApplications\":[{";

			var grpApp = new GlideRecord('x_cir_package_2_package_dependency');
			grpApp.addQuery('u_package', id);
			grpApp.addQuery('u_relationship', 'IN', '2,3');
			grpApp.addQuery('u_related_package.application', applArray[i]);
			grpApp.query();

			while (grpApp.next()) {
				descDep = descDep + "\"ApplicationDeploymentTypeName\":\"" + grpApp.u_package.package_name + "_" + grpApp.u_package.packaging_technology + "\",";
				descDep = descDep + "\"DependentApplicationName\":\"" + grpApp.u_related_package.package_name + "\",";
				descDep = descDep + "\"DependentApplicationDeploymentTypeName\":\"" + grpApp.u_related_package.package_name + "_" + grpApp.u_related_package.packaging_technology + "\"}";
				it = 1;
			}

			descDep = descDep + "]}";
		}

		descDep = descDep + "]";
		return descDep;
	},

	getPkName: function (sys_id) {
		var pk = new GlideRecord('x_cir_package');
		pk.addQuery('sys_id', sys_id);
		pk.addQuery('package_status', 'Productive');
		pk.setLimit(1);
		pk.query();

		if (pk.next())
			return pk.package_name;
		else
			return "";
	},
	// use 1 for sinlge output of mid or 9 for multiple
	getMIDServers: function (customer_sys_id, functionality, limit) {

		var MID = [];
		var mids = new GlideRecord('x_cir_midofcustomer');
		mids.addQuery('customer', customer_sys_id);
		mids.addQuery('functionality', functionality);
		mids.setLimit(limit);
		mids.query();

		if (!mids.hasNext()) {

			return false;
		}
		if (mids.getRowCount() == 1) {

			return mids.mid_server.name;

		} else {

			while (mids.next()) {

				MID.push(mids.mid_server.name);
			}
			return MID;
		}

	},
	//Get-SNApplicationSet for scheduled job and UI Actions Load Missing and Load all AppSets
	getApplicationSets: function (sys_id, parent_sys_id, load_all, load_new, load_packages) {

		var current = new GlideRecord('core_company');
		current.get(sys_id);
		var excludeApplicationSet = ''; // packages which are to be excluded if "Load missing Packages" UI Action is trigerred
		var includeApplicationSet = "";
		var alwaysExclude = gs.getProperty('x_cir.integration.appset.get.exclude_always'); // packages which are always excluded from the import
		var counter = 0;		
		if (load_all != 'true') {
			var ids  = "";
			ids = this.getCustomerOUs(sys_id, parent_sys_id);
			if(!ids){
				gs.addErrorMessage("No CustomerOU found! You cannot load only missing AppSets.");
				return;
			}

			for(var i in ids){


				var curr = new GlideRecord('x_cir_app_set');
				curr.addQuery('customer', ids[i]);
				if(load_new == 'true') curr.addQuery('status', 'new');
				curr.query();

				while (curr.next()) {
					if(counter > 0) includeApplicationSet += ",";
					includeApplicationSet += "\"" + curr.unique_name + "\"";
					counter++;
				}	
			}			
		} 
		includeApplicationSet = "[" + includeApplicationSet + "]";
		excludeApplicationSet += "\"" + alwaysExclude + "\"";

		var MID  = "";
		var functionality =  "";
		var source = "Get-SNApplicationSet";

		functionality = "sccm";

		var mids = new GlideRecord('x_cir_midofcustomer');
		mids.addQuery('customer.customer', sys_id);
		mids.addQuery('functionality', functionality);
		mids.query();


		if (!mids.next()){
			this.addErrorLog('ERROR', 'No MidServer found for Customer ' ,'SCSM','OUT', MID);
			gs.addErrorMessage("No MID Server found for this company. Cancelling sync.");
			return;
		} else {

			MID = mids.mid_server.name;

			var payload = "{ \"IncludeApplications\":" + includeApplicationSet + ",\"ExcludeApplications\":[";
			payload += excludeApplicationSet;
			payload += "]}'}";

			var pb = new global.PowershellCall_Lib(MID, "127.0.0.1",source,"");

			var script = "& {Invoke-SCWSMARunbook -Parameter @{\"InputJson\"='";

			script += payload;
			script += ' -WebServiceEndpoint \" ' + mids.automation_server + '\" -RunbookName \"Get-SNApplicationSet\" -ReturnOutputStream -TimeoutSeconds 900 -Quiet | Select-Object -ExpandProperty \"StreamText\"}';

			pb.setScript(script);
			var response_all = pb.execute(true);
			var response = response_all.output;
			var pre_json = response.replace(/<.*>/gm, "");
			var json = JSON.parse(pre_json);
			var msg_type_appset = gs.getProperty('x_cir.integration.siam.appset_insert');
			var msg_type_pkgs = gs.getProperty('x_cir.integration.siam.appsetpacks_insert');
			var appResult = "";


			//FOR TEST WITH                          JSON INSERT
			//json['ApplicationSets'].push({'OU': current.x_cir_main_customer_ou + ""});
			//json.ApplicationSets.push({'Company' : current.sys_id + ""});

			//appResult = this.insertSIAMQueue(json, 'dea8509825cd63008ec4df308bdeb883', 'insert', 'ready');
			
			for(var j in json.ApplicationSets){
				json.ApplicationSets[j]['OU'] = current.x_cir_main_customer_ou + "";
				json.ApplicationSets[j]['Company'] = current.sys_id + "";
			}
			appResult = this.insertSIAMQueue(json, 'dea8509825cd63008ec4df308bdeb883', 'insert', 'ready');
				/*if(json.ApplicationSets[j]['Applications'].length > 0){

					if(!load_packages) appResult = this.insertSIAMQueue(json.ApplicationSets[j], msg_type_appset, 'insert', 'ready');
					for(var k in json.ApplicationSets[j]['Applications']){

						var appset = json.ApplicationSets[j]['Applications'][k]["ApplicationsetName"] = this.getMyID(json.ApplicationSets[j]["ApplicationsetName"], 'x_cir_app_set', 'unique_name');
						var pkg = json.ApplicationSets[j]['Applications'][k]["ApplicationRealName"] = this.getMyID(json.ApplicationSets[j]['Applications'][k]["ApplicationName"], 'x_cir_package', 'package_name');
						json.ApplicationSets[j]['Applications'][k]['OU'] = current.x_cir_main_customer_ou + "";
						gs.info("Inf - Apps bolleans are : " + appset + "   " +  pkg + "    EXPRESSION: " + appset + "  " +  pkg + "  ... " +  appResult);
						//gs.info("Inf - Apps : " + JSON.stringify(json.ApplicationSets[j]['Applications'][k]));
						if(pkg && appset){
							if(load_packages) this.insertSIAMQueue(json.ApplicationSets[j]['Applications'][k], msg_type_pkgs, 'insert_or_update', 'ready');
							gs.info("Inf - AppsSetsPkgs : " + appset + "   " +  pkg + "    After INSERT : " + appset + "  " +  pkg + "  ... " +  appResult + "   " + json.ApplicationSets[j]['Applications'][k]["ApplicationName"]);

						}
					}
				}



			}
			*/
			if(response.error == null) {
				gs.addInfoMessage("Collection was synched successfully to SCSM");
				return response.output.toString();
			} else {
				gs.addErrorMessage("Error on synching Collection with SCSM");
				return response.error.toString();
			}



		}

	},

	//Add record to SIAM queue
	insertSIAMQueue: function(payload, type, action, state){
		var newGR = new GlideRecord('x_snc_siam_light_queue');
		newGR.initialize();
		if(state) newGR.state = state;
		newGR.payload = JSON.stringify(payload);
		newGR.action = action;
		newGR.message_type.setDisplayValue(type);
		if(newGR.insert()){
			//gs.info("SIAM rec inserted");
			return true;
		} else {
			gs.error("SIAM rec error!!!");
			return false;
		}
    },
    //Check if the SIAM queue result is in state "processed" - so we have all packages/appSets/applications inserted beforehand hence adding m2m recs will be correct (no empty records)
    checkSIAMQueueStatus: function(sys_id){
        var sys_id = sys_id;
        var newGR = new GlideRecord('x_snc_siam_light_queue');
        if(newGR.get(sys_id)){
            if(newGR.state == 'processed'){
                return true;
            } else {
                return false;
            }
        }

    },
	//Get rec sys_id by Name
	getMyID: function(str, tbl, fld){
		var rec = new GlideRecord(tbl);
		rec.addQuery(fld, str);
		rec.query();
		if(rec.next()){
			return rec.sys_id.toString();
		}
		//return false
		//replcae with original string passed
		return false;

	},

	//Get all customer OUs
	getCustomerOUs: function(sys_id, parent_sys_id){
		var answer = [];
		if(parent_sys_id == "") parent_sys_id = sys_id;
		var customerOUs = new GlideRecord('x_cir_customer_ou');
		customerOUs.addEncodedQuery('customer=' + sys_id + '^ORcustomer=' + parent_sys_id); 
		customerOUs.query();
		if(!customerOUs.hasNext()){
			this.addErrorLog('ERROR', "No CustomerOU found! Exiting.", 'SCSM', 'OUT', '');
			return false;
		}
		while(customerOUs.next()){
			answer.push(customerOUs.sys_id.toString());
		}
		return answer;
	},

	addErrorLog: function (type, message, source, direction, mid) {
		var grErrorLog = new Interface_Monitor_Log_Lib();
		grErrorLog.addErrorLog(type, message, source, direction, mid);//type, message,source,direction)
	},

	type: 'AppSetRunbook'
};