//製作臨時卡選單
getTmpCardSelectList();

$("[name='switch']").bootstrapSwitch({
	onText: "進場",
	offText: "出場",
	onSwitchChange: function(e,status){
		var nowStatus = (status) ? 1 : 2;
		$("#switch_type").val(nowStatus);
	}
});

//使用者資訊區隱藏
$("#userInfo,#userInfoLine").hide();
//待顯示後，再把焦點放在輸入窗
setTimeout(function(){
	$("#ID").focus();
},500);

$(".tab-area").hide();

//拍照按鈕
$("#snap").hide();
//相機區域
$("#video").hide();
//拍照顯示區
$("#canvas").hide();
//儲存按鈕
$("#saveCardInfo").hide();

//啟動相機
$("#camera").click(function(){
	$("#snap").show();
	$(this).hide();
	$("#video").show();
	//拍照顯示區
	$("#canvas").hide();
	//儲存按鈕
	$("#saveCardInfo").hide();
});

//臨時卡選單
$("#menuList").click(function(){

	$("#tmpCardMenu").css({
		width: 105
	}).toggle();
});


//拍照按鈕按下後
$("#snap").click(function(){
	$("#canvas").show();
	$("#camera").show();
	$(this).hide();
	$("#video").hide();
	//儲存按鈕
	$("#saveCardInfo").show();
});

function getTmpCardSelectList(){
	//製作臨時卡選單
	$.getJSON(configObject.cardinfo,{},function(data){
		if(data.status){
			var rsContent = data.tc_data;
			$.each(rsContent,function(i,v){
				var options = '<option value="'+v.uid+'">'+v.number+'</option>';
				$("#cameraArea").find("#card_id").append(options);
			});		
		}
		console.log(data);
	});
}

function toSaveCardInfo(){
	var userInput = getUserInput("tmpCardForUser");
	userInput.img_txt = getCameraPhoto("canvas");
	console.log(userInput);
	$.post(configObject.tmpCardNewUser, userInput,function(rs){
		var processStatus = $.parseJSON(rs);
		console.log(processStatus);
		if(processStatus.status){
			$("#tmpCardForUser").find(".userInput").val("");
			//儲存按鈕
			$("#saveCardInfo").hide();
			clearCameraPhoto("canvas");
		}
	});
}

//卡片管理
function tmpCardMana(){
	//loadPage();
	tmpManaAreaProcess("tmpCardMana");
}

//資料管理
function tmpCardDataMana(){
	tmpManaAreaProcess("tmpCardDataMana");
}

//回臨時卡登記
function backTmpCardCheckin(){
	$("#tmpManaArea").hide();
	itemFade("cameraArea", true);
}

//資料管理區顯示與隱藏
function tmpManaAreaProcess(showArea){
	$("#menuList").click();
	$(".tmpManaArea,#cameraArea").hide();
	$("#tmpManaArea").show();
	itemFade(showArea, true);
	loader(showArea);
	loadPage("sar/"+showArea, showArea, false, true);
}

var firstToShow = $("#optionTabs").find(".active").prop("id");
$("#"+firstToShow+"-area").show();

$("#optionTabs").find("a").click(function(){
	$("#optionTabs").find("li").removeClass("active");
	$(".tab-area").hide();
	$(this).parent().addClass("active");
	var showID = $(this).parent().prop("id");
	$("#"+showID+"-area").show();
	return false;
});



function submitCheck(){
	var userID = $("#ID").val();
	if(userID != ""){		
		$.ajax({
			url: configObject.SARGetworkerdata,
            type: "POST",
			data: { ID: userID },
			dataType: "JSON",
            success: function(rs){
				if(rs.status){
					var sarData = rs.sar;
					//顯示人員資料
					//非已於畫面上之物件，勿使用$號
					var img = "include/workersAlbum/" + sarData.taxid + "/" + sarData.sid + ".jpg";
					$("#personal_img").prop("src",img);

					$("#userID").html(userID);

					//塞入資料
					$("#name").text(sarData.name);
					$("#sex").text(sarData.sex);
					//計算年齡
					var dateObj = new Date();
					//非已於畫面上之物件，勿使用$號
					var age = dateObj.getFullYear() - parseInt(sarData.birthday.substring(0,4));
					$("#age").text(age);
					
					$("#type").text(sarData.work_name);
					$("#supply").text(sarData.su_name);

					//顯示
					$("#userInfo,#userInfoLine").show();
					$(".worker_info").hide();
					$(".employee_info").hide();
					(rs.info_type == "worker") ? $(".worker_info").show() : $(".employee_info").show(); 
					//紀錄出勤時間
					//console.log($("#switch_type").val());
					recordAttendance( userID ,$("#switch_type").val() );
					
				}else{
					$(".readUserInfo").empty();
					$("#userInfo,#userInfoLine").hide();
					alert(rs.msg);
				} 
				$("#ID").val('').focus();
			},
            error: function(e){
				console.log(e);
			}
        });
    }else{
		alert("請輸入身分證字號");
	}
}

function recordAttendance(userID, check_type){
	$.ajax({
		url: configObject.SARRecordAttendance,
        type: "POST",
		data: { 
			ID: userID,
			check_type: check_type 
		},
		dataType: "JSON",
        success: 
			function(rs){
				//console.log(rs);
				$("#userStatus").text("已點名");
				var userAction = (check_type == "1") ? "進場" : "出場";
				$("#userAction").text("("+userAction+")");
			},
        error: 
			function(e){
				$("#userStatus").text("未點名");
				console.log(e);
			}
	});
}

function runScript(e){
    if (e.keyCode == 13) {
       //$("#ID_check").click();
		submitCheck();
    }
}

function reloadChart(){
	setTotalPeople();
		
	resetChart("SARChart");	
	var options = {
		url: configObject.SARReport,
		urlMethod: "POST",
		sendData: { date: $("#report_date").val().replace(/\//g,"-") },
		drawItemID: 'SARChart',
		unitTitle: "人次",
		bottomTitle: "工種",
		drawType: "ColumnChart", //drawType 可使用 ColumnChart、LineChart 兩種
		resultIndex: "data",
		annotation: true
	};
	createChart(options);
}

function setTotalPeople(){
	$.ajax({
		url: configObject.SARReport,
		type: "POST",
		data: { date: $("#report_date").val().replace(/\//g,"-") },
		dataType: "JSON",
		asyns: false,
		success:
			function(rs){
				if(rs.status){
					var $totalPeople = 0;
					for(var index in rs.data){
						$totalPeople += parseInt(rs.data[index].w_count);
					}
					if($totalPeople!=0){
						$("#totalPeople").html($totalPeople);
						$("#has_people").show();
						$("#SARChart").css("visibility", "visible");
						$("#no_people").hide();
					}else{
						$("#totalPeople").html("");
						$("#has_people").hide();
						$("#SARChart").css("visibility", "hidden");
						$("#no_people").show();
					}
				}else{
					$("#has_people").hide();
					$("#SARChart").css("visibility", "hidden");
					$("#no_people").show();
				}
			},
		error:
			function(e){
				console.log(e);
			}
	});
}