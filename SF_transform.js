(function runTransformScript(source, map, log, target /*undefined onStart*/ ) {
	
	var ignoredUsers = new GlideRecord('u_successfactors_ignored_user_updates');
	ignoredUsers.addQuery('u_user.email', source.u_email);
	ignoredUsers.query();
	if(ignoredUsers.next()) {
		log.error('Ignoring user with id:' + source.u_userid + ' because they were added to the Ignore Table ' + source.u_email);
		ignore = true;
		return;
	}
	//Adding not empty condition for SFID (u_userid) as some records dont have such and we use it as unique value
	var importUtils = new ITCE_SuccessFactors_Integration_Utils();
	if(source.u_email.nil() || !importUtils.emailValid(source.u_email) || source.u_userid.nil()) {
		log.error('Ignoring user with id: ' + source.u_userid + ' with invalid email: ' + source.u_email + ' or empty SFID ' + source.u_userid);
		ignore = true;
		return;
	}
	
	if(source.u_firstname.toLowerCase.indexOf('test') === 0 || source.u_lastname.indexOf('test') === 0) {
		log.error('Ignoring user with id: ' + source.u_userid + ' because of name starting with "test"');
		ignore = true;
		return;
	}
	//log.info("Field Active is : " + source.u_active);
	if(importUtils.checkIfInactive(source.u_email.toLowerCase(), source.u_userid, source.u_externalid, source.u_active)){
		log.info('Role removed for : ' + target.user_name);
	}
	//Escaping all 'null' values from the CSV. Otherwise we get new 'null' records
	//Enhancement STSK0011058 - Additional fields VIENNA
	var def = 'Not provided';
	if(target.u_position_number == '' || target.u_position_number != 'Not provided' || target.u_position_number == 'undefined'){
		target.u_position_number = importUtils.validate(source.u_position.toString().replace(/null/,"Not Provided").trim(), def);
	}
	//source.u_position.toString() == 'null' ? target.u_position_number = "Not provided" : target.u_position_number = source.u_position;
	
	if(target.u_busness_unit_name == '' || target.u_busness_unit_name != 'Not provided' || target.u_busness_unit_name == 'undefined'){
		target.u_busness_unit_name = importUtils.validate(source.u_businessunitname.toString().replace(/null/,"Not Provided").trim(), def);
	}
	if(target.u_employee_class == '' || target.u_employee_class != 'Not provided' || target.u_employee_class == 'undefined'){
		target.u_employee_class = importUtils.validate(source.u_employee_class.toString().replace(/null/,"Not Provided").trim(), def);
	}
	//target.cost_center = importUtils.validate(source.u_costcentername, '8714e1350fa9ba409eca83fc22050e7d');
	target.cost_center = importUtils.checkCostCenter(source.u_costcentername.toString().replace(/null/,"").trim());
	
	log.info("AFTER TRANSORM 4 FIELDS are , position " + target.u_position_number + " bussunit " + target.u_busness_unit_name + " class " + target.u_employee_class + " costcentere " + target.cost_center + " , cost code " + target.u_costcentercode);
	
	//Remove unnecessary suffixes from the company name Company (SUFFIX)
	target.company = importUtils.getServiceNowCompany(source.u_company.toString().replace(/null/,"").trim());
	log.info('TRANSFORM Company is : ' + target.company);
	//target.location = source.u_location.replace(/\(.+?\)/,"").trim();
	if(source.u_location.toUpperCase() !== 'N/A') {
		log.info("Location was found for " + source.u_location);
		var newlocation = source.u_location.replace(/\(.+?\)/,"").trim();
		log.info("TRIMMED Location was found for " + newlocation);
		target.location = importUtils.getServiceNowLocation(newlocation);
	}
	else if(target.location != ""){
		log.info("User " + source.email + "already has a location, leaving it as-is!");
		//target.location = "";
		log.info("No Location was Found " + source.u_location);
		
	}
	//Remove double quotes on last name
	//
	target.last_name = importUtils.normalizeNames(source.u_lastname);
	
	target.manager = importUtils.getServiceNowManager(source.u_manager);
	log.info('Company for ' + source.u_email + ' is: ' + source.u_company + ', Location: ' + source.u_location);
	
	
	
})(source, map, log, target);