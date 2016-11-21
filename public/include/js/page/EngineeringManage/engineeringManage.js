$(function(){
	$("#engineering").hide();
	$("#space").hide();
	$("#eng_button").click(function(){
		$("#engineering").show();
		$("#space").hide();
		$("#eng_button").hide();
		$("#space_button").hide();
	});
	$("#space_button").click(function(){
		$("#engineering").hide();
		$("#space").show();
		$("#eng_button").hide();
		$("#space_button").hide();
	});

	$("#new_label").hide();
	$("#edit_label").hide();
});

function back(){
	$("#eng_button").show();
	$("#space_button").show();
	$("#engineering").hide();
	$("#space").hide();
}