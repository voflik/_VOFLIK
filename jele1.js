<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	<style type="text/css">
		label { font-weight: bold; }
		#sys_display\.u_jira_project { border-color: #d64541; }
	</style>
	
	<g:ui_form>
   <table width="100%">
      <tr>
       <td>
		   <label for="u_jira_project_list">yoo</label><br/>
         <g:ui_reference name="joro" id="joro_1" class="is-required" table="u_guests" query="" var="jelly_var"  
columns=""/>
		   <br/>
       </td>
     </tr>
     <tr>
       <td>
       </td>
		 
     </tr>
	
		<script>
				var xxx = "KYP";
	    </script>
    <g:sc_button id="test" title="title" label="My new BTN" onclick="alert('test')" />

     <tr id="dialog_buttons">
        <td colspan="2" align="right">
           <!-- Add OK/Cancel buttons. Clicking OK calls the validateComments script -->
           <g:dialog_buttons_ok_cancel ok="go()" ok_type="button" cancel_type="button" />
        </td>
     </tr>
  </table>
</g:ui_form>
</j:jelly>