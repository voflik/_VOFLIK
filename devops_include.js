var DevOps_CHG_Generation = Class.create();
DevOps_CHG_Generation.prototype = {
	initialize: function() {
	},
	//Set limit for concurrent DB operatins at once
	batch: 250,
	
	generateChild: function(requester, sdesc, assignGrp, parent){
		var child = new GlideRecord('change_request');
		child.initialize();
		child.requested_by = requester;
		child.short_description = sdesc;
		child.assignment_group = assignGrp;
		child.parent = parent;
		child.insert();
	},
	//Mass close all related child changes
	//returns void
	massClose: function(par){
		var rec = new GlideRecord('change_request');
		rec.addQuery('parent', par);
		//rec.addActiveQuery();
		rec.setLimit(this.batch);
		rec.query();
		
		while(rec.next()){
			rec.description = 'Mass Closed by: ' + rec.parent.getDisplayValue() + '\n' + rec.description;
			rec.u_all_tasks_closed = 'true';
			rec.state = '3';
			rec.phase = 'Closed';
			rec.u_kanban_state = "Done";
			rec.active = false;
			rec.update();
			//
		}
		//return true;
		
	},
	//Mass approve all related changes. Used to set the children to WiP
	//returns void
	massApprove: function(par, start, end, ci, proj){
		var rec = new GlideRecord('change_request');
		rec.addQuery('parent', par);
		rec.addActiveQuery();
		rec.setLimit(this.batch);
		rec.query();
		while(rec.next()){
			//gs.log("DATES " + proj + "  " + proj.getDisplayName() , "MASS");
			//rec.u_all_tasks_closed = 'true';
			//rec.u_paysafe_project = '63c65bd50f6d3a409eca83fc22050e6e';
			rec.description = 'Approved by Master Change ' + rec.parent.getDisplayValue() + '\n' + rec.description;
			rec.u_paysafe_project = proj;
			rec.cmdb_ci = ci;
			rec.start_date = start;
			rec.end_date = end;
			rec.approval = 'approved';
			rec.state = '2';
			rec.phase = 'Work in Progress';
			rec.u_kanban_state = "Implement";
			rec.update();
		}
		
	},
	//Mass assign to same user as Paren/Master chg
	//returns void
	massAssign: function(par, assignee){
		var rec = new GlideRecord('change_request');
		rec.addQuery('parent', par);
		rec.setLimit(this.batch);
		rec.query();
		
		while(rec.next()){
			rec.assigned_to = assignee;
			rec.update();
		}
		
		
	},
	//Mass cancel all child changes
	//retuns void
	//DFCT0010171 14.06.17 JKlifov
	
	massCancel: function(par){
		var rec = new GlideRecord('change_request');
		rec.addQuery('parent', par);
		rec.setLimit(this.batch);
		rec.query();
		
		while(rec.next()){
			rec.u_all_tasks_closed = 'true';
			rec.description = 'Mass Cancelled by: ' + rec.parent.getDisplayValue() + '\n' + rec.description;
			//rec.approval = "rejected";
			rec.active = false;
			rec.state = 120;
			rec.phase = "Closed";
			rec.u_kanban_state = "Rejected";
			rec.update();
			gs.log("Mass cancel " + rec.u_kanban_state + " " + rec.number + " " + rec.phase);
		}
		
		
		
	},
	
	type: 'DevOps_CHG_Generation'
};
