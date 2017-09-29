(function executeRule(current, previous /*null when async*/) {
	
	

	generateChanges();
	
	function generateChanges(){
		gs.log('Generating Changes based on variables!', 'DevOps Generator');
		var dev = new GlideRecord('change_request');
		dev.addQuery('sys_id', current.sys_id);
		dev.query();
		if(dev.next()){
			var zionPlat = dev.u_zion_platform;
			var zionPlatSplit = zionPlat.split(",");
			var zionMicro = dev.u_zion_microservices;
			var zionMicroSplit = zionMicro.split(",");
			var maprPlat = dev.u_mapr_platform;
			var maprPlatSplit = maprPlat.split(",");
			var maprMicro = dev.u_mapr_microservices;
			var maprMicroSplit = maprMicro.split(",");
			var req_by = dev.requested_by;
			var sDesc = dev.short_description;
			var desc = '<p><span style="color: #ff6600;">'+ dev.u_description + '</span></p>';
			
			
			
			
			gs.log('Found DevOps CHG' + dev.number, 'DevOps Generator');
			gs.log('Zion Plat: ' + zionPlat, 'DevOps Generator');
			gs.log('Zion Plat Split: ' + zionPlatSplit, 'DevOps Generator');
			gs.log('Zion Plat Split LEN: ' + zionPlatSplit, 'DevOps Generator');
			gs.log('zionMicro : ' + zionMicro, 'DevOps Generator');
			gs.log('zionMicroSplit: ' + zionMicroSplit, 'DevOps Generator');
			gs.log('maprPlat: ' + maprPlat, 'DevOps Generator');
			gs.log('maprPlatSplit: ' + maprPlatSplit, 'DevOps Generator');
			gs.log('maprPlatSplit LEN: ' + maprPlatSplit, 'DevOps Generator');
			gs.log('maprMicro: ' + maprMicro, 'DevOps Generator');
			gs.log('maprMicroSplit: ' + maprMicroSplit, 'DevOps Generator');
			gs.log('maprMicroSplit LEN :  ' + maprMicroSplit, 'DevOps Generator');
			gs.log('desc and sDesc are : ' + desc + '  :  ' + sDesc, 'DevOps Generator');
			
			if(zionPlatSplit.length > 0 || zionMicroSplit.length > 0 ||  maprPlatSplit.length > 0 || maprMicroSplit.length > 0){
				var child = new GlideRecord('change_request');
				
				
				//Generate Zion Platform Change Requests based on selected variable choices form list collector:
				
				for(i=0; i<zionPlatSplit.length; i++){
					child.initialize();
					child.u_description = '<b>' + getDisplayVal('u_cmdb_ci_appl_zion_platform', zionPlatSplit[i], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_zion_platform', zionPlatSplit[i], 'version') + '</b>' + '<hr>' + '<br>' + 'Parent Change is: ' + current.number + '<br>' + desc;
					child.short_description = getDisplayVal('u_cmdb_ci_appl_zion_platform', zionPlatSplit[i], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_zion_platform', zionPlatSplit[i], 'version') + ' - ' + sDesc;
					child.u_change_template.setDisplayValue("Zion Platform");
					child.u_change_category.setDisplayValue("DevOps");
					child.u_change_subcategory.setDisplayValue("Zion Platform");
					child.u_paysafe_project.setDisplayValue("Group Platform");
	                child.assignment_group.setDisplayValue("Global DevOps");
					child.type = "Standard";
					child.phase = 'New';
					//Commented for now. No INFO what we do with that
					//child.u_kanban_state = "Design";
					child.state = -5;
					child.approval = 'not requested';
					child.u_approval_state = 'not_requested';
					child.cmdb_ci = zionPlatSplit[i];
					child.business_service.setDisplayValue("Zion Platform Prod");
					child.u_impacted_business_service.setDisplayValue("Zion Platform Prod");
					child.requested_by_date = gs.now();
					child.requested_by = req_by;
					child.parent = current.sys_id;
					//child.setWorkflow(false);
					child.insert();
					gs.log('Zion Platform Split ' + zionPlatSplit[i], 'DevOps Generator');
				}
				
				//Generate Zion Microservice Change Requests based on selected variable choices form list collector:
				
				for(m=0; m<zionMicroSplit.length; m++){
					
					child.initialize();
					child.u_description = '<b>' + getDisplayVal('u_cmdb_ci_appl_micro', zionMicroSplit[m], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_micro', zionMicroSplit[m], 'version') + '</b>' + '<hr>' + '<br>' + 'Parent Change is: ' + current.number + '<br>' + desc;
					child.short_description = getDisplayVal('u_cmdb_ci_appl_micro', zionMicroSplit[m], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_micro', zionMicroSplit[m], 'version') + ' - ' + sDesc;
					child.u_change_template.setDisplayValue("Zion Microservices");
					child.u_change_category.setDisplayValue("DevOps");
					child.u_change_subcategory.setDisplayValue("Microservices");
					child.u_paysafe_project.setDisplayValue("Group Platform");
	                child.assignment_group.setDisplayValue("Global DevOps");
					child.type = "Standard";
					child.phase = 'New';
					//Commented for now. No INFO what we do with that
					//child.u_kanban_state = "Design";
					child.state = -5;
					child.approval = 'not requested';
					child.u_approval_state = 'not_requested';
					child.cmdb_ci = zionMicroSplit[m];
					child.business_service.setDisplayValue("MAPR Platform Prod");
					child.u_impacted_business_service.setDisplayValue("MAPR Platform Prod");
					child.requested_by_date = gs.now();
					child.requested_by = req_by;
					child.parent = current.sys_id;
					//child.setWorkflow(false);
					child.insert();
					gs.log('Zion Micro Split ' + zionMicroSplit[m], 'DevOps Generator');
				}
				
				//Generate MapR Platform Change Requests based on selected variable choices form list collector:
				
				for(r=0; r<maprPlatSplit.length; r++){
					child.initialize();
					child.u_description = '<b>' + getDisplayVal('u_cmdb_ci_appl_mapr_crud', maprPlatSplit[r], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_mapr_crud', maprPlatSplit[r], 'version') + '</b>' + '<hr>' + '<br>' + 'Parent Change is: ' + current.number + '<br>' + desc;
					child.short_description = getDisplayVal('u_cmdb_ci_appl_mapr_crud', maprPlatSplit[r], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_mapr_crud', maprPlatSplit[r], 'version') + ' - ' + sDesc;
					child.u_change_template.setDisplayValue("MapR CRUD DevOps");
					child.u_change_category.setDisplayValue("DevOps");
					child.u_change_subcategory.setDisplayValue("MapR CRUD");
					child.u_paysafe_project.setDisplayValue("Group Platform");
	                child.assignment_group.setDisplayValue("Global DevOps");
					child.type = "Standard";
					child.phase = 'New';
					//Commented for now. No INFO what we do with that
					//child.u_kanban_state = "Design";
					child.state = -5;
					child.approval = 'not requested';
					child.u_approval_state = 'not_requested';
					child.cmdb_ci = maprPlatSplit[r];
					child.business_service.setDisplayValue("MAPR Platform Prod");
					child.u_impacted_business_service.setDisplayValue("MAPR Platform Prod");
					child.requested_by_date = gs.now();
					child.requested_by = req_by;
					child.parent = current.sys_id;
					//child.setWorkflow(false);
					child.insert();
					gs.log('In FOR Mapr Plat Split ' + maprPlatSplit[r], 'DevOps Generator');
				}
				
				//Generate MapR Package MGMT Change Requests based on selected variable choices form list collector:
				
				for(j=0; j<maprMicroSplit.length; j++){
					child.initialize();
					child.u_description = '<b>' + getDisplayVal('u_cmdb_ci_appl_mapr_platform', maprMicroSplit[j], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_mapr_platform', maprMicroSplit[j], 'version') + '</b>' + '<hr>' + '<br>' + 'Parent Change is: ' + current.number + '<br>' + desc;
					child.short_description = getDisplayVal('u_cmdb_ci_appl_mapr_platform', maprMicroSplit[j], 'name') + ' ver. ' + getDisplayVal('u_cmdb_ci_appl_mapr_platform', maprMicroSplit[j], 'version') + ' - ' + sDesc;
					child.u_change_template.setDisplayValue("MapR Package Management");
					child.u_change_category.setDisplayValue("DevOps");
					child.u_change_subcategory.setDisplayValue("MapR Packages");
					child.u_paysafe_project.setDisplayValue("Group Platform");
	                child.assignment_group.setDisplayValue("Global DevOps");
					child.type = "Standard";
					child.phase = 'New';
					//Commented for now. No INFO what we do with that
					//child.u_kanban_state = "Design";
					child.state = -5;
					child.approval = 'not requested';
					child.u_approval_state = 'not_requested';
					child.cmdb_ci = maprMicroSplit[j];
					child.business_service.setDisplayValue("MAPR Platform Prod");
					child.u_impacted_business_service.setDisplayValue("MAPR Platform Prod");
					child.requested_by_date = gs.now();
					child.requested_by = req_by;
					child.parent = current.sys_id;
					//child.setWorkflow(false);
					child.insert();
					gs.log('Mapr Micro Split ' + maprMicroSplit[j], 'DevOps Generator');
				}
			}
			
			
		}
		else{
			gs.log('Did not find DevOps CHG', 'DevOps Generator');
		}
	}
	
	function getDisplayVal(table, val, field){
	
		var rec = new GlideRecord(table);
		if(rec.get(val)){
			
			return rec[field];
		}

	}
	
	
	

	

	
})(current, previous);