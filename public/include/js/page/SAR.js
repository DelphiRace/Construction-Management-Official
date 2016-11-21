function submitCheck(){
	if($("#ID").val()!=""){		
		$.ajax({
			url: configObject.SARGetworkerdata,
            type: "POST",
			data: { ID: $("#ID").val() },
			dataType: "JSON",
			async:false,
            success: 
				function(rs){
					// console.log(rs);
					if(rs.status){
						
						//顯示人員資料
						var $img = rs.sar.taxid + "/" + rs.sar.sid + ".jpg";
						$("#personal_img").attr("src","../include/workersAlbum/" + $img)
										  .attr("width", "180px")
										  .attr("height", "180px");
						
						switch(rs.info_type){
							case "worker":
								//塞入資料
								$("#name").text(rs.sar.name);
								$("#sex").text(rs.sar.sex);
								// $("#birthday").text(rs.sar.birthday.substring(0,4));
								
								//計算年齡
								var dateObj = new Date();
								var $age = dateObj.getFullYear() - parseInt(rs.sar.birthday.substring(0,4));
								$("#age").text($age);
								
								$("#type").text(rs.sar.work_name);
								$("#supply").text(rs.sar.su_name);
								
								//顯示
								$("#info").show();
								$("#worker_info").show();
								$("#employee_info").hide();
								
								break;
							case "employee":
								
								//塞入資料
								$("#name").text(rs.sar.name);
								$("#sex").text(rs.sar.sex);
								$("#birthday").text(rs.sar.birthday);
								$("#org").text(rs.sar.office_name);
								$("#position").text(rs.sar.position_name);
								
								//顯示
								$("#info").show();
								$("#employee_info").show();
								$("#worker_info").hide();
								
								break;
							default:
						}

						//紀錄出勤時間
						//console.log($("#switch_type").val());
						recordAttendance($("#switch_type").val());
						
					}else{
						$("#name").text("");
						$("#sex").text("");
						$("#birthday").text("");
						$("#type").text("");
						$("#supply").text("");
						$("#info").hide();
						$("#worker_info").hide();
						$("#employee_info").hide();
						$("#check").hide();
						$("#uncheck").hide();
						$("#in").hide();
						$("#out").hide();
						alert(rs.msg);
					} 
					$("#ID").val("");
					$("#ID").focus();
				},
            error: 
				function(e){
					//location.reload();
					console.log(e);
				}
        });
    }else{
		alert("請輸入身分證字號");
	}
}

function recordAttendance($check_type){
	$.ajax({
		url: configObject.SARRecordAttendance,
        type: "POST",
		data: { ID: $("#ID").val(),
				check_type: $check_type 
				},
		dataType: "JSON",
		async:false,
        success: 
			function(rs){
				//console.log(rs);
				$("#check").show();
				$("#uncheck").hide();
				switch($check_type){
					case "1":
						$("#in").show();
						$("#out").hide();
						break;
					case "2":
						$("#out").show();
						$("#in").hide();
						break;
					default:
				}
			},
        error: 
			function(e){
				$("#uncheck").show();
				$("#check").hide();
				console.log(e);
			}
	});
}

function runScript(e){
    if (e.keyCode == 13) {
       $("#ID_check").click();
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