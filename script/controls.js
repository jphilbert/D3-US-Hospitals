// ----------------------------------------------------------------------
// Controls
// ----------------------------------------------------------------------

function populateInfo(d) {
    $(".controlInfo#name").text(d["Hospital Name"]);
    $(".controlInfo#address").text(d["Address 1"]);
    $(".controlInfo#city").text(d["City"]);
    $(".controlInfo#state").text(d["State"]);
    $(".controlInfo#emergency").text(d["Emergency Services"] ? "Yes" : "No");
    $(".controlInfo#type").text(d["Hospital Type"]);
    $(".controlInfo#ownership").text(d["Hospital Ownership"]);
}

$(function() {
    $( "#dialog-help" ).dialog({
	   autoOpen: false,
	   modal: true,
	   width: "50%"
    });
    
    $( "#button-help" )
	   .button()
	   .click(function() {
		  $( "#dialog-help" ).dialog( "open" );
	   });

    $( "#dialog-data" ).dialog({
	   autoOpen: false,
	   modal: true,
	   width: "30%"
    });
    
    $( "#button-data" )
	   .button()
	   .click(function() {
		  $( "#dialog-data" ).dialog( "open" );
	   });
});
 
	
