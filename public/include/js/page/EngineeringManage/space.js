$(function(){
	$("#space_edit").hide();
	$.ajax({
		url: configObject.engGetData,
		type: "POST",
		data:{
			type: "space"
		},
		dataType: "JSON",
		async: false,
		success:
			function(rs){
				console.log(rs.data);
				createSpaceView(rs.data);
			},
		error:
			function(e){
				console.log(e);
			}
	});
});

function createSpaceView($dataArr){
	var arrName = ["樓層：","部位："];
	var i = 0;
	for(var $index in $dataArr){
		var $div = $("<div/>").appendTo($("#spaceContent"));
		var $label = $("<label/>").text(arrName[i++]).appendTo($div);
		var $selection = $("<select/>").attr("id",$index).appendTo($label);
		for(var $i in $dataArr[$index]){
			$("<option/>").attr("data-code",$dataArr[$index][$i].code)
						  .attr("data-ismodel",$dataArr[$index][$i].ismodel)
						  .val($dataArr[$index][$i].uid)
						  .text($dataArr[$index][$i].name)
						  .appendTo($selection);
		}
		//新增鈕
		$("<input/>").attr("type","button")
					 .attr("id","new"+$index)
					 .attr("onclick","newSpace('"+$index+"')")
					 .val("新增")
					 .appendTo($div);
		//修改鈕
		$("<input/>").attr("type","button")
					 .attr("id","new"+$index)
					 .attr("onclick","updateSpace('"+$index+"')")
					 .val("修改")
					 .appendTo($div);
		//刪除鈕
		$("<input/>").attr("type","button")
					 .attr("id","new"+$index)
					 .attr("onclick","deleteSpace('"+$index+"')")
					 .val("刪除")
					 .appendTo($div);
	}
}

function newSpace($type){
	$("#spaceContent").hide();
	$("#space_insert_table").val($type);
	$("#space_new").show();
	$("#space_update").hide();
	$("#space_submit").show();
	$("#space_update_submit").hide();

	switch($type){
		case "eng_str_a":
			break;
		case "eng_str_b":
			$("#space_target").text("樓層");
			$("#space_edit").show();
			$("#space_ismodel").show();
			break;
		case "eng_str_c":
			break;
		case "eng_str_d":
			break;
		case "eng_str_e":
			$("#space_target").text("部位");
			$("#space_edit").show();
			$("#space_ismodel").hide();
			break;
		default:
	}
	$("#space_code").val("");
	$("#space_name").val("");
}

function updateSpace($type){
	$("#spaceContent").hide();
	
	$("#space_insert_table").val($type);

	$("#space_new").hide();
	$("#space_update").show();
	$("#space_submit").hide();
	$("#space_update_submit").show();

	switch($type){
		case "eng_str_a":
			break;
		case "eng_str_b":
			$("#space_target").text("樓層");
			$("#space_edit").show();
			$("#space_ismodel").show();

			$code = $("#eng_str_b :selected").attr("data-code");
			$name = $("#eng_str_b :selected").text();
			$ismodel = $("#eng_str_b :selected").attr("data-ismodel");

			// console.log($code, $name, $ismodel);
			$("#space_ori_name").val($name);
			$("#space_ori_code").val($code);

			$("#space_code").val($code);
			$("#space_name").val($name);
			$("input[name=space_ismodel][value="+$ismodel+"]").prop("checked",true);

			break;
		case "eng_str_c":
			break;
		case "eng_str_d":
			break;
		case "eng_str_e":
			$("#space_target").text("部位");
			$("#space_edit").show();
			$("#space_ismodel").hide();

			$code = $("#eng_str_e :selected").attr("data-code");
			$name = $("#eng_str_e :selected").text();

			$("#space_ori_name").val($name);
			$("#space_ori_code").val($code);

			$("#space_code").val($code);
			$("#space_name").val($name);
			break;
		default:
	}
}

function deleteSpace($type){
	switch($type){
		case "eng_str_b":
			$code = $("#eng_str_b :selected").attr("data-code");
			$name = $("#eng_str_b :selected").text();
			break;
		case "eng_str_e":
			$code = $("#eng_str_e :selected").attr("data-code");
			$name = $("#eng_str_e :selected").text();
			break;
	}
	
	console.log($code,$name);
	$.ajax({
		url: configObject.engDeleteData,
		type: "POST",
		data:{
			table: $type,
			code: $code,
			name: $name
		},
		dataType: "JSON",
		async: false,
		success:
			function(rs){
				console.log(rs);
				if(rs.status){
					alert(rs.msg);
				}
				location.reload();
			},
		error:
			function(e){
				console.log(e);
			}
	});
}

function spaceCancel(){
	$("#space_edit").hide();
	$("#spaceContent").show();
}

function spaceSubmit($type){
	//判斷為新增還是修改
	switch($type){
		case "new":
			$url = configObject.engInsertData;
			$ori_name = "";
			$ori_code = "";
			break;
		case "update":
			$url = configObject.engUpdateData;
			$ori_name = $("#space_ori_name").val();
			$ori_code = $("#space_ori_code").val();
			break;
		default:
	}

	$.ajax({
		url: $url,
		type: "POST",
		data:{
			table: $("#space_insert_table").val(),
			code: $("#space_code").val(),
			name: $("#space_name").val(),
			ismodel: $("input[name=space_ismodel]:checked").val(),
			ori_name: $ori_name,
			ori_code: $ori_code
		},
		dataType: "JSON",
		async: false,
		success:
			function(rs){
				console.log(rs);
				if(rs.status){
					alert(rs.msg);
					location.reload();
				}else{
					alert(rs.msg);
				}
			},
		error:
			function(e){
				console.log(e);
			}
	});
}