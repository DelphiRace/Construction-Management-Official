function orgTreeDialog(content, pageObjArea){
    $("#orgTreeDialog").remove();
    var orgTreeDialog = $("<div>").prop("id","orgTreeDialog");
    var orgChart = $("<div>").prop("id","orgTreeChart").addClass("modal-items");
    orgChart.appendTo(orgTreeDialog);
    orgTreeDialog.appendTo("body");

    $("#orgTreeDialog").bsDialog({
        title: "請選擇分文部門",
        modalClass: "bsDialogWindow",
        autoShow: true,
        start: getOrgData("orgTreeChart"),
        button:[
            {
                text: "確定",
                className: "btn-success",
                click: function(){
                    var data = orgTreeChart.getSelectData();
					saveOffice(content, data.idStr, pageObjArea);
                }
            }
        ]
    });
}
// 使用者列表
function userListData(content, pageObjArea){
    var sendObj = {
        api: "AssUser/GetData_OrgAssUser",
        threeModal: true,
        data:{
            sys_code: sys_code,
            userID: userID
        }
    }
    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Data){
            userListDialog(rs.Data ,content, pageObjArea);
        }else{
            msgDialog("無法取得使用者列表");
        }
    });
}
// sys_code
// userID
function userListDialog(data ,content, pageObjArea){
    $("#userListDialog").remove();
    var userListDialog = $("<div>").prop("id","userListDialog");
    userListDialog.appendTo("body");
    var userListDialog = $("#userListDialog").bsDialogSelect({
        autoShow:true,
        showFooterBtn:true,
        headerCloseBtn:false,
        // modalClass: "bsDialogWindow",
        title: "設定承辦人員",
        data: data,
        textTag: "name",
        valeTag: "uid",
        button:[
            // {
            //     text: "取消",
            //     // className: "btn-success",
            //     click: function(){
                
            //         $("#userListDialog").bsDialog("close");
                    
            //     }
            // },
            {
                text: "下一步",
                className: "btn-success",
                click: function(){
                    var userIDList = userListDialog.getValue();
                    sendData = {};
                    sendData.userIDList = userIDList;
                    sendData.uid = content.uid;
                    if(userIDList){
                        setReferenceDateDailog(sendData, pageObjArea, content);
                        // $("#userListDialog").bsDialog("close");
                    }else{
                        msgDialog("尚未選擇使用者"); 
                    }
                }
            }
        ]
    });
}

// 使用者列表
function addUserListData(infoPutArea, valuePutArea, selectData, contractors){
    if(contractors == undefined){
        contractors = false;
    }
    var sendObj = {
        api: "AssUser/GetData_OrgAssUser",
        threeModal: true,
        data:{
            sys_code: sys_code,
            userID: userID,
            contractors: contractors
        }
    }
    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Data){
            userAddDialog(rs.Data ,infoPutArea, valuePutArea, selectData);
        }else{
            msgDialog("無法取得使用者列表");
        }
    });
}

// 新增使用者
function userAddDialog(data, infoPutArea, valuePutArea, selectData){
    $("#userListDialog").remove();
    var userListDialog = $("<div>").prop("id","userListDialog");
    userListDialog.appendTo("body");
    var userListDialog = $("#userListDialog").bsDialogSelect({
        autoShow:true,
        showFooterBtn:true,
        headerCloseBtn:false,
        // modalClass: "bsDialogWindow",
        title: "選擇使用者",
        data: data,
        selectData: selectData,
        textTag: "name",
        valeTag: "uid",
        button:[
            // {
            //     text: "取消",
            //     // className: "btn-success",
            //     click: function(){
                
            //         $("#userListDialog").bsDialog("close");
                    
            //     }
            // },
            {
                text: "確定",
                className: "btn-success",
                click: function(){
                    var userIDList = userListDialog.getValue();
                    var userIDListText = userListDialog.getText();
                    $(valuePutArea).val(userIDList);
                    
                    $("#userListDialog").bsDialog("close");
                    if(userIDList){

                        $(infoPutArea).text(userIDListText);
                        $(infoPutArea).removeClass("item-bg-danger");
                        // $(infoPutArea).text(userIDListText);
                        // $(valuePutArea).val(userIDList);
                        // $("#userListDialog").bsDialog("close");
                    }else{
                        $(infoPutArea).empty().text("-");
                    }
                    // else{
                    //     msgDialog("尚未選擇使用者"); 
                    // }
                }
            }
        ]
    });
}

// 儲存發文指派
function saveOffice(content, officeId, pageObjArea){
    var sendData = {
        api: referenceAPI+"setReferenceOffice",
        data:{
            uid:content.uid,
            officeId:officeId,
            userId: userID
        }
    };
    $.post(wrsUrl,sendData,function(rs){
        var rs = $.parseJSON(rs);
        if(rs.status){
            // msgDialog(rs.Message, false);
            msgDialog("分文成功", false);
            // 重新讀取這筆資料
            renewListData(pageObjArea, content);
            $("#orgTreeDialog").bsDialog('close');
        }else{
            msgDialog(rs.Message);
        }
        // console.log(rs);
    });
}

// 指派＆設置預警後存取
function saveDesignate(uid,pricipalId,endDate, pageObjArea, content){
	var sendData = {
        api: referenceAPI+"setReferenceDesignate",
        data:{
            uid:uid,
            pricipalId:pricipalId,
			endDate:endDate
        }
    };
    $.post(wrsUrl,sendData,function(rs){
        var rs = $.parseJSON(rs);
        if(rs.status){
            msgDialog(rs.Message, false);
            // 重新讀取這筆資料
            renewListData(pageObjArea, content);
            $("#userListDialog").bsDialog('close');
            $("#setReferenceDateDailog").bsDialog('close');
        }else{
            msgDialog(rs.Message);
        }
    });
}


// 設定預警日期
function setReferenceDateDailog(sendData, pageObjArea, content){
    $("#setReferenceDateDailog").remove();
    $("#signInfoAndDateDialog").remove();
    
    $("<div>").prop("id","setReferenceDateDailog").appendTo("body");

    $("#setReferenceDateDailog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        // headerCloseBtn:false,
        // modalClass: "bsDialogWindow",
        title: "設置預警日期",
        start: function(){
            var option = {
                styleKind: "received-issued",style:"undertake-dateandtype"
            }
            getStyle(option,function(pageStyle){
                var pageStyleObj = $.parseHTML(pageStyle);

                $(pageStyleObj).find(".list-items").eq(0).find(".control-label").eq(0).text("設置預警日期");
                
                $(".ui-datepicker").remove();
                var dateOption = {
                    dateFormat: "yy-mm-dd",
                    onSelect: function(dateText, inst) {
                        $(pageStyleObj).find("#end_date_content").removeClass("item-bg-danger").text(dateText);
                        $(pageStyleObj).find("#endDateSelect").hide();
                        $(pageStyleObj).find("#end_date").val(dateText);
                        
                    },
                    minDate: 0
                };
                $(pageStyleObj).find("#endDateSelect").hide().datepicker(dateOption);
                
                $(pageStyleObj).find("#end_calendar").click(function(){
                    $(pageStyleObj).find("#endDateSelect").toggle();
                });

                $(pageStyleObj).appendTo($("#setReferenceDateDailog").find(".modal-body"));
            });
        },
        button:[
            {
                text: "返回",
                // className: "btn-success",
                click: function(){
                
                    $("#setReferenceDateDailog").bsDialog("close");
                    
                }
            },
            {
                text: "設定",
                className: "btn-success",
                click: function(){
                    var end_date = $("#setReferenceDateDailog").find("#end_date").val();
                    sendData.end_date = end_date;

                    if(end_date){
                        saveDesignate(sendData.uid,sendData.userIDList,end_date, pageObjArea, content);
                    }else{
                        $("#setReferenceDateDailog").find("#end_date_content").text("尚未選擇日期").addClass("item-bg-danger");
                        msgDialog("尚未選擇日期");
                    }
                }
            }

        ]
    });
}
// 會簽
function countersignOrgTreeDialog(sendObj, modifyItem, putFormArea, isReDispatch){
    $("#orgTreeDialog").remove();
    var orgTreeDialog = $("<div>").prop("id","orgTreeDialog");
    var orgChart = $("<div>").prop("id","orgTreeChart").addClass("modal-items");
    orgChart.appendTo(orgTreeDialog);
    orgTreeDialog.appendTo("body");

    $("#orgTreeDialog").bsDialog({
        title: "請選擇會簽部門",
        modalClass: "bsDialogWindow",
        autoShow: true,
        start: getOrgData("orgTreeChart", false),
        button:[
            {
                text: "確定",
                className: "btn-success",
                click: function(){
                    var data = orgTreeChart.getSelectData();
                    if(data.idStr){
                        sendObj.wfData = data.idStr;
                        sendObj.orgid = userLoginInfo.orgid;

                        var selectName = "";
                        $.each(data.pageObj, function(i,v){
                            selectName += "「"+v+"」、";
                        });
                        // console.log(sendObj);
                        selectName = selectName.substring(0, selectName.length - 1);
                        var option = {
                          sureCall: function(){
                            saveSignData(sendObj, modifyItem, putFormArea, isReDispatch);
                          },
                          sureText: "確認",
                          closeText: "取消",
                          title: "提示訊息"
                        };
                        var msg = "您選擇"+selectName+"進行會簽，確認後開始會簽";
                        chooseDialog(msg, option);
                        
                    }else{
                        msgDialog("尚未選擇部門");
                    }
                }
            }
        ]
    });
}
