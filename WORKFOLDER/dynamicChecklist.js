/*
   *Name* 
	  DynamicChecklistCIR

   *Author:*
	  Joro Klifov 

   *Date created:* 
	   24.01.2019

   *Type:* 
	   Script Include

   *Tables:*
	   checklist
	   checklist_item
	   checklist_template

*/


var DynamicChecklistCIR = Class.create();
DynamicChecklistCIR.prototype = {
	initialize: function() {
	},
	//debugger,			
	debug: true,


	//Logs all messages with source set to dynamicChecklist
	log: function (message) {
		var name = 'dynamicChecklist';
		if(this.debug) {
			gs.warn(message,name);
		}
	},



	/*
  @createChecklist method
  @param String
  @returns void

  ussed to apply a checklist to a record
  */

	createChecklist : function(sysid, table, state, action) {

		var checkList = new GlideRecord("checklist");
		checkList.initialize();
		checkList.table = table;
		checkList.u_state = state;
		checkList.document = sysid;
		var chkSysid = checkList.insert();
		this.log("createChecklist : List inserted " + checkList.document);

		var question = this._getBoxes(action);
		//var sQuestion = question.split(",");
		this.log("createChecklist : action is " + question[1]);
		for(var i in question){
			this._createChecklistItems(chkSysid, question[i]);
			this.log("createChecklist : calling _createChecklistItems iteration " + i + " Question -> " + question[i].name + " AAAND SYSID of wrapper container " + chkSysid);
		}


	},

	/*
  @_createChecklistItems internal method
  @param String
  @param String
  @returns void

  used to ...
  */

	_createChecklistItems : function(sysid, obj) {

		var checks = new GlideRecord("checklist_item");
		checks.initialize();
		this.log("_createChecklistItems : initializing..." + sysid);
		checks.checklist = sysid;
		checks.name = obj.name;
		checks.order = obj.order;
		checks.insert();

	},

	/*
  @_getBoxes internal method
  @param String
  @returns String

  ussed to ...
  */
	_getBoxes : function(state) {

		var template = new GlideRecord('x_cir_checklist');
		var templateQuestions = [];
		template.addQuery('state', state);
		template.query();
		while(template.next()){
			this.log("_getBoxes : Template found  with name -> " + template.action);

			templateQuestions.push({"name" : template.action.toString(), "order" : template.order.toString(), "state" : template.state.toString()});      
		}
		this.log(JSON.stringify(templateQuestions));
		return templateQuestions;

    },
    
   
    checkIfCompleted: function(sys_id){
        

    },

	type: 'DynamicChecklistCIR'
};