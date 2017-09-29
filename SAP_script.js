<?xml version="1.0" encoding="utf-8" ?>
<j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null">
	
<g:evaluate var="jvar_gr" object="true">
	var gr = new GlideRecord("u_devops");
	var qc = gr.addQuery('u_name', true); 
	qc.addOrCondition('sys_id', 'IN', '${jvar_question_value}');
	

	gr.orderBy('u_branch');
	gr.orderBy('u_hierarchy_level');
	gr.orderBy('u_department');
	gr.orderBy('u_subject');
	gr.orderBy('u_role');
	gr.query();
	gr;
</g:evaluate>

<style>  
.glyphicon.glyphicon-plus{
    color:green;
}

.glyphicon.glyphicon-minus{
    color:red;
}
</style>  
	<g:set_if var="jvar_changeform" test="${current.sys_class_name =='change_request'}" true="1" false="0" />
		
	<table id="Select Production">
		<tr><td><b>SAP Roles</b></td></tr>
		
	<j:set var="jvar_prev_l1" value=""/>
	<j:set var="jvar_prev_l2" value=""/>
		
	<j:set var="jvar_l1" value=""/>
	<j:set var="jvar_l2" value=""/>
	
	<j:set var="jvar_level" value=""/>
		
	<j:set var="jvar_l1Index" value="-1"/>
	<j:set var="jvar_l2Index" value="0"/>
		
	<j:set var="jvar_rowClass" value=""/>
	<j:set var="jvar_rowChecked" value="checked"/>
		
		
	<j:while test="${jvar_gr.next()}">
		<j:set var="jvar_prev_l1" value="${jvar_l1}" />
		<j:set var="jvar_prev_l2" value="${jvar_l2}" />
		<j:set var="jvar_l1" value="${jvar_gr.getValue('u_branch')}" />
		<j:set var="jvar_l2" value="${jvar_gr.getValue('u_department')}" />
		<j:set var="jvar_prev_level" value="${jvar_level}" />
		<j:set var="jvar_level" value="${jvar_gr.getValue('u_hierarchy_level')}" />
		<g:set_if var="jvar_roleindent" test="${jvar_level == 2}" true="4" false="2" />
		<j:if test="${jvar_prev_l1 != jvar_l1}">
			<j:set var="jvar_l1Index" value="${jvar_l1Index + 1}" />
			<j:set var="jvar_l2Index" value="0" />
			
			<tr class="hier" id="row_${jvar_l1Index}">
				<td style="">
					<button id="btn_${jvar_l1Index}" onClick="return onLevelClick(0,this, ${jvar_level});" class="glyphicon glyphicon-plus"/>
					${jvar_gr.getValue('u_branch')}
				</td>
			</tr>
		</j:if>
		
		<j:if test="${jvar_prev_l2 != jvar_l2 &amp;&amp; jvar_level == 2}">
			<j:set var="jvar_l2Index" value="${jvar_l2Index + 1}" />
			
			<tr class="hier_${jvar_l1Index}" id="row_${jvar_l1Index}_${jvar_l2Index}" style="display:none;">
				<td >
					<div style="margin-left: 2em;">
						<button id="btn_${jvar_l1Index}_${jvar_l2Index}" onClick="return onLevelClick(1,this, ${jvar_level});" class="glyphicon glyphicon-minus"/>
						${jvar_gr.getValue('u_department')}
					</div>
				</td>
			</tr>
		</j:if>
		
		<j:if test="${jvar_prev_l2 == jvar_l2 &amp;&amp; jvar_level != jvar_prev_level}">
			<j:set var="jvar_l2Index" value="${jvar_l2Index + 1}" />
		</j:if>
		
		<g:set_if var="jvar_rowClass" test="${jvar_level == 2}" true="row_${jvar_l1Index}_${jvar_l2Index}" false="row_${jvar_l1Index}" />
		
	
		
		<tr id="${jvar_rowClass}_${jvar_gr.getValue('sys_id')}" style="display:none;">
			<td>
				<div style="margin-left: ${jvar_roleindent}em;">
					<span class="input-group-checkbox">  
						 <input id="chk_${jvar_gr.getValue('sys_id')}" name="chk_${jvar_gr.getValue('sys_id')}" 
								class=" checkbox" type="checkbox" onClick="SaveData(this);" />
						 <input id="chk_${jvar_gr.getValue('sys_id')}" name="chk_${jvar_gr.getValue('sys_id')}" type="hidden"/>  
						<label class="checkbox-label" for="chk_${jvar_gr.getValue('sys_id')}" title="${jvar_gr.getValue('u_description')}">
							 ${jvar_gr.getValue('u_subject')} - ${jvar_gr.getValue('u_role')} 
							<j:if test="${jvar_changeform == '1'}">(${jvar_gr.getValue('u_sap_role_name')})</j:if>
						</label>  
					</span>  
				</div>
			</td>
		</tr>
	</j:while>  

	</table>
	
	<input type="HIDDEN" id="${jvar_question_name}" style="width:50%" name="${jvar_question_name}" value="${jvar_question_value}" class="cat_item_option questionsettext"/>
	
	
	<script>
		addLoadEvent(treeOnLoad);
		
		function treeOnLoad(){
		
			if(g_form.getTableName()!='change_request'){
				return;
			}
		
			var selectedRoles = "${jvar_question_value}";
			var roles = selectedRoles.split(",");
			var rolesCount = roles.length - 1;
			var tbl = document.getElementById('tblRoles');
		
			//PreSelect values
			for(var i = 0; i &lt; rolesCount; i++){
				var chk =  document.getElementById("chk_" + roles[i]);
				chk.checked = true;
			}
		
			var hierVisible = false;
			for(var i = 0; i &lt; tbl.rows.length; i++){
				if(tbl.rows[i].className.startsWith("hier")){
					hierVisible = false;
		
					var hierRowLevels =  tbl.rows[i].id.replace("row_", "").split("_").length;
					var hierEndIndex = 0;
					for(var j = i+1; j &lt; tbl.rows.length; j++){
						var currRowLevels =  tbl.rows[j].id.replace("row_", "").split("_");
		
						if(hierRowLevels >= currRowLevels.length){
							hierEndIndex = j;					
							break;
						}
		
						if(roles.indexOf(currRowLevels[currRowLevels.length - 1]) > -1){
							hierVisible = true;
						}
					}
		
					if(hierVisible){
						var btn = document.getElementById(tbl.rows[i].id.replace("row", "btn"));
						btn.className = "glyphicon glyphicon-minus";
						tbl.rows[i].style.display = '';
		
						for(var j = i+1; j &lt; hierEndIndex; j++){
							var currRowLevels =  tbl.rows[j].id.replace("row_", "").split("_");
							if(hierRowLevels + 1 == currRowLevels.length){
								if(tbl.rows[j].className.startsWith("hier")){
									var btn = document.getElementById(tbl.rows[j].id.replace("row", "btn"));
									btn.className = "glyphicon glyphicon-plus";
								}
		
								tbl.rows[j].style.display = '';
							}
						}
					}
				}
			}
			Paysafe@123
		
			
		
			var locked = g_form.getValue('state') != 110;//110 - Pending Review, TreeView is locked if not in Pending Review
		
		/*
			if(${current.canWrite()} != ''){
				locked = true;
			}
		*/
			
			if(locked){
				var cls = '.checkbox';
				var lst = tbl.querySelectorAll(cls);
				for(var i = 0; i &lt; lst.length; ++i) {
					lst[i].disabled = true;
				}
			}
		}
		
		function onLevelClick(level, btn, maxlevel){
		
			var tbl = document.getElementById('tblRoles');
			var tr = document.getElementById(btn.id.replace("btn", "row"));
			var rowIndex = tr.rowIndex;
			var id = tr.id;
			var rows = tbl.rows.length;
		
			var levels = id.replace("row_", "").split("_");
			var rowStyle = "";
		
			if(btn.className == "glyphicon glyphicon-plus"){
				btn.className = "glyphicon glyphicon-minus";
				for(var i = rowIndex + 1; i &lt; rows; i++){
					var rowLevels = tbl.rows[i].id.replace("row_", "").split("_");
					
					if(levels.length >= rowLevels.length){
						break;
					}
		
					if(levels.length + 1 == rowLevels.length){
						tbl.rows[i].style.display = "";
					}else{
						tbl.rows[i].style.display = "none";
					}
				}
		
				var cls = '.hier_' + btn.id.replace("btn_", "");
				var lst = document.querySelectorAll(cls);
				for(var j = 0; j &lt; lst.length; ++j) {
					lst[j].getElementsByTagName('button')[0].className = "glyphicon glyphicon-plus";
				}
			}else{
				btn.className = "glyphicon glyphicon-plus";
		
				for(var i = rowIndex + 1; i &lt; rows; i++){
					var rowLevels =  tbl.rows[i].id.replace("row_", "").split("_");
					
					if(levels.length >= rowLevels.length){
						break;
					}
		
					tbl.rows[i].style.display = "none";
				}
			}
			jQuery(document).trigger('itce-roles-levelToggle');
			return false;
		}
		
		
		function SaveData(chk){
			hdf = document.getElementById("${jvar_question_name}");
		
			role = chk.id.replace("chk_", "") + ",";
			newValue = "";
			if(chk.checked){
				newValue = hdf.value + role;
			}else{
				newValue = hdf.value.replace(role, "");
			}
			hdf.value = newValue;
			
		}
	</script>
</j:jelly>