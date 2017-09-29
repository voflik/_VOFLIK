			//for approvals
	var val = dev.u_mapr_microservices.split(",").length > 0 ? true : false;
	var groupApprovals = ['f8947dfe0f9f76000643f68ce1050e00','e04c13c76f2f5600526b7357ea3ee4d2'];
	
	if(val){
				groupApprovals.push('4aec8ea76f0b5100685246916e3ee4d5');
				log("GroupApprovals array is +1 " + groupApprovals);
				generatePerGroup(groupApprovals, current.sys_id);
			}
			else{
				log("GroupApprovals is 2 groups " + groupApprovals);
				generatePerGroup(groupApprovals);
			}

			
			
			
		function generateApproval(group){
		
		var approval = new GlideRecord('sysapproval_group');
		approval.initialize();
		approval.active = true;
		approval.assignment_group = group;
		approval.parent = current.sys_id;
		approval.approval = 'requested';
		approval.priority = current.priority;
		approval.state = 'requested';
		approval.insert();
		log("Ading  Approval for CHANGE " + current.number + " app.number);

	}
	
	function generatePerGroup(groups){
		for(var i in groups){
			log("Generate approval for " + groups[i]);
			generateApproval(groups[i]);
		}
	}
	
	function log(message) {
		if(this.debug) {
			gs.log(message, 'DevOps Generator');
		}
		
		
		
		
		
		group=' ^ORgroup=NULL^sysapproval.number=CHG0060925^stateINrequested,approved
		
		
var groupApprovals = ['f8947dfe0f9f76000643f68ce1050e00','e04c13c76f2f5600526b7357ea3ee4d2'];
var o = "";		
var app = new WorkflowApprovalUtils();
app.createGroupApprovers(groupApprovals, o); 		
		
		
	 createGroupApprovers: function(groups, order, state) {
      if (!state)
         state = 'not requested';
      
      var gr = new GlideRecord('sysapproval_group');
      for (var id in groups) {
         gr.initialize();
         gr.short_description = current.short_description;
         gr.parent = current.sys_id;
         gr.assignment_group = id;
         gr.approval = state;
         gr.addDomainQuery(current);
         gr.insert();
      }
   },
   
   
   /////////////////
   
   
   function checkIfGroupApprovalStillRequired(group, number){
	
	var approval = new GlideRecord('sysapproval_approver');
	approval.addEncodedQuery('assignment_group=' + group + '^sysapproval.number=' + number + '^state=approved^document_id=' + );
	approval.query();
	if(approval.query()){
		
	   approval.state = 'not_required';
	   approval.update();
	
	}
	
	
	
}

//////////////


gs.include("PrototypeServer");

var UIActionUtils = Class.create();

UIActionUtils.prototype = {
  initialize : function() {
  },

  approvalsNoLongerRequired : function(sysId) {
    var approve = new GlideRecord('sysapproval_approver');
    approve.addQuery('sysapproval', sysId);
	approve.addQuery(
    approve.addQuery('state', 'requested').addOrCondition('state', 'not requested');
    approve.query();
    while(approve.next()) {
      approve.state = 'not_required';
      approve.update();
    }
  }
}



if(current.u_isdevops == true){
	var val = dev.u_mapr_microservices;
	 
	val = val.split(",").length > 0 ? true : false;
	if(val){
		
		answer.push('4aec8ea76f0b5100685246916e3ee4d5');
		answer.push('f8947dfe0f9f76000643f68ce1050e00');
		answer.push('e04c13c76f2f5600526b7357ea3ee4d2');
	}
	else{
		answer.push('f8947dfe0f9f76000643f68ce1050e00');
		answer.push('e04c13c76f2f5600526b7357ea3ee4d2');
	}
}


TRY ME!!!!
   /**
    * Create user approvals for a sysapproval_group approval
    */
	1c94a2520f6403000643f68ce1050ed4
   function createUserApprovals(groupApproval) {
      if (groupApproval.assignment_group.nil())
         return;
      
      var ids = this.getMembersOfGroup(groupApproval.assignment_group);
      var state = groupApproval.approval + '';
      var taskId = groupApproval.parent + '';
      var approvalId = groupApproval.sys_id + '';

      for (var i = 0; i < ids.length; i++) {
      	 var approval = new GlideRecord('sysapproval_approver');
         approval.initialize();
         approval.sysapproval = taskId;
         // fill out reference to task with the in-memory GlideRecord. 
         // When "Approval Events (Task)" runs it will be able to obtain the task type even though it doesn't yet exist in DB
         var target = groupApproval.parent.getRefRecord();
         approval.sysapproval.setRefRecord(target);
         approval.source_table = target.getRecordClassName();
         approval.document_id = target.sys_id +'';
         approval.group = approvalId;
         approval.approver = ids[i];
         approval.wf_activity = groupApproval.wf_activity;
         approval.state = state;
         if (state == 'approved')
            approval.setValue('comments', gs.getMessage('Automatic approval'));
         
         approval.expected_start = groupApproval.expected_start;
         approval.due_date = groupApproval.due_date;
         approval.insert();
      }
   },
   
   
   
   
   
   ///////////////////
   
   
   
   
   
   var gr = new GlideRecord('sysapproval_approver');
if (gr.get(current.sys_id)) {

    if(current.group && current.document_id.u_isdevops){
      var group = new GlideRecord('sysapproval_group');
      if(group.get(current.group)){
        group.approval = 'approved';
        group.active = false;
        group.update();
        
	}
}
    //gr.update();
    //gr.insert();
    //gr.deleteRecord();
}