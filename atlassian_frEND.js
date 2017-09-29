function onSubmit() {
   //Type appropriate comment here, and begin script below
	
	if(g_form.getValue('hipchat') != 'true' || g_form.getValue('bitbucket') != 'true' || g_form.getValue('confluence') != 'true' || g_form.getValue('jira') != 'true' || g_form.getValue('bamboo') !='true'){
		alert("At least one Atlassian Tool should be selected! Select at least one item.");
		alert(g_form.getValue('hipchat'));
		return false;
	}
   
}


var g_cat_form = null;
function onLoad() {

  var cat = g_form.getValue('sys_display.original.sc_req_item.cat_item');
  if (cat != 'Blackberry')
     return;

  var map = gel('variable_map');
  var cat_form = new ServiceCatalogForm('ni', true, true);

  var items = map.getElementsByTagName("item");
  for (var i = 0; i < items.length; i++) {
  	var item = items.item(i); 
	var id = item.id;
        var name = item.getAttribute('qname');
        optionId = getItemOptionID(id);
        var nm = new NameMapEntry(name, "ni.VE" + optionId);
        cat_form.addNameMapEntry(nm);
  }

  var replacement = cat_form.getControl('replacement');
  if (!replacement)
    return;

  var original = cat_form.getControl('original');
  if (!original)
    return;

  g_cat_form = cat_form;
  setReasonVisibility(null, replacement);
  var els = document.getElementsByName(replacement.name);
  for (var i = 0; i < els.length; i++)
    els[i].onclick = setReasonVisibility.bindAsEventListener(els[i]);
}

function getItemOptionID(id) {
  var item_option = new GlideRecord('sc_item_option_mtom');
  item_option.addQuery('request_item', g_form.getUniqueValue());
  item_option.addQuery('sc_item_option.item_option_new', id);
  item_option.query();
  if(item_option.next())
      return item_option.sc_item_option;
}
 
function setReasonVisibility(e, target) {
   jslog('setReasonVisibility');
   if (!e)
      e = window.event;
	
   if (!target)    
      target = e.target ? e.target : e.srcElement;

   var vis = false;
   if (target.value == 'Yes')
     vis = true;
   
   g_cat_form.setDisplay('original', vis);
}

///////////////////////////////////////////////


