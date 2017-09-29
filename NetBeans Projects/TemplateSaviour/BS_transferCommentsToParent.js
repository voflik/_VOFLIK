(function executeRule(current, previous /*null when async*/) {
	
	var textToPropagateComment = current.comments.getJournalEntry(1); // gets lasto comment
	var textToPropagateWN = current.work_notes.getJournalEntry(1); //gets last work note
	
	var numberTask = current.number;
	var commentToAdd = "Comment Added from Request Task " + numberTask + " by :\n" + textToPropagateComment.replace(/(\d{2}.*\s\d{2}.{4}\d{2}\s\-\s)/gm, "");
	var workNoteToAdd = "Work Note Added from Request Task " + numberTask + " by :\n" + textToPropagateWN.replace(/(\d{2}.*\s\d{2}.{4}\d{2}\s\-\s)/gm, "");
	
	if(textToPropagateComment.indexOf("Comment Added from Request Item") >= 0 || textToPropagateWN.indexOf("Work Note Added from Request Item") >=0){
		return true;
	}
	
        gs.log("Clean time duplication : " + textToPropagateWN.replace(/(\d{2}.*\s\d{2}.{4}\d{2}\s\-\s)/gm, ""), 'TaskWN');
        
	var gr = new GlideRecord('sc_req_item');
	if(gr.get(current.getValue('request_item'))){
		if(current.comments.changes())
			gr.comments=commentToAdd;
		if(current.work_notes.changes())
			gr.work_notes=workNoteToAdd;
		gr.update();
	}
	
	// 	if(current.comments.changes()) {
		// 		var ritm = new GlideRecord('sc_req_item');
		// 		ritm.get(current.request_item.sys_id);
		// 		ritm.comments = commentToAdd;
		// 		ritm.update();
		// 	} else {
			// 		var ritmC = new GlideRecord('sc_req_item');
			// 		ritmC.get(current.request_item.sys_id);
			// 		ritmC.work_notes = workNoteToAdd;
			// 		ritmC.update();
			// 	}
		})(current, previous);
