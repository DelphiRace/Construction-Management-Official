var userLoginInfo;
function checkUserLogin(){
	$.getJSON(configObject.getAcInfo,{},function(rs){
		if(!rs.status){
           location.href = location.origin;
		}else{
            if(location.search.search("select-sys") != -1 || location.search.search("user-mana%2Fadmin") != -1){
            	$(".topInfo").hide();
            }
            userLoginInfo = rs;

            if(rs.sysCode && rs.userID){
            	getUserPosition(rs.userID, rs);

       		}else{
       			if(rs.sysList.length == 1){
	            	setUserSysCode(rs.sysList[0]);
    	        }else if(rs.sysList.length > 1){

	       			if(location.search.search("select-sys") == -1){
	       				loadPage("select-sys/select-sys","pagescontent");
	       			}
        	    }
       		}
		}
	});
}

function setUserSysCode(sysCode){
	if(sysCode == undefined){
		msgDialog("系統代碼錯誤，無法取得資料！<br/>按下「關閉」後登出",false,function(){
			logoutEven();
		});
		return;
	}
	$.post(configObject.setSysCode,{sysCode:sysCode},function(rs){
		// console.log(rs);
		var rs = $.parseJSON(rs);

		if(!rs.status){
			msgDialog("系統代碼錯誤，請重新登入");
	        logoutEven();
		}else{
			// // 是管理者
			// if(userLoginInfo.isAdmin){
			// 	$("#nav").show();
   //     			//取得選單
   //     			getMenus(rs);
			// 	loadPage("home","pagescontent");
			// }else{
			// 	// 一般使用者，看是否要選擇專案
			// }
			userLoginInfo.sysCode = sysCode;
			userLoginInfo.userID = rs.userID;
			userLoginInfo.userName = rs.userName;
			userLoginInfo.orgid = rs.orgid;
			userLoginInfo.posid = rs.posid;
			userLoginInfo.isSuperiors = rs.isSuperiors;
			userLoginInfo.sc = rs.sc;
			userLoginInfo.haveOrgs = rs.haveOrgs;
			userLoginInfo.haveOrgUnit = rs.haveOrgUnit;
			if(rs.userID){
				getUserPosition(rs.userID, rs, true);
			}else if(userLoginInfo.isAdmin && rs.userID == null){
				$("#nav").hide();
				loadPage("user-mana/admin","pagescontent");
			}else{
				msgDialog("帳號設置有誤，請聯絡管理員");
				logoutEven();
			}
			
		}
	});
}

function userNameBarInfo(sysCode){
	//重新整理的小圈
	var refreshBtn = $("<i>").addClass("fa fa-refresh mouse-pointer send-btn item-margin-left");
	var nameBar = $('<span>').addClass("userNameInfo").text(userLoginInfo.userName);
	refreshBtn.click(function(){
		setUserSysCode(sysCode);
	});
	$(".user-name").empty().append(nameBar,refreshBtn);
}

function getUserPosition(userID, setSysCodeInfo, toSet){

	if(toSet == undefined){
		toSet = false;
	}
	var sendData = {
		api: "UpUserPostion/VerifyData_UpUserPostion",
		data:{
			userID: userID,
		},
		threeModal: true
	};

	$.post(wrsUrl, sendData, function(rs){
		rs = $.parseJSON(rs);
		if(rs.Status){
			userLoginInfo.userPosition = rs.Data;
		}else{
			userLoginInfo.userPosition = [];
		}
		if(toSet){
			// 當admin使用者資料已有，則導入
			if(setSysCodeInfo.userID){
				$(".topInfo").show();
				userNameBarInfo(userLoginInfo.sysCode);
	   			//取得選單
	   			getMenus(setSysCodeInfo);
				setSocket();
				
			}else if(userLoginInfo.isAdmin){
				if(location.search.search("user-mana%2Fadmin") == -1){
					loadPage("user-mana/admin","pagescontent");
				}
			}else{
				msgDialog("帳號設置有誤，請聯絡管理員");
				logoutEven();
			}
		}else{
			userNameBarInfo(setSysCodeInfo.sysCode);
   			//取得選單
   			getMenus(setSysCodeInfo);
   			// 連線socket
			setSocket();
		}

		// 先判斷是否有新增過組織
		if(userLoginInfo.isAdmin){
			guideUserToCreateOrgOrJob();
		}
		// loadPage("home","pagescontent");
	});
}

function guideUserToCreateOrgOrJob(){
	// 沒有組織
	if(!userLoginInfo.haveOrgUnit){
		var option = {
			closeCall: function(){
				var msg = "您仍可透過選單 -「設定」>「組織」>「部門科室」前往設定";
				msgDialog(msg, false);
			},
			sureCall: function(){
				loadPage("org-unit/org-list","pagescontent");
			},
			sureText: "前往「部門科室」設定",
			closeText: "關閉",
			sureClass: "btn-success",
			title: "提示訊息"
		};
		var msg = "您尚未透過「部門科室」設置過任何部門資訊，因此「組織架構」無法建立<br/>";
		msg += "是否要前往「設定」>「組織」>「部門科室」設定？<br/>";
		chooseDialog(msg, option);
	}else if(userLoginInfo.haveOrgUnit && !userLoginInfo.haveOrgs){
		var option = {
			closeCall: function(){
				var msg = "您仍可透過選單 -「設定」>「組織」>「組織架構」前往設定";
				msgDialog(msg, false);
			},
			sureCall: function(){
				loadPage("org-tree/tree","pagescontent");
			},
			sureText: "前往「組織架構」設定",
			closeText: "關閉",
			sureClass: "btn-success",
			title: "提示訊息"
		};
		var msg = "您尚未透過「組織架構」設置過任何組織<br/>";
		msg += "是否要前往「設定」>「組織」>「組織架構」設定？<br/>";
		chooseDialog(msg, option);
	}
}