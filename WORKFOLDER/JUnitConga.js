var JUnitConga = Class.create();
JUnitConga.prototype = {
	initialize: function() {
	},
	// Test "Global" Runbook
	testGlobal: function(sys_id){
		var MID = this.getMID(sys_id);
		var pb = new global.PowershellCall_Lib(MID.agent, "127.0.0.1", "JUNitConga test Global RunBook", "Manage_ApplicationStatus.ps1");
		var script = "& {Invoke-SCWSMARunbook -WebServiceEndpoint  '" + MID.uri + "'\ -RunbookName \"Global\" -ReturnOutputStream -TimeoutSeconds 900 -Quiet | Select-Object -ExpandProperty \"StreamText\"}";
		pb.setScript(script);

		var response = pb.execute(true);

		if(this.getAnswer(response) == true || this.getAnswer(response) == "true"){
			gs.addInfoMessage("JUnitConga::testGlobal => Global Runbook suceeded! All OK!");
            this.addErrorLog('SUCCESS', "JUnitConga::testGlobal => Global Runbook suceeded! All OK!", 'JUnit', 'OUT', '');
            return true;
		} else {
			gs.addErrorMessage("JUnitConga::testGlobal => Global Runbook ERROR!");
            this.addErrorLog('ERROR', "JUnitConga::testGlobal => Global Runbook ERROR! ", 'JUnit', 'OUT', '');
            return false;
		}


	},
    //Get MID server. 
    //@Param sys_id String - use sys_id of MID of customer
	getMID: function(sys_id){
		var mids = new GlideRecord('x_cir_midofcustomer');
		if(mids.get(sys_id)){

			return {
                "agent" : mids.mid_server.name,
                "uri" : mids.automation_server
            }

		} else {
			this.addErrorLog('ERROR', "No MID server found for sys_id - " + sys_id + " ! Error Exit!", 'JUnit', 'OUT', '');

			return;
		}

	},

	//Parse XML response
	getAnswer: function (str) {
		try {
			var res;
			if(parseInt(str) !== 0){
				res = false;
			} else {
				res = true;
			}
			this.addErrorLog('INFO', "JUnitConga::getAnswer => XML payload is  " + res + " \n" + str, 'JUnit', 'OUT', '');
			return res;
		} catch (err) {
			this.addErrorLog('ERROR', "JUnitConga::getAnswer => Not a valid XML format!  " + err, 'JUnit', 'OUT', '');
			return str;
		}

	},
    //Logger class init
	addErrorLog: function (type, message, source, direction, mid) {
		var grErrorLog = new Interface_Monitor_Log_Lib();
		grErrorLog.addErrorLog(type, message, source, direction, mid);
	},


	type: 'JUnitConga'
};