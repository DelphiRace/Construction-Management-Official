$(function(){
	$("#birthday").datepicker({
		dateFormat: 'yy/mm/dd'
	});
	
	if($("#relation :selected").val() != 11){
		$("#relation1").hide();
	}
	
	$("#relation").change(function(){
		if( $(this).val()==11 ){
			$("#relation1").show();
		}else{
			$("#relation1").hide();
			$("#relation1").val("");
		}
	});
});

function edit(action, uid){
	// alert(uid);
	var domainUrl = "http://211.21.170.18";
	// var domainUrl = "http://127.0.0.1";
	var directurl = domainUrl + ":200/employeemanage/editpage";
	myRedirect(directurl, "action", action, uid);
}

function checkSubmit(action,uid){
	
	var domainUrl = "http://211.21.170.18";
	// var domainUrl = "http://127.0.0.1";

	var actionUrl;
	switch(action){
		case "insertData":
			actionUrl = configObject.empInsertData;
			// actionUrl = "http://127.0.0.1:99/employeemanage/insertdata";
			break;
		case "updateData":
			actionUrl = configObject.empUpdateData + "?uid=" + uid;
			// actionUrl = "http://127.0.0.1:99/employeemanage/updatedata?uid="+uid;
			break;
	}
		
	// console.log($("#data").serialize());
	var dataArray = getData(decodeURIComponent($("#data").serialize(),true));
	// console.log(dataArray);
	//console.log( $("#relation :selected").val() );
	var emptyMsg = checkEmpty(dataArray);
	if( emptyMsg.length == 0 ){	//檢查是否有欄位未填
		$.ajax({
			// url: configObject.SARRecordAttendance,
			url: actionUrl,
			type: "POST",
			data: { name: dataArray[0][1],
					sid: dataArray[1][1],
					sex: dataArray[2][1],
					birthday: dataArray[3][1],
					zip: dataArray[4][1],
					city: dataArray[5][1],
					area: dataArray[6][1],
					vil: dataArray[7][1],
					verge: dataArray[8][1],
					road: dataArray[9][1],
					addr: dataArray[10][1],
					belong: dataArray[11][1],
					relation1: dataArray[12][1],
					mobile: dataArray[13][1],
					tel_h: dataArray[14][1],
					tel_o: dataArray[15][1],
					tel_ext: dataArray[16][1],
					email: dataArray[17][1],
					relation: $("#relation :selected").val() },
			dataType: "JSON",
			async:false,
			success: 
				function(rs){
					window.location.href = domainUrl + ":200/employeemanage";
				},
			error: 
				function(e){
					console.log(e);
				}
		});
	}else{
		alert(emptyMsg);
	}
}

function myRedirect(redirectUrl, arg, value, uid) {
	var form;
	if(uid != ""){
		form = $('<form action="' + redirectUrl + '" method="post">' +
			'<input type="hidden" name="'+ arg +'" value="' + value + '"></input>' + 
			'<input type="hidden" name="uid" value="' + uid + '"></input>' + '</form>');
	}else{
		form = $('<form action="' + redirectUrl + '" method="post">' +
			'<input type="hidden" name="'+ arg +'" value="' + value + '"></input>' + '</form>');
	}
	$('body').append(form);
	$(form).submit();
};

function getData(ori_arr){	
	var arr = ori_arr.split("&");
	// console.log(arr[0]);
	
	var arr2 = new Array();
	for(var index in arr){
		// console.log(arr[index]);
		arr2[index] = arr[index].split("=");
	}
	// console.log(arr2);
	
	return arr2;
}

function checkEmpty(dataArray){
	//var hasEmpty = true;
	var msg = "";
	/*for(var index in dataArray){
		if(dataArray[index][1]==""){
			return hasEmpty;
		}
	}*/
	if( dataArray[0][1] == "" ){
		msg += "姓名未輸入\n";
	}
	if( dataArray[1][1] == "" ){
		msg += "身分證未輸入\n";
	}
	if( dataArray[2][1] == "" ){
		msg += "性別未選擇\n";
	}
	if( dataArray[3][1] == "" ){
		msg += "生日未輸入\n";
	}
	
	// if( msg == "" ){
		// hasEmpty = false;
	// }
	//hasEmpty = false;
	//return hasEmpty;
	return msg;
}