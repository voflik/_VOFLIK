
As Tavor, I want the "application responsible" defined in the package record Producer (new CIPKG) to be set as Customer Application responsible in the Customer Application Responsible m2m table. Actually, a new record is created in this m2m table, but it doesn't contain the Customer OU or the AV, Just the date is set.

 

HINT:

Doing this would be better in an BR that runs on changing of the Application Responsible field.

There is a not correctly written Script Include that contains already some of the logic. The problem just is: it checks if the application is allowed for that customer - this is not needed anymore.

The Script Include is: CongaPackageTransformUtil and the method is "crateAppToCustomerOURelationship".



						
ISSUE : ACL not moved to TEST for WMI Objects DONE
BUG : Runbook get application is not parcisng the result DONE
OITSM-13682Conga-291: Dependencies and Supersedences controls DONE


Conga-257: Fix / Finish up what started in OITSM-13098 in progress




george.klifov@swisscom.com

customer=1315a931154713008ec413ba186da35b


function timeStringToFloat(time) {
  var tm = time;
  var days = tm.split(" ");
  var hoursMinutes = tm.split(/[.:]/);
  var hours = parseInt(hoursMinutes[0], 10);
  var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
  return days + hours + minutes / 60;
}


WORKING EXAMPLE : 
function timeStringToFloat(time) {
  var tm = time;
  var days = tm.split(" ");
  var day = parseInt(tm[0]) * 24;
  var hoursMinutes = tm.split(/[.:]/);
  var hours = parseInt(hoursMinutes[0], 10);
  var minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
  return day + hours + minutes / 60;
}