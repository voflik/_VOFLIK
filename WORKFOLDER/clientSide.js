function onLoad() {
	
	this.window.g_form = g_form;
	
	if(!g_form.isNewRecord()){
		
		var retreave = 	g_form.getValue('impact');
		var retreave_date = g_form.getValue('requested_by_date');
		
		var template      = g_form.getValue('u_change_template');
		var change_number = g_form.getValue('number');
		var affected_ci   = g_form.getValue('cmdb_ci');
		
		//get value from ci
		var impactLoad;
		var max = 103;
		
		var zerodiff = 101;
		var table = ['Minor', 'Significant', 'Major'];
		
		
		
		var ga = new GlideAjax('ChangeRequestClientCalls');
		ga.addParam('sysparm_name', 'GetImpactType');
		
		ga.addParam('sysparm_number', change_number);
		ga.addParam('sysparm_template', template);
		ga.addParam('sysparm_affected_ci', affected_ci);
		
		ga.getXML(setV);
		
		function setV(response){
			var answer = response.responseXML.documentElement.getAttribute("answer");
			var array  = JSON.parse(answer);
			impactLoad = array.impact;
			
			g_form.clearOptions('impact');
			if(impactLoad != ''){
				g_form.clearOptions('impact');
				for(var i = impactLoad; i <= max; i++){
					g_form.addOption('impact', i, table[i-zerodiff]);
					console.log('-----', impactLoad, i, table[i-zerodiff]);
				}
			}else{
				g_form.clearOptions('impact');
				g_form.addOption('impact', '', '-- None --');
				for(var j = zerodiff; j <= max; j++){
					g_form.addOption('impact', j, table[j-zerodiff]);
				}
			}	
			g_form.setValue('impact', retreave, table[retreave-zerodiff]);
			g_form.setValue('requested_by_date', retreave_date);
		}
	}
}




******************************************************************************************************************
VARIABLES in CATALOG:

var g_cat_form = null;
function onLoad() {
  var cat = g_form.getValue('category');
  if (cat != 'Server Reboot' && cat != 'Database Restore' && cat != 'DNS Change')
     return;

  var map = gel('variable_map');
  var cat_form = new ServiceCatalogForm('ni', true, true);

  var items = map.getElementsByTagName("item");
  for (var i = 0; i < items.length; i++) {
  	var item = items.item(i); 
	var name = item.getAttribute('qname');
	var id = item.id;
        var nm = new NameMapEntry(name, "ni.QS" + id);
        cat_form.addNameMapEntry(nm);
  } 
  
  var reason = cat_form.getControl('reason');
  if (!reason)
    return;

  var reason_detail = cat_form.getControl('reason_details');
  if (!reason_detail)
    return;

  g_cat_form = cat_form;
  setReasonVisibility(null, reason);
  var els = document.getElementsByName(reason.name);
  for (var i = 0; i < els.length; i++)
    els[i].onclick = setReasonVisibility.bindAsEventListener(els[i]);
 

}

function setReasonVisibility(e, target) {
   jslog('setReasonVisibility');
   if (!e)
      e = window.event;
	
   if (!target)    
      target = e.target ? e.target : e.srcElement;
   
   var vis = false;
   if (target.value == 'other')
     vis = true;
   
   g_cat_form.setDisplay('reason_details', vis);
}
******************************************************************************************************************
REFRESHING LISTS :
try {
      var elementLookup = $$('div.tabs2_list');
      var listName = "Affected CIs";
      for (i = 0; i != elementLookup.length; i++) {
         if (elementLookup[i].innerHTML.indexOf(listName) != -1) {
            var listHTML = elementLookup[i].id.split('_');
            var listID = listHTML[0];
            nowRefresh(listID);
         }
      }
}
catch (err) {
   //alert(err.message);
}

function nowRefresh(id) {
   GlideList2.get(id).refresh('');
}

RELATED LIST:

function refreshAffectedCIs(){
   GlideList2.get(g_form.getTableName() + '.task_ci.task').setFilterAndRefresh('');   
}

REFRESH RELATED LIST:
GlideList2.get(g_form.getTableName() + '.YOUR_RELATED_LIST_NAME_HERE').setFilterAndRefresh('');

******************************************************************************************************************
EVENT:

Event
The Event class is an undocumented API provided by ServiceNow on the client side, which effectively acts as a layer between our code, and direct control of the Document Object Model (DOM) in some ways. Probably the method you're most likely to use, is .observe(). The observe method takes as input, 3 arguments: 

An HTML element control for a field (which you can get using g_form.getControl(); as seen below)
A string containing an event name. 
From digging into the guts of this class, it seems to implement EventTarget.addEventListener(). For this reason, any event name that is listed in the addEventListener documentation should be supported here. 
A callback function to execute when that event is observed.

function onLoad() {
    var control = g_form.getControl('description');
    Event.observe(control, 'mouseover', function() {
        g_form.addInfoMessage('Your mouse is over the Description field.');
    });
    Event.observe(control, 'mouseout', function() {
        g_form.clearMessages();
    });
    Event.observe(control, 'mousedown', function() {
        g_form.addInfoMessage('You have clicked the description field.');
    });
    Event.observe(control, 'mouseup', function() {
        g_form.clearMessages();
    });
}
The event class also contains methods like .stopObserve(), which ends the current Event.observe on a given HTML object/control. It might be helpful to instantiate this class first. It's also got functions to check what sort of click, for instances where you might observe for the 'click' event: isLeftClick(), isMiddleClick(), and isRightClick(). 

******************************************************************************************************************
ECMA Add element (style) :

    var msViewportStyle = document.createElement("style");
    msViewportStyle.appendChild(document.createTextNode("@-ms-viewport{width:auto!important}"));
    msViewportStyle.appendChild(document.createTextNode("@-ms-viewport{height:auto!important}"));
    document.getElementsByTagName("head")[0].appendChild(msViewportStyle);



******************************************************************************************************************
ANIMATION with ONLOAD :

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (function() {
   return window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function( callback, element ) {
     window.setTimeout( callback, 1000 / 60 );
    };
  })();
}

onload = function ()
{
    // Canvas
    var c = document.createElement('canvas');
    document.body.appendChild(c);
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.backgroundColor = "#111";
    var cc = c.getContext("2d");
    
    c.width = innerWidth;
    c.height = innerHeight;

    var maxRadius = 40;

    var colors = [
        "#225378",
        "#1695A3",
        "#ACF0F2",
        "#F3FFE2",
        "#EB7F00"
    ]

    var mouse = { x: undefined, y: undefined }; 
    
    addEventListener('touchmove', mousePos);
    addEventListener('touchstart', mousePos);
    
    function mousePos (e) {
        e.preventDefault();
        var e = window.event;
    
        mouse.x = e.touches[0].pageX;
        mouse.y = e.touches[0].pageY;
    }

    addEventListener("resize", function(e){
        c.width = innerWidth;
        c.height = innerHeight;
        init();
    })

    function Circle (x, y, dx, dy, radius) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.radius = radius;
        this.minRadius = radius;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.draw = function () {
            cc.beginPath();
            cc.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            cc.fillStyle = this.color;
            cc.fill();
        }

        this.update = function () {
            this.x += this.dx;
            this.y += this.dy;
            if (this.x > innerWidth - this.radius || this.x < this.radius) this.dx = -this.dx;
            if (this.y > innerHeight - this.radius || this.y < this.radius) this.dy = -this.dy;

            // interactivity
            if (mouse.x - this.x < 50 && mouse.x - this.x > -50 &&
                mouse.y - this.y < 50 && mouse.y - this.y > -50) {
                if (this.radius < maxRadius) {
                    this.radius += 4;
                }
            } else {
                if (this.radius > this.minRadius) {
                    this.radius -= 1;
                }
            }

            this.draw();
        }
    }

    var circleArray = [];
    init();

    function init () {
        circleArray = [];
        for (var i = 0; i < 500; i++) {
            var radius = Math.random() * 3 + 1;
            var x = Math.random() * (innerWidth - radius * 2) + radius;
            var y = Math.random() * (innerHeight - radius * 2) + radius;
            var dx = (Math.random() - 0.5);
            var dy = (Math.random() - 0.5);
            circleArray.push(new Circle(x, y, dx, dy, radius));
        }
    }

    function animate () {
        requestAnimationFrame(animate);
        cc.clearRect(0, 0, innerWidth, innerHeight);
        for (var i = 0; i < circleArray.length; i++) {
            circleArray[i].update();
        }
    }

    animate();

}
******************************************************************************************************************
HIDE / SHOW ELEMENT jQuery:

	$$('button[data-action-name^=state_model]').each(function(e) {
		if (newValue === 'true')
			e.hide();
		else
			e.show();
	});

******************************************************************************************************************
LIFE FEED MENTION NOTIFICATIONS:
function shouldSend() {
	var liveGroupProfileGR = new GlideRecord("live_group_profile");
	liveGroupProfileGR.setWorkflow(false);
	liveGroupProfileGR.addQuery("document", current.document);
	liveGroupProfileGR.addQuery("table", current.table);
	liveGroupProfileGR.addQuery("type", "!=", "support");
	liveGroupProfileGR.query();

	if(liveGroupProfileGR.next()) {
		var liveGroupMemberGR = new GlideRecord("live_group_member");
		liveGroupMemberGR.setWorkflow(false);
		liveGroupMemberGR.addQuery("group", liveGroupProfileGR.getUniqueValue());
		liveGroupMemberGR.addQuery("member", current.profile);
		liveGroupMemberGR.addQuery("state", "!=", "inactive");
		liveGroupMemberGR.query();

		if(liveGroupMemberGR.next()) {
			return false;
		}
	}

	var SecurityManager = new SNC.LiveFeedSecurityManager();
	return SecurityManager.canReadField(current.user, current.table, current.document, current.field_name);
}

answer = shouldSend();


RELY to link:

var msgUtil = new LiveMsgUtil(current); 

//get links
if (current.has_links) {
    template.print("<br />"); //blank line
    template.print("Links:<br />");
    var links = msgUtil.getLinks();
    for (var i = 0; i < links.length; i++) {
        var url = links[i].url;
        var text = links[i].text;
        var htmlLink = '<a href="' + url + '">' + text + '</a>';
        template.print(htmlLink);
        template.print("<br />");
    }
}

if (!current.reply_to.nil()) {
   template.print("<br />... to message:<br />");
   var replyToMsg = msgUtil.getReplyToMsgWithName();   
   template.print(replyToMsg);
   template.print("<br />");
}

if (!current.in_reply_to.nil()) {
    template.print("<br />");
    template.print("... in the thread:<br />");
    var baseMsg = msgUtil.getBaseMsgWithName();
    template.print(baseMsg);
}
******************************************************************************************************************
LIST :
tblName = g_list.getTableName();
    selSysIds = g_list.getChecked();
    sysIdList = selSysIds.split(',');
    numSel = sysIdList.length;
   
    if(numSel > 0) {
        indx = 0;
        ajaxHelper = new GlideAjax('DeleteRecordAjax');
        getCascadeDeleteTables();
    }
******************************************************************************************************************
refreshAffectedServices();  
  
function refreshAffectedServices(){  
  var listId = g_form.getTableName() + '.task_cmdb_ci_service.task'; //Replace with the ID of your list  
  if(typeof $(listId) != "undefined") {  
     GlideList2.get(listId).setFilterAndRefresh('');  
  }  
} 


var href = String(window.location.href);  
if (href.indexOf("_list.do") > -1 && href.indexOf("sysparm_view=incident_owner") > -1) {  
  jQuery(document).ready(function(){  
  $$('div.list2_cell_background').forEach(function(elmt){  
  var row = $(elmt).up(1);  
  var cells = row.childElements();  
  cells.forEach(function(cell) {  
  if (cell.style.backgroundColor == "") {  
  cell.style.backgroundColor = elmt.style.backgroundColor;  
  elmt.style.display = "none";  
  }  
  });  
  });  
  });  
} 

******************************************************************************************************************
Import template preview :
HTML (Jelly) :

<?xml version="1.0" encoding="utf-8" ?>
 <j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
 
  <g:evaluate jelly="true">
         if (jelly.sysparm_info_message)
                 gs.addInfoMessage(jelly.sysparm_info_message);
  </g:evaluate>
 
  <g:evaluate var="jvar_import_table_name" jelly="true">
     var gr = new GlideRecord("sys_import_set");
     gr.addQuery("sys_id", jelly.sysparm_import_set_id);
     gr.query();

     var import_table_name = "";
     if (gr.next())
       import_table_name = gr.table_name;
     import_table_name;
   </g:evaluate>

   <g:evaluate var="jvar_number_of_error_rows" jelly="true">
     var gr = new GlideRecordSecure(jelly.jvar_import_table_name);
     gr.addQuery("sys_import_set", jelly.sysparm_import_set_id);
     gr.addNotNullQuery("template_import_log");
     gr.query();
     gr.getRowCount();
   </g:evaluate>

   <g:evaluate var="jvar_are_errors" jelly="true">
     jelly.jvar_number_of_error_rows > 0;
   </g:evaluate>

   <g:evaluate var="jvar_displaying_error_rows" jelly="true">
     var displaying_error_rows = false;
     if (typeof jelly.sysparm_list_view !== "undefined") {
       if (jelly.sysparm_list_view == "errors")
         displaying_error_rows = true;
     } else {
       if (jelly.jvar_are_errors == "true")
         displaying_error_rows = true;
     }

     displaying_error_rows;
   </g:evaluate>

   <g:evaluate var="jvar_enable_show_all_button" jelly="true">
     jelly.jvar_displaying_error_rows;
   </g:evaluate>

   <g:evaluate var="jvar_enable_show_errors_button" jelly="true">
     (jelly.jvar_displaying_error_rows == "false") &amp;&amp; (jelly.jvar_are_errors == "true");
   </g:evaluate>

   <g:evaluate var="jvar_list_query" jelly="true">
     var queryGen = new GlideCollectionQueryCalculator();
     var list_query = queryGen.buildQueryClause(jelly.sysparm_import_set_id, "sys_import_set");
     list_query += "^ORDERBYsys_import_row";
     list_query;
   </g:evaluate>

   <g:evaluate var="jvar_list_errors_query" jelly="true">
     var queryGen = new GlideCollectionQueryCalculator();
     var list_query = queryGen.buildQueryClause(jelly.sysparm_import_set_id, "sys_import_set");
     list_query += "^template_import_logISNOTEMPTY^ORDERBYsys_import_row";
     list_query;
   </g:evaluate>
 
   <g:evaluate var="jvar_list_query_selected" jelly="true">
     var list_query_selected = jelly.jvar_list_query;
     if (jelly.jvar_displaying_error_rows == "true")
       list_query_selected = jelly.jvar_list_errors_query;
     if (typeof jelly.sysparm_list_query !== "undefined")
       list_query_selected = jelly.sysparm_list_query;
     list_query_selected;
   </g:evaluate>
 
   <g:evaluate var="jvar_query" jelly="true">
     var currentTime = gs.nowNoTZ(); // datetime queries should be in UTC format
     var currentUser = gs.getUserName();
     if (jelly.sysparm_template_type == "update")
       var query = "sys_updated_on>=" + currentTime + "^sys_updated_by=" + currentUser;
     else
       var query = "sys_created_on>=" + currentTime + "^sys_created_by=" + currentUser;
     query;
   </g:evaluate>
 
	<!-- information text -->
	<j:if test="${jvar_are_errors == 'true'}">
	    <g:evaluate jelly="true">
	    	var message = gs.getMessage(' row(s) with errors in import set!');
	        gs.addErrorMessage(jelly.jvar_number_of_error_rows + message);
	    </g:evaluate>
	    <g:evaluate jelly="true">
	        gs.addInfoMessage(gs.getMessage("Click 'Show All Rows' to see all rows in your import set."));
	    </g:evaluate>
	    <g:evaluate jelly="true">
	        gs.addInfoMessage(gs.getMessage('Ignore Row Errors Description'));
	    </g:evaluate>
	</j:if>
	
	<j:if test="${jvar_are_errors == 'false'}">
	    <g:evaluate jelly="true">
	        gs.addInfoMessage('Import Template Preview Description'));
	    </g:evaluate>
	    <g:evaluate jelly="true">
	        gs.addInfoMessage(gs.getMessage('Complete Import Description'));
	    </g:evaluate>
	</j:if>
	<g:evaluate jelly="true">
	    gs.addInfoMessage(gs.getMessage("Click Back to start over or select a different file to import."));
	</g:evaluate>
   <!-- preview list -->
   <g:call function="import_template_preview_list.xml" table="${jvar_import_table_name}" list_query="${jvar_list_query_selected}"/>
   <!-- emit g_user support -->
   <g2:client_script type="user" />
 
<br/>
   <div style="float:left"><button onclick="back()" id="back_button" type="submit">${gs.getMessage('Back')}</button></div>
 
   <j:if test="${jvar_enable_show_all_button}">
     <div style="float:left"><button onclick="showAllRows()" id="back_button" type="submit">${gs.getMessage('Show All Rows')}</button></div>
   </j:if>
 
   <j:if test="${jvar_enable_show_errors_button}">
     <div style="float:left"><button onclick="showErrorRows()" id="back_button" type="submit">${gs.getMessage('Show Error Rows')} (${jvar_number_of_error_rows})</button></div>
   </j:if>
 
   <form name="import_template_preview" id="import_template_preview" action="sys_import_template.do" method="post" >
     <input type="hidden" name="sysparm_referring_url" value="${sysparm_referring_url}" />
     <input type="hidden" name="sysparm_target" value="${sysparm_target}" />
     <input type="hidden" name="sysparm_process_stage" value="transform" />
     <input type="hidden" name="sysparm_import_set_id" value="${sysparm_import_set_id}" />
     <input type="hidden" name="sysparm_template_type" value="${sysparm_template_type}" />
     <input type="hidden" name="sysparm_query" value="${jvar_query}" />
 
     <j:choose>
       <!-- Submit button with row errors -->
       <j:when test="${jvar_are_errors == 'true'}">
         <div style="float:left">
           <button onclick="loadingText(true)" id="import_button" type="submit">${gs.getMessage('Ignore Row Errors and Complete Import')}</button>
           <span id="loading" style="display: none">     
             <image src="images/loading_anim2.gifx" /><strong id="import_button_text">${gs.getMessage('Completing import')} ...</strong>
           </span>         
         </div>
       </j:when>
       <!-- Submit button with no row errors -->
       <j:otherwise>
         <div style="float:left">
           <button onclick="loadingText(true)" id="import_button" type="submit">${gs.getMessage('Complete Import')}</button>
           <span id="loading" style="display: none">     
             <image src="images/loading_anim2.gifx" /><strong id="import_button_text">${gs.getMessage('Completing import')} ...</strong>
           </span>         
         </div>
       </j:otherwise>
     </j:choose>
   </form>
 </j:jelly>
 
 JS frontend :
 
 Event.observe(window, "load", function() {
     onLoad();
 });
 
function onLoad() {
	moveOutMessageDivToPos1();
	disableBreadcrumbFilterLinks();	
}
 
//a output_messages div added on top of nav bar by default.Take the
//content and add to one below navbar on page load.
function moveOutMessageDivToPos1() {
	if($$("#output_messages")) {
		if($$("#output_messages").length == 2) {
			$$("#output_messages")[1].replace($$("#output_messages")[0]);
		}
	}
}
 
 function disableBreadcrumbFilterLinks() {
     $$('.list_filter_toggle')[0].removeAttribute('class');
     $$(".breadcrumb_link:contains('All')")[0].removeAttribute('class');
 }
 
 function back() {
     var url = new GlideURL('import_template_upload.do');
     url.addParam('sysparm_referring_url', '$[sysparm_referring_url]');
     url.addParam('sysparm_target', '$[sysparm_target]');
     window.location = url.getURL();
 }
 
 function showAllRows() {
     var url = new GlideURL('import_template_preview.do');
     url.addParam('sysparm_referring_url', '$[sysparm_referring_url]');
     url.addParam('sysparm_target', '$[sysparm_target]');
     url.addParam('sysparm_process_stage', 'transform');
     url.addParam('sysparm_import_set_id', '$[sysparm_import_set_id]');
     url.addParam('sysparm_list_query', buildListQuery(false));
     url.addParam('sysparm_list_view', "all");
     url.addParam('sysparm_template_type', '$[sysparm_template_type]');
     window.location = url.getURL();
 }
 
 function showErrorRows() {
     var url = new GlideURL('import_template_preview.do');
     url.addParam('sysparm_referring_url', '$[sysparm_referring_url]');
     url.addParam('sysparm_target', '$[sysparm_target]');
     url.addParam('sysparm_process_stage', 'transform');
     url.addParam('sysparm_import_set_id', '$[sysparm_import_set_id]');
     url.addParam('sysparm_list_query', buildListQuery(true));
     url.addParam('sysparm_list_view', "errors");
     url.addParam('sysparm_template_type', '$[sysparm_template_type]');
     window.location = url.getURL();
 }
 
 function buildListQuery(isErrorQuery) {
     var query = "sys_import_set=" + '$[sysparm_import_set_id]';
     if (isErrorQuery)
         query += "^template_import_logISNOTEMPTY";
     query += "^ORDERBYsys_import_row";
     return query;
 }
 
 function loadingText(show) {
     var b = gel('import_button');
     var t = gel('loading');
     if (show) {
         b.style.display = "none";
         t.style.display = "";
     } else {
         b.style.display = "";
         t.style.display = "none";
     }
 }
 
******************************************************************************************************************
var ScrumReleaseImportGroupDialog = Class.create();

ScrumReleaseImportGroupDialog.prototype = {

   initialize: function () {
      this.setUpFacade();
   },
   
   setUpFacade: function () {
      var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
      this._mstrDlg = new dialogClass("task_window");
      //GlideDialogWindow.prototype.initialize.call(this, "task_window", false);
      this._mstrDlg.setTitle(getMessage("Add Members From Group"));
      this._mstrDlg.setBody(this.getMarkUp(), false, false);
   },

   setUpEvents: function () {
      var self = this, dialog = this._mstrDlg;
      var okButton = $("ok");
      if (okButton) {
         okButton.on("click", function () {
         var mapData = {};
         if (self.fillDataMap (mapData)) {
            var processor = new GlideAjax("ScrumAjaxAddReleaseTeamMembersProcessor");
            for (var strKey in mapData) {
               processor.addParam(strKey, mapData[strKey]);
            }
            self.showStatus(getMessage("Adding group users..."));
            processor.getXML(function () {
               self.refresh();
               dialog.destroy();
            });
         } else {
            dialog.destroy();
         }
      });
      }

      var cancelButton = $("cancel");
      if (cancelButton) {
      cancelButton.on("click", function () {
         dialog.destroy();
      });
      }

      var okNGButton = $("okNG");
      if (okNGButton) {
      okNGButton.on("click", function () {
         dialog.destroy();
      });
      }

      var cancelNGButton = $("cancelNG");
      if (cancelNGButton) {
      cancelNGButton.on("click", function () {
         dialog.destroy();
      });
      }
   },

   refresh: function(){
      GlideList2.get("scrum_pp_team.scrum_pp_release_team_member.team").refresh();
   },

   getScrumReleaseTeamSysId: function () {
      return g_form.getUniqueValue() + "";
   },

   getUserChosenGroupSysIds: function () {
      // Comma delimited list of selected option values (i.e. group sys_ids)
      return $F('groupId') + ""; 
   },

   showStatus: function (strMessage) {
      $("task_controls").update(strMessage);
   },
   
   display: function(bIsVisible) {
      $("task_window").style.visibility = (bIsVisible ? "visible" : "hidden");
   },

  getRoleIds: function () {
      var arrRoleNames = ["scrum_user", "scrum_admin", "scrum_release_planner", "scrum_sprint_planner", "scrum_story_creator"];
      var arrRoleIds = [];
      var record = new GlideRecord ("sys_user_role");
      record.addQuery ("name", "IN", arrRoleNames.join (","));
      record.query ();
      while (record.next ())
         arrRoleIds.push (record.sys_id + "");
      return arrRoleIds;
  },

  hasScrumRole: function (roleSysId, arrScrumRoleSysIds) {
     // Case1: the passed in role is scrum role
     for (var index = 0; index < arrScrumRoleSysIds.length; ++index)
        if (arrScrumRoleSysIds[index] == "" + roleSysId)
           return true;
  
     // Case2: examine all roles contained within the passed in role to see if any of them are scrum roles
     var record = new GlideRecord ("sys_user_role_contains");
     record.addQuery("role", roleSysId);
     record.query ();
     while (record.next())
       if (this.hasScrumRole (record.contains, arrScrumRoleSysIds))
         return true;

     // Case3: the role is not a scrum role nor does it contain any scrum roles
     return false;
  },

  getGroupIds: function () {  
     var arrScrumRoleIds = this.getRoleIds ();
     var arrGroupIds = [];
     var record = new GlideRecord ("sys_group_has_role");
     record.query ();
     while (record.next ())
        if (this.hasScrumRole (record.role, arrScrumRoleIds))
           arrGroupIds.push (record.group + "");
     return arrGroupIds;
   },
   
   getGroupInfo: function () {
      var mapGroupInfo = {};
      var arrRoleIds = this.getRoleIds ();
      var arrGroupIds = this.getGroupIds (arrRoleIds);
      var record = new GlideRecord ("sys_user_group");
      record.addQuery("sys_id", "IN", arrGroupIds.join (","));
      record.query ();
      while (record.next ()) {
         var strName = record.name + "";
         var strSysId = record.sys_id + "";
         mapGroupInfo [strName] = {name: strName, sysid: strSysId};
      }
      return mapGroupInfo;
   },

   getMarkUp: function () {
      var groupAjax = new GlideAjax('ScrumUserGroupsAjax');
      groupAjax.addParam('sysparm_name', 'getGroupInfo');
      groupAjax.getXML(this.generateMarkUp.bind(this));
   },

   generateMarkUp: function(response) {
      var mapGroupInfo = {};
      var groupData = response.responseXML.getElementsByTagName("group");
	   var strName, strSysId;
      for (var i = 0; i < groupData.length; i++) {
        strName = groupData[i].getAttribute("name");
        strSysId = groupData[i].getAttribute("sysid");
        mapGroupInfo[strName] = {
          name: strName,
          sysid: strSysId
        };
      }

      // (1) Generate a sorted list of group names
      var arrGroupNames = [];
      for (var strGroupName in mapGroupInfo) {
        arrGroupNames.push (strGroupName + "");
      }
      arrGroupNames.sort ();

      // (2) Generate the mark-up for the group choices
      var strMarkUp = "";
      if (arrGroupNames.length > 0) {
         var strTable = "<div class='row'><div class='form-group'><span class='col-sm-12'><select class='form-control' id='groupId'>";
         for (var nSlot = 0; nSlot < arrGroupNames.length; ++nSlot) {
            strName = arrGroupNames[nSlot];
            strSysId = mapGroupInfo [strName].sysid;
            strTable += "<option value='" + strSysId + "'>" + strName + "</option>";
         }
         strTable += "</select></span></div></div>";
      
      // (3) Generate the mark-up for the whole page
      strMarkUp = "<div id='task_controls'>" + strTable + 
                    "<div style='text-align:right;padding-top:20px;'>" +
                      "<button id='cancel' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
                      "&nbsp;&nbsp;<button id='ok' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
                      "</div></div>";
      } else {
         strMarkUp = "<div id='task_controls'><p>No groups with scrum_user role found</p>" + 
                        "<div style='text-align: right;padding-top:20px;'>" +
                         "<button id='cancelNG' class='btn btn-default' type='button'>" + getMessage("Cancel") + "</button>"+
                         "&nbsp;&nbsp;<button id='okNG' class='btn btn-primary' type='button'>" + getMessage("OK") + "</button>" +
                         "</div></div>";
      }

      this._mstrDlg.setBody(strMarkUp, false, false);
      this.setUpEvents();
      this.display(true);
      //this.setWidth(180);
   },

   fillDataMap: function (mapData) {
      var strChosenGroupSysId = this.getUserChosenGroupSysIds ();
      if (strChosenGroupSysId) {
         mapData.sysparm_name = "createReleaseTeamMembers";
         mapData.sysparm_sys_id = this.getScrumReleaseTeamSysId ();
         mapData.sysparm_groups = strChosenGroupSysId;
         return true;
      } else {
         return false;
      }
   }
};
******************************************************************************************************************
UI SCRIPT : 
function AddMessagetoFields(fields, message, toReplace){
	if(fields[0].length == 2 && toReplace){
		fields.forEach(function (element){
			var msg = message.replace(toReplace, element[1]);
			g_form.showFieldMsg(element[0], msg, 'info', false);
		});
	}
	/*else{
		//Other possible feature :) ?
	}*/
}

function changeFreeze(){
	
	top.window.askQuestion = false;
	g_form.hideErrorBox('business_service');
	
	if(g_form.getValue('type') == 'Emergency'){
		return 0;
	}
	
	if(g_form.getValue('parent') != ''){
		var ga = new GlideAjax('ChangeFreezeUtils');
		ga.addParam('sysparm_name','isParentDevOps');
		ga.addParam('sysparm_change', g_form.getUniqueValue());
		ga.getXML(devopsCallback);
	}else{
		actualChangeFreeze();
	}
	
	function devopsCallback(response){
		var answer = response.responseXML.documentElement.getAttribute("answer");
		if(answer != 'true'){
			actualChangeFreeze();
		}
	}
	
	function actualChangeFreeze(){
		g_form.addInfoMessage('test');
		var business_service = g_form.getValue('business_service');
		var ga = new GlideAjax('ChangeFreezeUtils');
		ga.addParam('sysparm_name','getFreezeInformations');
		ga.addParam('sysparm_requestedByDate', g_form.getValue('requested_by_date'));
		ga.addParam('sysparm_startDate', g_form.getValue('start_date'));
		ga.addParam('sysparm_businessService', business_service);
		ga.getXML(callback_Freeze);
		
		function callback_Freeze(response){
			var answer = JSON.parse(response.responseXML.documentElement.getAttribute("answer"));
			console.log(answer);
			
			if(answer.ReqDateInFreeze && business_service == ''){
				g_form.hideErrorBox('business_service');
				g_form.showErrorBox('business_service', 'Note: Your Requested by date falls within the Holiday Season Production Change Freeze. Selecting a Business Service is mandatory.');
			}
			
			if(!answer.ReqDateInFreeze && answer.StartDateInFreeze && business_service == ''){
				g_form.hideErrorBox('business_service');
				g_form.showErrorBox('business_service', 'Note: Your Planned Start date falls within the Holiday Season Production Change Freeze. Selecting a Business Service is mandatory.');
			}
			
			if(answer.mandatoryBusinessService){
				g_form.setValue('u_service_impact', true);
				top.window.askQuestion = answer.BussServiceInFreeze != "";
			}else{
				var template      = g_form.getValue('u_change_template');
				var affected_ci   = g_form.getValue('cmdb_ci');
				if(affected_ci != ''){
					var ga2 = new GlideAjax('ChangeRequestClientCalls');
					ga2.addParam('sysparm_name', 'GetImpactType');
					ga2.addParam('sysparm_number', 	g_form.getUniqueValue());
					ga2.addParam('sysparm_template', template);
					ga2.addParam('sysparm_affected_ci', affected_ci);
					ga2.getXML(setV);
				}else{
					g_form.setValue('u_service_impact', false);
				}
			}
		}
		
		function setV(response){
			var answer = response.responseXML.documentElement.getAttribute("answer");
			var array  = JSON.parse(answer);
			g_form.setValue('u_service_impact', array['u_service_impact']);
		}
	}
}

******************************************************************************************************************
UI SCRIPT:
function SetValuesFromID(sys_id, table_name, tableField){
	
	var ga = new GlideAjax('HGC_tableUtils');
	ga.addParam("sysparm_name", "GetFieldsNameFromTable");
	ga.addParam('sysparam_sys_id', sys_id);
	ga.addParam('sysparm_table_name',table_name);
	
	ga.getXMLAnswer(function(response){
		console.log("rep");
		console.log(response);
		mySetValues(JSON.parse(response), tableField);
	});
	
	function mySetValues(fieldAndValue, tableField){
		var TABLEFIELDNAME = 0;
		var RECORDFIELDNAME = 1;
		
		tableField.forEach(function(fieldName){
			if(fieldName){
				RECORDFIELDNAME = (fieldName.length > 1) ? 1 : 0;
				fieldAndValue[fieldName[TABLEFIELDNAME]] = fieldAndValue[fieldName[TABLEFIELDNAME]] || '';
				g_form.setValue(fieldName[RECORDFIELDNAME], fieldAndValue[fieldName[TABLEFIELDNAME]]);
				
			}
		});
	}
}

function SetValuesFromIDv2(sys_id, table_name, tableField){
	var ga = new GlideAjax('HGC_tableUtils');
	ga.addParam("sysparm_name", "GetFieldsNameFromTable");
	ga.addParam('sysparam_sys_id', sys_id);
	ga.addParam('sysparm_table_name',table_name);
	
	ga.getXMLAnswer(function(response){
		var obj = JSON.parse(response);
		console.log(obj);
		var setRO = obj['u_empty_template'] != 1;
		mySetValues(obj, tableField);
		
		g_form.setReadOnly('u_change_category', setRO);
		g_form.setReadOnly('u_change_subcategory', setRO);
		if(top.SavedInfo && top.SavedInfo != '' && top.SavedInfo != '<p><p>' && g_form.getValue('state') != '-5')
		bringBackInfos();
	});
	
	function bringBackInfos(){
		var str = '<p>&nbsp;</p><p><span style="color: #ff0000;"><strong>*PLEASE NOTE: The information below is copied from a template that was previously selected*</strong></span></p><p>&nbsp;</p>';
		g_form.setValue('u_description', g_form.getValue('u_description') + str + top.SavedInfo);
	}
	
	function mySetValues(fieldAndValue, tableField){
		var TABLEFIELDNAME = 0;
		var RECORDFIELDNAME = 1;
		
		tableField.forEach(function(fieldName){
			
			console.log(fieldName);
			
			
			if(fieldName){
				RECORDFIELDNAME = (fieldName.length > 1) ? 1 : 0;
				fieldAndValue[fieldName[TABLEFIELDNAME]] = fieldAndValue[fieldName[TABLEFIELDNAME]] || '';
				g_form.setValue(fieldName[RECORDFIELDNAME], fieldAndValue[fieldName[TABLEFIELDNAME]]);
			}
		});
	}
}

******************************************************************************************************************
UI SCRIPT BUTTON (TO ITSS) : 
jQuery(document).ready(function(){
	//Check if the page is loaded.
	var bannerelement = getTopWindow().document.querySelector(".nav.navbar-right"); //Acquire the element by class, hence the ".", with the update set picker and the other stuff.
	//console.log("The Page Loaded Succesfully.");//Delete me later!
	var buttonelement = getTopWindow().document.querySelector("#itssbuttonlink"); //Acquire the element by id, hence the "#", of the button created so the if/else below works.
	var homepagewindow = getTopWindow().window.location;
	var homepageurl = homepagewindow.href;
	if(buttonelement == null && homepageurl.indexOf('nav_to.do?') != -1 || homepageurl.indexOf('navpage.do') != -1){
		//Check if button DOES NOT exist.
		var itssbuttonlink = "<a href='/itss' id='itssbuttonlink' class='btn btn-default' style='background-color:transparent; float:right; -moz-border-radius:6px; -webkit-border-radius:6px; border-radius:6px; border:1px solid #ffffff; color:#ffffff; margin-right: 1em; margin-top:0.9em;'>ITSS Home Page</a>"; //CSS
		jQuery(itssbuttonlink).insertAfter(bannerelement);//Inserts button above after "Development System" on top left.
	}
});

******************************************************************************************************************
refreshAffectedServices();  
  
function refreshAffectedServices(){  
  var listId = g_form.getTableName() + '.task_cmdb_ci_service.task'; //Replace with the ID of your list  
  if(typeof $(listId) != "undefined") {  
     GlideList2.get(listId).setFilterAndRefresh('');  
  }  
} 


var href = String(window.location.href);  
if (href.indexOf("_list.do") > -1 && href.indexOf("sysparm_view=incident_owner") > -1) {  
  jQuery(document).ready(function(){  
  $$('div.list2_cell_background').forEach(function(elmt){  
  var row = $(elmt).up(1);  
  var cells = row.childElements();  
  cells.forEach(function(cell) {  
  if (cell.style.backgroundColor == "") {  
  cell.style.backgroundColor = elmt.style.backgroundColor;  
  elmt.style.display = "none";  
  }  
  });  
  });  
  });  
} 
******************************************************************************************************************
UI ACTION AJAX EXAMPLE:
function moveToReview(){
	var ga = new GlideAjax("ChangeRequestStateHandlerAjax");
	ga.addParam("sysparm_name", "getStateValue");
	ga.addParam("sysparm_state_name", "review");
	ga.getXMLAnswer(function(stateValue) {
		g_form.setValue("state", stateValue);
		gsftSubmit(null, g_form.getFormElement(), "state_model_move_to_review");
	});
}

if (typeof window == 'undefined')
   setRedirect();

function setRedirect() {
    current.update();
    action.setRedirectURL(current);
}

******************************************************************************************************************

SLUSH BUCKET RESIZE :
function onLoad(){
resizeMicro('u_mapr_microservices');
resizeMicro('u_zion_microservices');
}
function resizeMicro(varName){
var height = '200';
var width = '220';
try{
var leftBucket = gel(varName + '_select_0');
var rightBucket = gel(varName + '_select_1');

if(leftBucket){
            if(height){
                leftBucket.style.height = height + 'px';
                rightBucket.style.height = height + 'px';
            }
            if(width){
                leftBucket.style.width = width + 'px';
                rightBucket.style.width = width + 'px';
                                leftBucket.up('.slushbucket').style.width = width*2 + 100 + 'px';
            }
            $(varName + 'recordpreview').up('td').setAttribute('colSpan', '3');
        }
    }catch(e){}
}

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************


******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************

******************************************************************************************************************