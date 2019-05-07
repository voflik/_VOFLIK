//Absataction of using GlideRecords without knowing the table nor query or values + fields

//  SKELETON  //
var json = {state:1, number:1111}
 var kur = new AbstractGlide.update(table, json)

var SuperGlide = Class.create();
AppSetSuperGlideRunbook.prototype = {
	initialize: function () {


	},

    getTable: function(obj){

        var tbl = obj.table;
        var rec = new GlideRecord(tbl);
        rec.add

    },

    getFields: function(obj){

    },

    getValues: function(obj){

    },

    getQuery: function(obj){

        var qry;
        for(var i in obj.query){
            
            qry += 

        }

    },

    logger: function(str){

    },
	
	type: 'SuperGlide'
};

var obj = {
    table: "",
    fields: [ "number", "assignee", "state" ],
    values: [ "STRY12345", "Joro", "WiP" ],
    query: {
        {

        }
    }
}

// Try to use iteration of the entire JSON object, to abstract as possible the tables and the queried records




// Date times util
// Duration calculatior util
// randomizer

          var d = new Date();
          var timestamp = 
            ('0' + d.getHours()).substr(-2) + ':' +
            ('0' + d.getMinutes()).substr(-2) + ':' +
            ('0' + d.getSeconds()).substr(-2) + '.' +
            ('00' + d.getMilliseconds()).substr(-3);    