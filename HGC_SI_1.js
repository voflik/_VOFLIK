reverse the flow - first RITM gets in Approval state-> Task get workked-? Y/N ->? then Approval  ( if = true ) ? closed : WiP ;
keep doc_stakeholder open - addattribe 


use doc_target_aud and remove selected option , with fillin the selected option in a separate field

fix the priority and date for IT tech stuff.

FIX the users list - its mismarched coz of user's rights

function approval_clientside(){
	
	g_form.hideAllFieldMsgs();
	g_form.clearMessages();
	
	var SubmitAction = 'true';
	var FieldsList = '';
	
	/*
 	*  ==================== Field list validation ====================
 	*/
	/*
	if(g_form.getValue('u_paysafe_project') == ''){
		g_form.showFieldMsg('u_paysafe_project',getMessage('Paysafe Project!'),'error');
		FieldsList = FieldsList + 'Paysafe Project, ';
		SubmitAction = 'false';
	}
	*/
	if(g_form.getValue('assigned_to') == ''){
		g_form.showFieldMsg('assigned_to',getMessage('Assigned To!'),'error');
		FieldsList = FieldsList + 'Assigned to, ';
		SubmitAction = 'false';
	}

	if(g_form.getValue('u_business_justification') == '' && g_form.getValue('u_business_justification_required') == 'true'){
		g_form.showFieldMsg('u_business_justification',getMessage('Business Justification'),'error');
		FieldsList = FieldsList + 'Business Justification, ';
		SubmitAction = 'false';
	}
	
	if(g_form.getValue('requested_by_date') == ''){
		g_form.showFieldMsg('requested_by_date',getMessage('Requested by date is required!'),'error');
		FieldsList = FieldsList + 'Requested by date, ';
		SubmitAction = 'false';
	}
	
	if(g_form.getValue('start_date') == ''){
		g_form.showFieldMsg('start_date',getMessage('Planned start date is required!'),'error');
		FieldsList = FieldsList + 'Planned start date, ';
		SubmitAction = 'false';
	}
	
	if(g_form.getValue('end_date') == ''){
		g_form.showFieldMsg('end_date',getMessage('Planned end date is required!'),'error');
		FieldsList = FieldsList + 'Planned start date, ';
		SubmitAction = 'false';
	}
	
	if(g_form.getValue('u_planned_duration') == '' || g_form.getValue('u_planned_duration') == '00 00:00:00'){
		g_form.showFieldMsg('u_planned_duration',getMessage('Duration is required!'),'error');
		FieldsList = FieldsList + 'Duration, ';
		SubmitAction = 'false';
	}
	
	console.log('after form validation');
	
	
	//g_form.showFieldMsg('u_outage_duration','dur: '+g_form.getValue('u_outage_duration'),'error');
	//console.log('u_outage_duration: ',g_form.getValue('u_outage_duration'));
	
	if(g_form.getValue('type') == 'Normal' && g_form.getValue('u_outage_required') == 'true' && (g_form.getValue('u_outage_duration') == '' || g_form.getValue('u_outage_duration') == '00 00:00:00')){
		g_form.showFieldMsg('u_outage_duration',/*getMessage(*/'Outage Duration is required!'/*)*/,'error');
		FieldsList = FieldsList + 'Outage Duration, ';
		SubmitAction = 'false';
	}
	
	console.log('after outage validation');
	
	/*
 	*  ==================== Validate Leadtimes ====================
 	*/
	
	var impact = g_form.getValue('impact').toString();
	var req_by_date = g_form.getValue('requested_by_date');
	var exp = g_form.getValue('u_expedited').toString();
	
	console.log('impact:', impact);
	console.log('req_by_date:', req_by_date);
	console.log('exp:', exp);
	
	if(req_by_date != ''){

        var schedule = '';
        
        // Get CI
        var gr = new GlideRecord('cmdb_ci');
        if(gr.get(g_form.getValue('cmdb_ci'))){
            // Get Location
            var loc = new GlideRecord('cmn_location');
            if(loc.get(gr.location)){
                //schedule
                console.log(loc);
                schedule = loc.u_schedule;
            }
        }

        var ga = new GlideAjax('HGC_DateUtils');
        ga.addParam('sysparm_name','isExpedited');
        ga.addParam('sysparam_requested_by_date', req_by_date);
        ga.addParam('sysparam_impact', impact);
        ga.addParam('sysparam_schedule', schedule);
        ga.getXMLWait();
		
		var validate = ga.getAnswer() == 'true' && g_form.getValue('type') == 'Normal' ? true : false;
		
		var xday = 0;
		switch(impact){
			case '101':
			xday = 1;
			break;
			case '102':
			xday = 3;
			break;
			case '103':
			xday = 7;
			break;
		}
		
		if (SubmitAction == 'true'){
			if(validate){
				var str = "The requested by date is smaller than the " + xday + "-day lead time and the request will be marked as expedited. Are you sure you want to continue?";
				show_expedite(str);
			}else{
				gsftSubmit(null, g_form.getFormElement(), 'submitForApproval_CR');
			}
			
		}else{
			g_form.addErrorMessage('The following fields: ' +  FieldsList + ' are mandatory');
			//gsftSubmit(null, g_form.getFormElement(), 'submitForApproval_CR');
			return false;
		}
	}	
}


if(typeof window == 'undefined'){
	runBusRuleCode_submitForApproval_CR();
}

// ****** FUNCTION TO SUBMIT FOR APPROVAL *******
function runBusRuleCode_submitForApproval_CR(){

	// If all tasks are completed, change the status to 'Autorize'
	if(current.type == "Emergency" || checkAllTaskCompleted(current)){

		current.state = -3; // Autorize
		current.update();
		action.setRedirectURL(current);
	}else{
		// If not closed, update the record, but do not change the state
		gs.addErrorMessage('Please complete all the assessment tasks');
		current.update();
		action.setRedirectURL(current);
	}
}

// Check if all attached tasks are completed
function checkAllTaskCompleted(current){
	
	// Get the tasks
	var gr = new GlideRecord('change_task');
	gr.addQuery('change_request', current.sys_id);
	gr.query();
	
	// Defaults at all closed
	var all_closed = true;
	
	// If a task is still open, set all_closed to false
	while(gr.next()){
		if(gr.state != 3){
			all_closed = false;
		}
	}
	
	// If all closed, returns true
	if(all_closed){
		return true;
	}
	
	// If not all closed, returns false and display error message
	//gs.addErrorMessage('Please complete all the assessment tasks');
	return false;
}

function show_expedite(short_text){
	//Initialize the GlideDialogWindow
	var gdw = new GlideDialogWindow('hgc_expedite_change');
	gdw.setPreference("short_text", short_text); //Pass in a short description for use in the dialog
	gdw.setTitle('Expedite Change');
	gdw.setSize(500,350);
	
	//Open the dialog window
	gdw.render();
	return false;
}