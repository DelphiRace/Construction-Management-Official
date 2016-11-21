$(function(){
	$.ajax({
		url: configObject.engGetData,
		type: "POST",
		data: { type: "index" },
		dataType: "JSON",
		async: false,
		success:
			function(rs){
				// console.log(rs.dataTree);
				createTree($("#dataTree"), rs["dataTree"]);	
				creatUnitSelect($("#unitSelection"), rs["unitArr"]);
			},
		error:
			function(e){
				console.log(e);
			}
	});

	$("div[name='treeData']")
		.accordion({
	      	collapsible: true,
	      	heightStyle: "content",
	      	active: false,
	      	header: "> div > h3"
    	})
    	.sortable({
    		axis: "y",
	        handle: "h3",
	        stop: function( event, ui ) {
	          // IE doesn't register the blur when sorting
	          // so trigger focusout handlers to remove .ui-state-focus
	          ui.item.children( "h3" ).triggerHandler( "focusout" );
	 
	          // Refresh accordion to handle new order
	          $( this ).accordion( "refresh" );
	      	}
    	});

	$("div[name='treeData'] h3").click(function(){
		//提示使用者目前選
		$("#chosen").text($(this).text());
		$("#eng_name").val($(this).text());

		//設定參數
		$("#target").text($(this).text());
		var $code = $(this)[0].getAttribute("data-code");
		$("#chosen_code").val($code);
		$("#table_for_insert").val(getTable($code,0));
		$("#table_for_getTypeId").val(getTable($code,1));
		$("#chosenElement").show();
		
		$("div[name='last'] h3").css("background-color","")
				   				.css("color","");
		
		return false;
	});

	$("div[name='last'] h3").click(function(){
		if($(this).css("background-color")!=="rgb(0, 127, 255)"){
			$(this).css("background-color","#007FFF")
				   .css("color","white	");
		}else{
			$(this).css("background-color","")
				   .css("color","");
		}
	});
});

//產生工程資料樹狀結構
function createTree(currentNode, dataArray){
	for(var index in dataArray){
		//console.log(dataArray[index]);
		if(dataArray[index]["child"] !== null){
			var row = $("<div/>").attr("class","group").appendTo(currentNode);
			var title = $("<h3/>")
						.text(dataArray[index]["name"])
						.attr("data-code", dataArray[index]["code"])
						.appendTo(row);
			if(dataArray[index]["child"][0]["child"] !== null ){
				var content = $("<div/>").attr("name","treeData").appendTo(row);
			}else{
				var content = $("<div/>").attr("name","last").appendTo(row);
			}
			createTree(content, dataArray[index]["child"]);
		}else{
			var title = $("<h3/>")
						.text(dataArray[index]["name"])
						.attr("data-code", dataArray[index]["code"])
						.appendTo(currentNode);
		}
	}
}

//產生單位選單
function creatUnitSelect(currentNode, dataArray){
	var unit1 = $("<select/>")
				.attr("id","unit1")
				.appendTo(currentNode);
	var unit2 = $("<select/>")
				.attr("id","unit2")
				.css("display","none")
				.appendTo(currentNode);
	
	for(var i=0; i<dataArray.length; i++){
		var option1 = $("<option/>")
					.attr("value", i+1)
					.text(dataArray[i]["unit1"])
					.appendTo(unit1);
		var option2 = $("<option/>")
					.attr("value", i+1)
					.text(dataArray[i]["unit2"])
					.appendTo(unit2);
	}
}

function getTable($code,$type){
	var $table="";
	
	switch($code.length){
		case 1:
			if($type==0){
				$table = "eng_type_b";
			}else if($type==1){
				$table = "eng_type_a";
			}
			break;
		case 2:
			if($type==0){
				$table = "eng_type_c";
			}else if($type==1){
				$table = "eng_type_b";
			}
			break;
		case 4:
			if($type==0){
				$table = "eng_type_d";
			}else if($type==1){
				$table = "eng_type_c";
			}
			break;
		case 6:
			if($type==0){
				$table = "";
			}else if($type==1){
				$table = "eng_type_d";
			}
			break;
		default:
	}

	return $table;
}


function cancelChosen(){
	$("#chosen").html("");
	$("#target").html("");
	$("#table_for_insert").val("eng_type_a");
	$("#table_for_getTypeId").val("");
	$("#chosenElement").hide();
}

//刪除所選資料
function deleteChosen(){
	$.ajax({
		url: configObject.engDeleteData, 
		type: "POST",
		data: { table: $("#table_for_getTypeId").val(), code: $("#chosen_code").val() },
		dataType: "JSON",
		async: false,
		success:
			function(rs){
				if(rs.status){
					alert(rs.msg);
					location.reload();
				}else{
					//console.log(rs);
					alert(rs.msg);
				}
			},
		error:
			function(e){
				console.log(e);
			}
	});
}

//修改所選資料
function updateChosen(){
	$("#eng_name").val($("#target").text());

	$("#eng_index_area").hide();
	$("#eng_edit_area").show();

	$("#new_label").hide();
	$("#new_submit").hide();
	$("#edit_label").show();
	$("#edit_submit").show();

	$code = $("#chosen_code").val();
	if( $code.length == 6 ){
		$.ajax({
			url: configObject.engGetData,
			type: "POST",
			data: { type: "getUnitId", code: $code },
			dataType: "JSON",
			async: false,
			success:
				function(rs){
					// console.log(rs.data[0].typeid_u);
					$("#unit1").val(rs.data[0].typeid_u);
				},
			error:
				function(e){
					console.log(e);
				}
		});
		console.log($("#unit1")[0]);
		$("#unitSelection").show();
	}else{
		$("#unitSelection").hide();
	}		
}

function newData(){
	$("#eng_name").val("");

	$chosen = $("#chosen").html();
	$code = $("#chosen_code").val();
	if( $code.length == 6 ){
		alert("無法新增 "+$chosen+" 的子項目");
	}else{
		if( $code.length == 4 ){
			$("#unitSelection").show();
		}
		$("#eng_index_area").hide();
		$("#eng_edit_area").show();
	}
	$("#new_label").show();
	$("#new_submit").show();
	$("#edit_label").hide();
	$("#edit_submit").hide();	
}

function cancelNewData(){
	$("#eng_index_area").show();
	$("#eng_edit_area").hide();
}

//送出新增/修改資料
function sendData($type){
	switch($type){
		case "new":
			var $typeId;
			var $fCode;
			if($("#table_for_getTypeId").val()!=""){
				//取得所需typeId
				$.ajax({
					url: configObject.engGetData,
					type: "POST",
					data: { type: "getTypeId", table: $("#table_for_getTypeId").val(), code: $("#chosen_code").val() },
					dataType: "JSON",
					async: false,
					success:
						function(rs){
							//console.log(rs);
							$typeId = rs.dataArray["uid"];
							$fCode = rs.dataArray["code"];
						},
					error:
						function(e){
							console.log(e);
						}
				});
			}
			
			//新增資料
			$.ajax({
				url: configObject.engInsertData,
				type: "POST",
				data: { table: $("#table_for_insert").val(), 
						name: $("#eng_name").val(),
						//scode: $("#eng_scode").val(),
						typeid: $typeId,
						fCode: $fCode, 
						typeid_u: $("#unit1").val()
				},
				dataType: "JSON",
				async: false,
				success:
					function(rs){
						if(rs.status){
							alert("新增成功");
							location.reload();
						}else{
							// console.log(rs.msg);
							alert(rs.msg);
						}
					},
				error:
					function(e){
						console.log(e);
					}
			});
			break;
		case "edit":
			$.ajax({
				url: configObject.engUpdateData,
				type: "POST",
				data: { 
					table: $("#table_for_getTypeId").val(),
					ori_name: $("#target").text(),
					code: $("#chosen_code").val(),
					name: $("#eng_name").val(),
					unit: $("#unit1").val()
				},
				dataType: "JSON",
				async: false,
				success:
					function(rs){
						// console.log(rs);
						alert("修改成功");
						location.reload();
					},
				error:
					function(e){
						console.log(e);
					}
			});
			break;
		default:
	}
}
