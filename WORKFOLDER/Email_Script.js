var WeeklyProjectManagerEmail = Class.create();
 
WeeklyProjectManagerEmail.prototype = {
  initialize : function() {
  },
 
  send : function(msi) {
 
var prj = new GlideRecord('pm_project');
  prj.get(msi);
 
  var uri = gs.getProperty('glide.instance.url');
 
  outputString = '<body style="color: #000000; font-family: arial, helvetica, sans-serif; font-size:12px;">'
  + '<span style="color: #000000; font-family: arial, helvetica, sans-serif; font-size:12px;" >';
  th = "<th bgcolor=#C0C0C0>";
  tableHeader = "<table style='width: 90%; color: #000000; font-family: arial, helvetica, sans-serif;  font-size:12px;'>";
  tableFooter = "</table></br></br>\r\n";
 
 
  outputString = outputString +"<b><a href=" + uri + "pm_project.do?sys_id="+prj.sys_id+">"+prj.number + "</a>"+" "+"</b> - " + prj.short_description.getDisplayValue() + " "+"</br>State: " + prj.state.getDisplayValue() + "</br></br>";
 
 
  var ptch = new GlideRecord("pm_project_task");
  ptch.addEncodedQuery('parent=' + prj.sys_id);
  ptch.orderBy('ptch.start_date');
  ptch.query();
  if (ptch.hasNext()) {
  gs.log('found some records that need patch scheduler to look at ','debug.u_patching');
  outputString = outputString + "<b>Project Tasks for " + prj.number + "</b><br><table style='width: 90%; color: #000000; font-family: arial, helvetica, sans-serif;  font-size:12px;'>";
 
  outputString = outputString + "<tr>"+th+"Number</th>"+th+"Planned Start</th>"+th+"Planned End</th>"+th+"Title</th>"+th+"State</th>"+th+"Assignee</th></tr>";
  while (ptch.next()) {
  outputString = outputString +"<tr><td width='150px'><a href=" + uri + "pm_project_task.do?sys_id="+ptch.sys_id+">"+ptch.number + "</a>"+" "+"</td><td width='150px'>" + ptch.start_date + " "+"</td><td width='150px'>" + ptch.end_date + " "+"</td><td>" + ptch.short_description.getDisplayValue() + " "+"</td><td width='100px'>" + ptch.state.getDisplayValue() + " "+"</td><td width='200px'>"+ ptch.assigned_to.getDisplayValue() + "</td></tr>";
 
  }
  outputString = outputString + "</table><table style='width: 90%; color: #000000; font-family: arial, helvetica, sans-serif;  font-size:12px;'>";
  }
 
  outputString = outputString + tableFooter + '</body></span>';
 
  return outputString;
 
 
  },
 
  type : WeeklyProjectManagerEmail
  };
  
  
  
  /////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////
  ///////////// ANOTHER ONE!!! LONG ONE!!! ////////////////////////
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////
  
  
  
  
  
  
  
  var UserServiceNowDigest = Class.create();
UserServiceNowDigest.getDate = function() {
    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var gdt = new GlideDateTime();
    return (days[gdt.getDayOfWeekLocalTime() - 1] + " " + gdt.getDayOfMonthLocalTime() + " " + months[gdt.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        gr.addJoinQuery("sys_user_has_role","sys_id","user");
        gr.query();
    return gr;
}
UserServiceNowDigest.prototype = {
    root_url: gs.getProperty('glide.servlet.uri'),
    cell_across_style: 'padding: 0 0 5px 0; border-bottom: 1px solid #dddddd; text-align: left; font-weight: bold; font-size: 13px;',
    cell_class_style: 'padding-top: 8px; font-weight: bold;',
    cell_row_style: 'padding-right: 10px; white-space:nowrap;',
    view_all_style: 'padding:8px 0; text-align:center; border-top:1px solid #ddd;',
    rp_project_url: 'com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id=db685632208c7c00875f750ec43c55e5',
    rp_incident_url: 'com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id=82febb7b55df5cc496348ccfdc7a89e7',
    rp_request_url: 'com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id=cdfdf77b55df5cc496348ccfdc7a89aa',
    unsubscribe_url: ('unsubscribe.do?sysparm_notification=' + email_action.sys_id),

    tmp_table_open: '<table style="width: 100%; border:none; font-family: arial, helvetica, sans-serif; font-size:12px;">',
    tmp_table_close: '</table>',
    mailto: 'mailto:informa@service-now.com?',
    initialize: function(gSource) {
        this.tmpl          = MicroTemplateEngine;
        this.gCurrent      = gSource;
        this.arrayUtils    = new ArrayUtil();
        this.show_limit    = 10;
        this.policies = ["20759702657a6140407ecc2c2dcc589b", "a24b8fca65b66140407ecc2c2dcc5867"];
    },
    render: function() {
        this._renderPersonalInfo();
        template.print("<br />");
        this._renderApprovals();
        template.print("<br />");
        this._renderOpenTickets();
        template.print("<br />");
        this._renderWatchedTickets();
        template.print("<br />");
        this._renderAssets();
        template.print("<br />");
        this._renderPolicies();
        template.print("<br /><hr/>");
        this._renderExtraLinks();
    },

    // Private Methods
    _renderPersonalInfo: function() {
        var updateAccountLink = this.root_url +'u_itp_update_account.do?sysparm_stack=u_itp_update_account_list.do&sys_id=-1';
        template.print(this.tmp_table_open);
        template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
            value: "My Details - " + this.tmpl(gs.getMessage('html.link_standard'),{value: 'Click to update', link: updateAccountLink }),
            style: this.cell_across_style + "padding-top:10px;"
        }));
        template.print('<tr><td style="text-align: left; padding: 15px 0;">');
        template.print('<div><b>Name: </b>${name}</div>');
        template.print('<div><b>Manager: </b>${manager}</div>');
        template.print('<div><b>Location: </b>${location}</div>');
        template.print('<div><b>Division: </b>${u_division}</div>');
        template.print('<div><b>Company: </b>${company}</div>');
        template.print('<div><b>Email: </b>${email}</div>');
        template.print('<div><b>Telephone: </b>${phone}</div>');
        template.print('</td></tr>');
        template.print(this.tmp_table_close);  
    },
    _renderPolicies: function() {
        template.print(this.tmp_table_open);
        template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
            value: "My Policies",
            style: this.cell_across_style
        }));
        var self = this;
        this.arrayUtils.union(PolicyInstanceHelper.getPoliciesByUser(event.parm1), this.policies).forEach(function(policyId) {
             var gr = new GlideRecord("u_policy2");
             if (gr.get(policyId)) {
                 var second = "";
                 if(!gr.u_record_producer.nil()) {
                     var linkText = PolicyInstanceHelper.hasYesSubmission(gr.getUniqueValue(), event.parm1) ? "View" : "Take",
                         link     = self.root_url + GlideappCatalogURLGenerator.getItemBaseURLFromGR(gr.u_record_producer.getRefRecord());
                         second   = self.tmpl(gs.getMessage('html.link_standard'), {value: linkText, link: link})
                 } 
                 template.print(self.tmpl(gs.getMessage("html.tr2cells_with_link"), {
                      first: gr.getDisplayValue(),
                      second: second,
                      style: self.cell_row_style
                 }));
             }
        })
        template.print(this.tmp_table_close);
    },
    _renderOpenTickets: function() {
        var gr = new GlideRecord("task");
            gr.addEncodedQuery("u_customer=" + event.parm1 + "^state!=3^state!=38^state!=60");
            gr.orderBy("sys_class_name");
            gr.orderByDesc("sys_created_on");
            gr.orderByDesc("sys_updated_on");
            gr.setLimit(this.show_limit);
            gr.query();
        template.print(this.tmp_table_open);
        template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
            value: "My Open Tickets",
            style: this.cell_across_style
        }));
        while(gr.next()) {
            template.print(this.tmpl(gs.getMessage("html.tr3cells_with_link"), {
               first:  gr.getDisplayValue(),
               second: gr.getClassDisplayValue(),
               third:  gr.short_description.toString(),
               link:  (this.root_url + gr.getLink()),
               style: this.cell_row_style
            }));
        }
        this._showViewMoreLink(gr);
        template.print(this.tmp_table_close);
    },
    _renderWatchedTickets: function() {
        var gr = new GlideRecord("task");
            gr.addEncodedQuery("watch_listLIKE" + event.parm1 + "^state!=3^state!=38^state!=60");
            gr.orderBy("sys_class_name");
            gr.orderByDesc("sys_created_on");
            gr.orderByDesc("sys_updated_on");
            gr.setLimit(this.show_limit);
            gr.query();
        template.print(this.tmp_table_open);
        template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
            value: "My Watched Tickets",
            style: this.cell_across_style
        }));
        while(gr.next()) {
            template.print(this.tmpl(gs.getMessage("html.tr3cells_with_link"), {
               first: gr.getDisplayValue(),
               second: gr.getClassDisplayValue(),
               third:  gr.short_description.toString(),
               link: (this.root_url + gr.getLink()),
               style: this.cell_row_style
            }));
        }
        this._showViewMoreLink(gr);
        template.print(this.tmp_table_close);                  
    },
    _renderAssets: function() {
         var gr = new GlideRecord("cmdb_ci");
             gr.addEncodedQuery("assigned_to=" + event.parm1 + "^ORowned_by=" + event.parm1 + "^install_statusNOT IN9");
             gr.setLimit(this.show_limit);
             gr.query();
         template.print(this.tmp_table_open);
         template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
            value: "My Assets",
            style: this.cell_across_style
         }));
         while(gr.next()) {
            template.print(this.tmpl(gs.getMessage("html.tr2cells_with_link"), {
               first: gr.getDisplayValue(),
               second: gr.model_id.getDisplayValue(),
               link: (this.root_url + gr.getLink()),
               style: this.cell_row_style
            }));
         }
         this._showViewMoreLink(gr);
         template.print(this.tmp_table_close);
    },
    _renderApprovals: function() {
         var gr = new GlideRecord("sysapproval_approver");
             gr.addEncodedQuery("approver="+event.parm1 + "^stateINrequested");
             gr.setLimit(this.show_limit);
             gr.orderByDesc("sys_created_on"); 
             gr.orderByDesc("sys_updated_on");
             gr.query();
         template.print(this.tmp_table_open);
         template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
            value: "My Approvals",
            style: this.cell_across_style
         }));
         while(gr.next()) {          
            template.print(this.tmpl(gs.getMessage("html.tr3cells_with_link"), {
               first: gr.sysapproval.getDisplayValue(),
               second: gr.sysapproval.short_description.toString(),
               third: this._getApprovalLinks(gr),
               link: (this.root_url + gr.getLink()),
               style: this.cell_row_style
            }));
         }
         this._showViewMoreLink(gr);
         template.print(this.tmp_table_close);           
    },
    _renderExtraLinks: function() {
        var msg_incident = 'Something broken or not working the way you expect ?',
            msg_request  = 'Wish to request something new or you need to do your job?',
            msg_project  = 'Wish to request a project?',
            msg_unsubscribe = 'Don`t want to receive this weekly digest anymore ?';
        template.print(this.tmp_table_open);        
        template.print(this.tmpl(gs.getMessage("html.tr2cells_with_link"),{first: msg_incident, second: this.tmpl(gs.getMessage('html.link_standard'), {value: 'Click Here', link: (this.root_url + this.rp_incident_url)})}));
        template.print(this.tmpl(gs.getMessage("html.tr2cells_with_link"),{first: msg_request, second: this.tmpl(gs.getMessage('html.link_standard'), {value: 'Click Here', link: (this.root_url + this.rp_request_url)})}));
        template.print(this.tmpl(gs.getMessage("html.tr2cells_with_link"),{first: msg_project, second: this.tmpl(gs.getMessage('html.link_standard'), {value: 'Click Here', link: (this.root_url + this.rp_project_url)})}));
        template.print(this.tmpl(gs.getMessage("html.tr2cells_with_link"),{first: msg_unsubscribe, second: this.tmpl(gs.getMessage('html.link_standard'), {value: 'Click here to unsubscribe', link: (this.root_url + this.unsubscribe_url)})}));
        template.print(this.tmp_table_close);
    },
    _showViewMoreLink: function(gr) {
         if(this._getCount(gr) > this.show_limit) {
            var linkText = "View All " + gr.getLabel() + " records"
            var link = this.root_url + gr.getRecordClassName() + '_list.do?sysparm_query='+gr.getEncodedQuery();
            template.print(this.tmpl(gs.getMessage("html.record_cell_across"), {
                 value:  this.tmpl(gs.getMessage('html.link_standard'), {value: linkText, link: link}), 
                 style:  this.view_all_style                
            }));
         }
    },
    _getCount: function(gr) {
        var answer = 0;
        var counter = new GlideAggregate(gr.getRecordClassName());
            counter.addAggregate('COUNT');
            counter.addEncodedQuery(gr.getEncodedQuery());
            counter.query();
        if (counter.next()) {
            answer = counter.getAggregate('COUNT');
        }
        return answer;
    },
    _getApprovalLinks: function(gApproval) {
         var answer = '', self = this;
         var gr = new GlideRecord("sys_email");
             gr.addQuery("instance", gApproval.getUniqueValue());
             gr.addQuery("mailbox","IN","sent,outbox");
             gr.orderBy("sys_created_on");    
             gr.query();
         if(gr.next()) {
            gr.body.toString().replace(/Ref:([^\<]+)/gm, function(all, p1){
               answer = self.tmpl(gs.getMessage('html.link_standard'), {value: 'Approve', link: (self.mailto + "subject="+ encodeURIComponent(("Re:"+ gApproval.sysapproval.getDisplayValue() + " - approve")) + "&amp;body=" + encodeURIComponent(all))}) + " | " + self.tmpl(gs.getMessage('html.link_standard'), {value: 'Reject', link: (self.mailto + "subject="+ encodeURIComponent(("Re:"+ gApproval.sysapproval.getDisplayValue() + " - reject")) + "&amp;body=" + encodeURIComponent(all))})   
                         
            })
         }
         return answer;
    },
    type: 'UserServiceNowDigest'
}



  
  /////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////
  /////////////////////////////////////////////////////////////////
  ///////////// ANOTHER ONE!!! LONG ONE!!! ////////////////////////
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  
  /////////////////////////////////////////////////////////////////  




(function runMailScript(current, template, email, email_action, event) {  
  
  //KEEP IN MIND THAT THE ROUNDED EDGED AND OTHER OPTIONS MAY NOT WORK CORRECTLY IN MICROSOFT OUTLOOK.  
  //KEEP IN MIND THAT THE ROUNDED EDGED AND OTHER OPTIONS MAY NOT WORK CORRECTLY IN MICROSOFT OUTLOOK.  
  
  
  //------------------------------------------------------------------------------------------------------------------------  
  //SET EMAIL THAT WILL BE SENT BACK TO YOUR SERVICE-NOW INSTANCE.  WHETHER A COMPANY DISTRUBUTION LIST THAT FWD'S TO  
  //SERVICE-NOW OR AN EMAIL THAT IS SENT DIRECTLY TO SERVICE-NOW.  ENTER THE EMAIL BETWEEN THE SINGLE ' ' QUOTES BELOW.  
  //------------------------------------------------------------------------------------------------------------------------  
  var setEmail = 'test@test.org';                        //<<<<------------  SET YOUR EMAIL  
  
  var type = "${sysapproval}"; //the number that shows in the button  ex.  current.number  "${sysapproval}"  
  // var type = current.number;  
  
  
  //set the wording of the View, Approval, and Reject Buttons  
  //DO NOT REMOVE THE TYPE FROM THE LINES.  
  var viewButton = "VIEW  >>>  " + type;  
  var approvalButton = "APPROVE .... " + type;  
  var rejectButton = "REJECT +++ " + type;  
  
  
  
  
  
  
  
  
  //SECTION 1 = VIEW TASK BUTTON  
  //**************************************************************************************************************************************************  
  //This section is for the "VIEW $tasknumber$ button     if you do not want the View Item button, comment out this section.  
  //**************************************************************************************************************************************************  
  
  //------------------------------------------------------------------------------------------------------------------------  
  //the View RITM number for approvals.  
  //------------------------------------------------------------------------------------------------------------------------  
  
  
  //If you want this button centered, use the next line and the template.print("</div>"); line at the end of this section.  
  //template.print('<div style="text-align: center;">');  
  
  
  //build the link for the RITM number  will take you directly to view the RITM of which they are being asked to approve  
  //additional scripting required to approve changes, or other tables  
  //using just the current.getLink()  takes you to the approval itself.  
  // var viewlink = 'sc_req_item.do?sys_id=' + current.document_id;        //current.getLink();  
  var viewlink = '';  
  var task = new GlideRecord('task');  
  task.addQuery('sys_id', current.document_id);  
  task.query();  
  if (task.next()) {  
  viewlink = task.getLink();  
  }  
  // viewlink = current.sysapproval.getLink();                   //used for testing purposes  
  
  
  var viewfontSize = 'font-size: 16px;';                          //size of the text in the buttons  
  var viewfontFamily = 'font-family: Helvetica, Arial, sans-serif;';  
  var viewtextDecoration = 'text-decoration: none;';              //text decorations could be none|underline|overline|line-through|initial|inherit;  
  var viewcorners = 'border-radius: 5px;';                        //the higher this number the rounder the corners will be  
  var viewpadding = 'padding: 0px;';                              //how much space around the outside of the letter in between the letters and the border  
  var viewborder = 'border: 10px solid blue;';                    //how thick do you want the border and what color?  
  var viewBGColor = 'background-color: blue;';                    //set the background (button) color for approval button  
  var viewTxTcolor = 'color: white;';                             //set the text color within the button.  
  
  template.print('<font face="helvetica">');  
  template.print('<a href="' + viewlink + '"');  
  template.print('style="' + viewBGColor + viewborder + viewTxTcolor + viewcorners + viewfontSize + viewfontFamily + viewpadding + viewtextDecoration);  
  template.print('">');  
  template.print(viewButton);                                     //Wording that is visible in the button.  
  template.print('</a>');  
  template.print('</font>');  
  //template.print('<br>');  
  //template.print('<br>');  
  //template.print('</div>');  
  
  //**************************************************************************************************************************************************  
  //END OF SECTION for the "VIEW $tasknumber$" button   END OF SECTION   END OF SECTION   END OF SECTION  
  //**************************************************************************************************************************************************  
  
  
  
  
  
  
  
  
  
  //SECTION 2 = APPROVAL BUTTON AND REJECT BUTTION  
  //**************************************************************************************************************************************************  
  //THIS IS THE SECTION FOR THE APPROVAL AND REJECTION "BUTTONS"  
  //**************************************************************************************************************************************************  
  
  
  // options for BOTH approval and Reject Buttons  
  var align = 'text-align: center';  
  var fontSize = 'font-size: 16px;';                             //size of the text in the buttons  OVERALL SIZE OF THE BUTTON  
  var fontFamily = 'font-family: Helvetica, Arial, sans-serif;';  
  var textDecoration = 'text-decoration: none;';                 //text decorations could be none|underline|overline|line-through|initial|inherit;  
  var corners = 'border-radius: 5px;';                           //the higher this number the rounder the corners will be  (DOES NOT WORK IN MICROSOFT OUTLOOK)  
  var webKitBorder = '-webkit-border-radius: 3px;';  
  var mozBorder = '-moz-border-radius: 3px;';  
  var display = 'display: inline-block;';  
  
  
  
  //http://www.rapidtables.com/web/html/mailto.htm    is a good example of how to build the links  
  //BULID THE LINK FOR THE APPROVAL MAILTO:  
  var applink = '<a href="mailto:' + setEmail + '?subject=Re:%20' + type + '%20-%20approve&body=%0A%0A---------------DO%20NOT%20EDIT%20OR%20DELETE%20ANYTHING%20BELOW%20HERE---------------%0A%0A' + type + '%0A'  + email.watermark  + '"';  
  
  //BULID THE LINK FOR THE REJECTION MAILTO:  
  var rejlink = '<a href="mailto:' + setEmail + '?subject=Re:%20' + type + '%20-%20reject&body=Rejection Notes:%20%0A%0A---------------DO%20NOT%20EDIT%20OR%20DELETE%20ANYTHING%20BELOW%20HERE---------------%0A' + type + '%0A%0A' + email.watermark  + '"';  
  
  
  //if you want the buttons centered,  use this line and the template.print("</div>"); line at the end of this section ,  otherwise they should be commented out.  
  template.print('<div style="text-align: center;">');  
  
  
  
  
  //------------------------------------------------------------------------------------------------------------------------  
  //APPROVAL LINK AND BUTTON OPTIONS  *******  APPROVAL LINK AND BUTTON OPTIONS  *******  APPROVAL LINK AND BUTTON OPTIONS  
  //------------------------------------------------------------------------------------------------------------------------  
  
  template.print('<font face="helvetica">');  
  var appBGColor = 'background-color: green;';                        //set the background (button) color for approval button  
  var appTxTcolor = 'color: white;';                                  //set the text color of the approval button  
  var apppadding = 'padding: 0px;';                                   //how much space around the outside of the letter in between the letters and the border needs to be 0 for Outlook  
  var appborder = 'border: 10px solid green;';                        //set the text color within the button.  //should be greater than 10 to look right in Outlook  
  
  template.print(applink);  
  template.print('style="' + appBGColor + appborder + appTxTcolor + fontSize + fontFamily + textDecoration + corners + webKitBorder + mozBorder + display + apppadding);  
  template.print('">');  
  template.print(approvalButton);                                    //Wording that is visible in the button.  
  template.print('</a>');  
  template.print('</font>');  
  
  
  
  
  
  //------------------------------------------------------------------------------------------------------------------------  
  //HOW MANY SPACES BETWEEN THE APPROVAL BUTTON AND THE REJECT BUTTON?  NONE FOR BUTTONS RIGHT NEXT TO EACH OTHER  
  //------------------------------------------------------------------------------------------------------------------------  
  template.print('<br>');  
  template.print('<br>');  
  // template.print('<br>');  
  // template.print('<br>');  
  
  
  
  
  
  //------------------------------------------------------------------------------------------------------------------------  
  //REJECT LINK AND BUTTON OPTIONS  *******  REJECT LINK AND BUTTON OPTIONS  *******  REJECT LINK AND BUTTON OPTIONS  
  //------------------------------------------------------------------------------------------------------------------------  
  
  template.print('<font face="helvetica">');  
  var rejBGColor = 'background-color: red;';                        //set the background (button) color for rejection button  
  var rejTxTcolor = 'color: white;';                                //set the text color within the button.  
  var rejpadding = 'padding: 0px;';                                 //how much space around the outside of the letter in between the letters and the border needs to be 0 for Outlook  
  var rejborder = 'border: 10px solid red;';                        //set the text color within the button.  //should be greater than 10 to look right in Outlook  
  
  template.print(rejlink);  
  template.print('style="' + rejBGColor + rejborder + rejTxTcolor + fontSize + fontFamily + textDecoration + corners + webKitBorder + mozBorder + display + rejpadding);  
  template.print('">');  
  template.print(rejectButton);                                     //Wording that is visible in the button.  the "type"  is called above being the RITM number  
  template.print('</a>');  
  template.print('</font>');  
  
  
  //End of the Center code.  Only use this if the line 29 is being used  
  template.print('</div>');  
  
  
  
  //------------------------------------------------------------------------------------------------------------------------  
  //ANY ADDITIONAL SPACES YOU MAY NEED AFTER THE REJECT BUTTON.  You can also use line breaks from another script if necessary  
  //------------------------------------------------------------------------------------------------------------------------  
  // template.print('<br>');  
  // template.print('<br>');  
  // template.print('<br>');  
  // template.print('<br>');  
  
})(current, template, email, email_action, event);  



////////////////////////
////////////////////////
// USED for handling event param //
////////////////////////

			sys_email.instance = inc.sys_id;
			sys_email.update();
			event.state="stop_processing";
			
			
************************************************************************************************************************************************************************************************************************************************************
			
			gs.include('validators');

if (current.getTableName() == "incident") {
	
	var gr = current;
	
	if (email.subject.toLowerCase().indexOf("please reopen") >= 0)
		gr = new Incident().reopen(gr, email) || gr;
	
	gr.comments = "reply from: " + email.origemail + "\n\n" + email.body_text;
	
	if (gs.hasRole("itil")) {
		if (email.body.assign != undefined)
			gr.assigned_to = email.body.assign;
		
		if (email.body.priority != undefined && isNumeric(email.body.priority))
			gr.priority = email.body.priority;
	}
	
	gr.update();
}
************************************************************************************************************************************************************************************************************************************************************



routeIt();

function routeIt(){
	var sysEmailRec = getMailRec(email.uid);
	if (sysEmailRec){
		var match = false;
		var pmRule = new GlideRecord("email_routing_rule");
		pmRule.addQuery("active", true);
		pmRule.orderBy("order");
		pmRule.query();
		while (pmRule.next() && !match) {
			if (checkCondition(sysEmailRec, pmRule.condition)){
				createRec(pmRule, sysEmailRec.sys_id.toString());
				match = true;
				event.state="stop_processing";
			}
			//If no matching rule, continue with other Inbound actions
		}
	}
}

//Get the sys_email record, based on email uid
function getMailRec(uid){
	var mail = new GlideRecord("sys_email");
	mail.addQuery("uid", uid);
	mail.query();
	if (mail.next()) {
		return mail;
	}
	else{
		gs.log('**** - No valid sys_email match found for incoming mail w/ uid ' + email.uid);
	}
	return;
}

//Check condition field for match
function checkCondition(gr, query) {
	return GlideFilter.checkRecord(gr,query);
}

//Create destination record
function createRec(rule, emailID){
	var newRec;
	//For service-catalog items, spawn proper REQ/RITM records and get appropriate record for template
	if (rule.destination_table == 'sc_request' || rule.destination_table == 'sc_req_item'){
		var cart = new Cart();
		cart.addItem(rule.catalog_item);
		newRec = cart.placeOrder();
		if (rule.destination_table == 'sc_req_item'){
			gs.sleep(3000); //Wait for the workflow to create the RITM
			var recSysId = newRec.sys_id.toString();
			newRec = new GlideRecord("sc_req_item");
			newRec.addQuery("request", recSysId);
			newRec.query();
			if (newRec.next()){}
			}
	}
	//For non-service-catalog items, spawn the appropriate record type
	else{
		newRec = new GlideRecord(rule.destination_table);
		newRec.initialize();
	}
	
	//Apply template to created record
	if (!rule.template.nil())
		newRec.applyTemplate(rule.template.name);
	
	//Eval to apply email body and short description to the appropriate fields
	eval("newRec." + rule.email_body_to + " = 'Received from: ' + email.origemail + ':  ' + email.body_text;");
	eval("newRec." + rule.email_subject_to + " = email.subject;");
	
	//Apply other table-specific settings
	if (rule.destination_table == 'incident')
		newRec.caller_id = gs.getUserID();
	
	//Apply script to record
	if (rule.apply_script == true){
		try{eval(rule.script);}
		catch(err){}
	}
	
	newRec.update();
	
	//Copy attachments from email to created record
	GlideSysAttachment.copy('sys_email', emailID, newRec.getTableName(), newRec.sys_id.toString());
}