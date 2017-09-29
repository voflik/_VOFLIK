

function forcer(num, proj){	
	var ch = new GlideRecord('change_request');
	//ch.addQuery('sys_id','9176d6846f6f61006addc026eb3ee415');
	ch.addQuery('number',num);
	ch.query();

	if(ch.next()){

		gs.print("Found record for update num : " + ch.number);
		if(proj){
			ch.u_paysafe_project = proj;
		} else {
			ch.u_paysafe_project = 'a98370ee0f193a0095ae079ce1050e6f';
		}
		ch.setWorkflow(false);
		ch.forceUpdate();
		ch.update();
		

	}

	gs.print(ch.u_paysafe_project);
}