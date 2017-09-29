var outputs = [];try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 
var value = ""; 
var testTable = new GlideRecord('pwd_reset_request'); 
var tableExist = testTable.isValid(); 

if (tableExist) { 
var gra = new GlideAggregate("pwd_reset_request"); 
gra.addAggregate('COUNT'); 
gra.addQuery('sys_created_on', '>=', gs.daysAgoStart(90)); 
gra.query(); 

if (gra.next()) { 
rowCount = gra.getAggregate('COUNT'); 
} 
} 
else { 
value="no table"; 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001188.1',defid:'16164bd8db5272003353f22ebf9619f2'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001188.1',defid:'16164bd8db5272003353f22ebf9619f2'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'catalog'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001183.0',defid:'2a164bd8db5272003353f22ebf9619f6'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001183.0',defid:'2a164bd8db5272003353f22ebf9619f6'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'grc_admin,grc_audit_definition_admin,grc_test_definition_admin,grc_user,grc_audit_reader,grc_compliance_reader,grc_control_test_reader,grc_audit_reviewer,grc_compliance_approver'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001179.0',defid:'355bb3f9db56f2403353f22ebf9619bc'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001179.0',defid:'355bb3f9db56f2403353f22ebf9619bc'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate("cmdb_ci_server"); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('discovery_source', 'Service-now').addOrCondition('discovery_source', 'Servicenow'); 
gra.addQuery('virtual', 'false'); 
gra.addQuery('last_discovered', '>', gs.daysAgoStart(90)); 
gra.query(); 

if (gra.next()) 
rowCount = gra.getAggregate('COUNT'); 
}var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001203.1',defid:'390ee548db9e72003353f22ebf961914'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001203.1',defid:'390ee548db9e72003353f22ebf961914'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'vendor_manager'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
}var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001180.0',defid:'42164bd8db5272003353f22ebf9619db'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001180.0',defid:'42164bd8db5272003353f22ebf9619db'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'notifynow_admin'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001178.0',defid:'46164bd8db5272003353f22ebf9619dd'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001178.0',defid:'46164bd8db5272003353f22ebf9619dd'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'facilities_admin, facilities_approver_user,facilities_asset_admin,facilities_dispatcher, facilities_read,facilities_staff'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001181.0',defid:'675678c5db527a003353f22ebf9619e6'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001181.0',defid:'675678c5db527a003353f22ebf9619e6'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'wm_basic,wm_agent'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001185.0',defid:'702ffbf1db96f2403353f22ebf961900'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001185.0',defid:'702ffbf1db96f2403353f22ebf961900'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('cmdb_ci_hardware'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('discovery_source', 'Service-now').addOrCondition('discovery_source', 'Servicenow'); 
gra.addQuery('last_discovered', '>=', gs.daysAgoStart(90)); 
gra.query(); 
if (gra.next()) 
rowCount = gra.getAggregate('COUNT'); 
}var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001202.5',defid:'7fb1808adb96f2403353f22ebf961940'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001202.5',defid:'7fb1808adb96f2403353f22ebf961940'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'asset, inventory_user, inventory_admin,category_manager,contact_manager,financial_mgmt_user, model_manager'); 
gra.groupBy('user.user_name'); 
gra.query(); 

if (gra.next()) 
rowCount = gra.getRowCount(); 
}var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001186.0',defid:'91d69cb8db5676003353f22ebf9619a9'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001186.0',defid:'91d69cb8db5676003353f22ebf9619a9'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'knowledge,knowledge_manager,knowledge_administrator'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001184.0',defid:'caa7700ddb527a003353f22ebf96195e'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001184.0',defid:'caa7700ddb527a003353f22ebf96195e'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('rm_story'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('sys_created_on', '<=', gatherDate); 
gra.addQuery('sys_created_on', '>=', gs.daysAgoStart(30)); 
gra.query(); 

if (gra.next()) 
rowCount = gra.getAggregate('COUNT'); 
}var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001175.2',defid:'eab81c30db9676003353f22ebf961909'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001175.2',defid:'eab81c30db9676003353f22ebf961909'});
}
try{
var status = 'unknown';
var buildLetter = 'G';
var buildOffering = 'enterprise';
var gatherDate = '2017-06-28 07:00:00';
var vars = '';
var rowCount = 0; 

var gra = new GlideAggregate('sys_user_has_role'); 
if (gra.isValid()) { 
gra.addAggregate('COUNT'); 
gra.addQuery('user.active', true); 
gra.addQuery('role.name', 'IN', 'portfolio_admin'); 
gra.groupBy('user'); 
gra.query(); 

if (gra.next()){ 
rowCount = gra.getRowCount(); 

} 
} 
var value = value||'';
var payload = payload||{};
if(typeof rowCount === 'undefined') {var rowCount = -1;}
if(status == 'unknown' && rowCount == -1) {var status = 'retry';}
if(status == 'unknown' && rowCount > -1) {var status = 'success';}
outputs.push({status: status, count: rowCount, value_string: value, payload: payload, vars: vars,defname:'DEF0001182.0',defid:'f3c787dcdb5272003353f22ebf961976'});
value = '';
payload = {};
vars ='';
} catch (e) {
outputs.push({status:'retry', count:-1, value_string:'', payload: '', vars:'',defname:'DEF0001182.0',defid:'f3c787dcdb5272003353f22ebf961976'});
}
if(typeof JSON.stringify == 'function') {gs.print(JSON.stringify(outputs));} else {gs.print(new JSON().encode(outputs));}