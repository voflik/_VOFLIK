CMDB Hints!!!

********************************************************************************************************************************
Usage of get demaknd table :
javascript:"sys_class_name="+SNC.PPMConfig.getDemandTable(current.getTableName())

********************************************************************************************************************************
BSM map - table with render scripts - ngbsm_script

********************************************************************************************************************************
answer = false;
if (current.cmdb_ci.sys_class_name == 'cmdb_ci_service') { 
   var serv = new GlideRecord('cmdb_ci_service'); 
   serv.get(current.cmdb_ci); 
   if (serv.busines_criticality == "1 - most critical" || serv.busines_criticality == "2 - somewhat critical") 
      answer = true; 
}
********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************

********************************************************************************************************************************