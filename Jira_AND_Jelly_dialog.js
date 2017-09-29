var CSWizardHelper = Class.create();
CSWizardHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	getWizardAccount: function(){
		if(current.variables.contact && !current.variables.account){
			var contact = new GlideRecord("customer_contact");
			contact.addQuery("sys_id", current.variables.contact);
			contact.query();
			if(contact.next()){
				return "sys_id="+contact.getValue('account');
			}
		}
		return;
	},
	getWizardAccountName: function(){
		if(current.variables.account)
			return current.variables.account;
	},
	getWizardContactAsset: function(){	
		if(current.variables.account)
			return 'account='+current.variables.account;
		return;
	},
	getWizardProduct: function(){
		if(current.variables.account)
			return 'company='+current.variables.account;
		return;
	},
	storeWizSessionVariable: function(name,value){
		try{
			var session_var_name   = this.getParameter('sysparm_session_var');
			var session_var_value   = this.getParameter('sysparm_session_val');
			gs.getSession().putClientData(session_var_name, session_var_value);
			if(gs.getSession().getClientData(session_var_name)==session_var_value)
				return "success";
			else
				return "failed";
		}
		catch(e){
			
		}
	},
    type: 'CSWizardHelper'
});








/////////////////////////////////////////////////////////////////////////////////////////////////////////////


function DisplayJiraSubmissionWindow() {
    //Initialize the GlideDialogWindow
    var gdw = new GlideDialogWindow('x_paym_jira_integr_ITCE_JIRA_Integration');
    gdw.setTitle('Submit a jira ticket');   
	gdw.setSize(400, 500);
    gdw.setPreference('IncidentId', g_form.getUniqueValue());
 
    //Open the dialog window
    gdw.render();
}










x_paym_jira_integr_ITCE_JIRA_Integration


<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<style type="text/css">
		label { font-weight: bold; }
		#sys_display\.u_jira_project { border-color: #d64541; }
	</style>
	<script type="text/javascript">
	function submitJiraTicket() {
		//If there are comments, close the dialog window and submit them
		var project = gel('u_jira_project');
		if(!project || !project.value) {
		return;
		}
		GlideDialogWindow.get().destroy(); //Close the dialog window
		g_form.setValue("u_jira_project", project.value);
		g_form.save();

		
	}

	</script>
	<g:ui_form>
   <table width="100%">
      <tr>
       <td>
		   <label for="u_jira_project_list">Select an available JIRA Project*</label><br/>
         <g:ui_reference name="u_jira_project" id="u_jira_project_list" class="is-required" table="x_paym_jira_integr_jira_project_configuration" query="" completer="AJAXTableCompleter" 
columns=""/>
		   <br/>
       </td>
     </tr>
     <tr>
       <td>
       </td>
     </tr>
     <tr id="dialog_buttons">
        <td colspan="2" align="right">
           <!-- Add OK/Cancel buttons. Clicking OK calls the validateComments script -->
           <g:dialog_buttons_ok_cancel ok="return submitJiraTicket()" ok_type="button" cancel_type="button" />
        </td>
     </tr>
  </table>
</g:ui_form>
</j:jelly>






