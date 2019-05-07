(function executeRule(current, previous /*null when async*/) {


	if (gs.getProperty("x_cir.SharedFolders.start") != "true") {
        gs.addInfoMessage("Integration Create Shared Folder triggered but it is disabled");
        addErrorLog('ERROR', "Integration Create Shared Folder triggered but it is disabled", 'CREATE_SHARED_FOLDER', 'OUT', '');
		return;
	}

	if(current.share_folder_project == true && current.share_folder_orgswit == true && current.share_folder_orgswit_src == true){
        gs.addInfoMessage("Shared Folders were already created. You cannot create same folders twice");
        addErrorLog('ERROR', "Shared Folders were already created. You cannot create same folders twice", 'CREATE_SHARED_FOLDER', 'OUT', '');
		return;
	}

	var pathToScript = gs.getProperty('x_cir.SharedFolders.pathToScript');
	var MID  = "mid.server." + gs.getProperty('x_cir.SharedFolders.MID');
	// target directory

	//Create the folder paths
	var slash = "\\";
	var root_project = gs.getProperty('x_cir.SharedFolders.project.prefix.powershell');
	var root_orgswit = gs.getProperty('x_cir.SharedFolders.orgswit.prefix.powershell');
	var instance = gs.getProperty('x_cir.SharedFolders.instance.prefix');
    var icon = gs.getProperty('x_cir.SharedFolders.project.suffix.powershell');
    
    var cwp = current.item_type == 'connected' ? '-CWP' : '';

	var path_customerOU = current.customer.customer_number + "_" + current.customer.organizational_unit;
	var path_appName = current.application.manufacturer_name.getDisplayValue() + "_" + current.application.application_name ;
	var path_version = current.application.version + "_" + current.language.charAt(0);
	var path_build = current.cir_package.build_number.toString();
    //compose the path for the folders
    var orgswit_path = root_orgswit + slash + instance + path_customerOU + slash + path_appName + cwp + slash + path_version + slash + path_build + slash + 'Docs';
    var orgswit_src_path = root_orgswit + slash + instance + path_customerOU + slash + path_appName + cwp + slash + path_version + slash + path_build + slash + 'Sources';
	var project_path = root_project + slash + instance + path_customerOU + slash + path_appName + cwp + slash + path_version + slash + path_build + icon;
    //regex for spaces
    orgswit_path = orgswit_path.replace(/\s/g, '');
    orgswit_src_path = orgswit_src_path.replace(/\s/g, '');
	project_path = project_path.replace(/\s/g, '');


    var pb_orgswit_src = new global.PowershellCall_Lib(MID, "127.0.0.1", "CREATE_SHARED_FOLDER", "CreateShareFolders.ps1");
	var pb_orgswit = new global.PowershellCall_Lib(MID, "127.0.0.1", "CREATE_SHARED_FOLDER", "CreateShareFolders.ps1");
    var pb_project = new global.PowershellCall_Lib(MID, "127.0.0.1", "CREATE_SHARED_FOLDER", "CreateShareFolders.ps1");
    

    var script_orgswit_src_path = "PowerShell -WindowStyle Hidden -executionpolicy remotesigned -file " + pathToScript + " -location " + orgswit_src_path;
	var script_orgswit_path = "PowerShell -WindowStyle Hidden -executionpolicy remotesigned -file " + pathToScript + " -location " + orgswit_path;
	var script_project_path = "PowerShell -WindowStyle Hidden -executionpolicy remotesigned -file " + pathToScript + " -location " + project_path; 

	var reply_project = false;
    var reply_orgswit = false;
    var reply_orgswit_src = false;
    var response_orgswit_src = "";
	var response_orgswit = "";
	var response_project = "";

	//Execute First call . Check if we already execute the call before with success. If yes we skip
	if(current.share_folder_orgswit == false){
		pb_orgswit.setScript(script_orgswit_path);
		response_orgswit = pb_orgswit.execute(true);
		reply_orgswit = true;

	} else {
        addErrorLog('ERROR', "Project folder is already existing. Cancelling the create project share folder request", 'CREATE_SHARED_FOLDER', 'OUT', '');
        reply_orgswit = false;
	}

	//Execute Second call. Check if we already execute the call before with success. If yes we skip
	if(current.share_folder_project == false){
		pb_project.setScript(script_project_path);
		response_project = pb_project.execute(true);
		reply_project = true;

	} else {
        addErrorLog('ERROR', "Orgswit folder is already existing. Cancelling the create orgswt share folder request", 'CREATE_SHARED_FOLDER', 'OUT', '');
        reply_project = false;
    }
    //Execute third call for Sources folder
    if(current.share_folder_orgswit_src == false){
		pb_orgswit_src.setScript(script_orgswit_src_path);
		response_orgswit_src = pb_orgswit_src.execute(true);
		reply_orgswit_src = true;

	} else {
        addErrorLog('ERROR', "Orgwit Sources folder is already existing. Cancelling the create project share folder request", 'CREATE_SHARED_FOLDER', 'OUT', '');
        reply_orgswit_src = false;
	}
	
	//property error is null when we fetch the result. HEnce we must regex the output property
	var projectErr = false;
    var orgswitErr = false;
    var orgswitSRCErr = false;
	var projectOK= false;
    var orgswitOK = false;
    var orgswitSRCOK = false;
	var errRegex = /.*\[Error\].*/gmi;
	var okRegex = /.*\[Success\].*/gmi;
	projectErr = ((errRegex.test(response_project.output) == true) || (response_project.hasOwnProperty('error') == true)) ? true : false;
    orgswitErr = ((errRegex.test(response_orgswit.output) == true)  || (response_orgswit.hasOwnProperty('error') == true)) ? true : false;
    orgswitSRCErr = ((errRegex.test(response_orgswit_src.output) == true)  || (response_orgswit_src.hasOwnProperty('error') == true)) ? true : false;
	projectOK = okRegex.test(response_project.output) == true ? true : false;
    orgswitOK = okRegex.test(response_orgswit.output) == true ? true : false;
    orgswitSRCOK = okRegex.test(response_orgswit_src.output) == true ? true : false;

	if(reply_project){

		if(projectErr){
            //gs.addErrorMessage("Something went wrong creating Project Folder. Error message :\n " + response_project.output + "\n" + response_project.error);
            addErrorLog('ERROR', "Something went wrong creating Project Folder. Error message :\n " + response_project.output, 'CREATE_SHARED_FOLDER', 'OUT', '');

		} 
		if(projectOK){
            //gs.addInfoMessage("Project Folder succesfully created. Server response :\n " + response_project.output);
            addErrorLog('INFO', "Project Folder succesfully created. Server response:\n " + response_project.output, 'CREATE_SHARED_FOLDER', 'OUT', '');
			current.share_folder_project = true;
		}
	}


	if(reply_orgswit){

		if(orgswitErr){
            //gs.addErrorMessage("Something went wrong creating Orgswit Folder. Error message :\n " + response_orgswit.output + "\n" + response_orgswit.error);
            addErrorLog('ERROR', "Something went wrong creating Orgswit Folder. Error message :\n " + response_orgswit.output, 'CREATE_SHARED_FOLDER', 'OUT', '');
			

		} 
		if(orgswitOK){
            //gs.addInfoMessage("Orgswit Folder succesfully created. Server response :\n " + response_orgswit.output);
            addErrorLog('INFO', "Orgswit Folder succesfully created. Server response:\n " + response_orgswit.output, 'CREATE_SHARED_FOLDER', 'OUT', '');
			current.share_folder_orgswit = true;

		}
    }

    if(reply_orgswit_src){

		if(orgswitSRCErr){
            //gs.addErrorMessage("Something went wrong creating Orgswit Source Folder. Error message :\n " + response_orgswit_src.output + "\n" + response_orgswit_src.error);
            addErrorLog('ERROR', "Something went wrong creating Orgswit Source Folder. Error message :\n " + response_orgswit_src.output, 'CREATE_SHARED_FOLDER', 'OUT', '');
			

		} 
		if(orgswitSRCOK){
            //gs.addInfoMessage("Orgswit Source Folder succesfully created. Server response :\n " + response_orgswit_src.output);
            addErrorLog('INFO', "Orgswit Source Folder succesfully created. Server response:\n " + response_orgswit_src.output, 'CREATE_SHARED_FOLDER', 'OUT', '');
			current.share_folder_orgswit_src = true;
			

		}
    }
	//if(projectOK || orgswitOK || orgswitSRCOK) {
	//	current.setWorkflow(false);
	//	current.update();
	//}
    

})(current, previous);

    //Logger
    function addErrorLog(type, message, source, direction, mid) {
		var grErrorLog = new Interface_Monitor_Log_Lib();
		grErrorLog.addErrorLog(type, message, source, direction, mid);//type, message,source,direction)
	}