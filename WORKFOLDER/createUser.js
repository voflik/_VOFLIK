var objj = {
"leave":"0.0",
"last_name":"peshov1",
"country_id":"2",
"staff_number":"121212",
"department_id":"4337414787",
"first_name":"pesho1",
"corr":"0.0",
"title_id":"2",
"location_id":"3692945312",
"cal_id":"2",
"position_id":"2",
"external_department_id":"4351654155",
"type":"E",
"email":"pesho@gmail.com"
};


function createBAntPerson(obj, session, username, password){
  try {
   var s = new sn_ws.SOAPMessageV2('Ant', 'CreatePerson');

   s.setMIDServer('MIDONE');
   s.setStringParameterNoEscape('leave', obj['leave']);//'0.0');
   s.setStringParameterNoEscape('session', session);//'FmPVw4hJFCd1xpBU6L1F');
   s.setStringParameterNoEscape('last_name', obj['last_name']);//'tester');
   s.setStringParameterNoEscape('country_id', obj['country_id']);//'2');
   s.setStringParameterNoEscape('staff_number', obj['staff_number']);//'666');
   s.setStringParameterNoEscape('department_id', obj['department_id']);//'4337414787');
   s.setStringParameterNoEscape('first_name', obj['first_name']);//'tester');
   s.setStringParameterNoEscape('corr', obj['corr']);//'0.0');
   s.setStringParameterNoEscape('title_id', obj['title_id']);//'2');
   s.setStringParameterNoEscape('location_id', obj['location_id']);//'3692945312');
   s.setStringParameterNoEscape('cal_id', obj['cal_id']);//'2');
   s.setStringParameterNoEscape('position_id', obj['position_id']);//'2');
   s.setStringParameterNoEscape('external_department_id', obj['external_department_id']);//'4351654155');
   s.setStringParameterNoEscape('type', obj['type']);//'E');
   s.setStringParameterNoEscape('email', obj['email']);//'yyyxxx@from.ch');

   var response = s.execute();
   var responseBody = response.getBody();
   var status = response.getStatusCode();
   var xml = new XMLDocument2();
   xml.parseXML(responseBody);
   gs.print("STATUS IS : " + status + "\n" + xml);
   var id = xml.getNodeText("//ns6:personID");
  }
  catch(ex) {
   var message = ex.getMessage();
  }

  if(status == "200"){
    gs.log("Status is 200 for Create PErson!");
    createBAntUser(session, username, password, id);
  }




}




function createBAntUser(session, username, password, id){

  try {
   var s = new sn_ws.SOAPMessageV2('Ant', 'CreateUser');
   s.setMIDServer('MIDONE');
   s.setStringParameterNoEscape('session', session);
   s.setStringParameterNoEscape('password', password);
   s.setStringParameterNoEscape('username', username);
   s.setStringParameterNoEscape('id', id);
   var response = s.execute();
   var responseBody = response.getBody();
   var status = response.getStatusCode();
  }
  catch(ex) {
   var message = ex.getMessage();
  }

  if(status == "200"){
    gs.print("OK PAYLOAD IS " + responseBody);
    return true;
  }
  else{
    gs.print("BAD PAYLOAD IS " + responseBody);
    return false;
  }




}
