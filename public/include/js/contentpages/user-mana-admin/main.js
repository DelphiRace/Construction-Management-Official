var sys_code = userLoginInfo.sysCode;
var userLoginUuid = userLoginInfo.uuid;
var userID = userLoginInfo.userID;

function getAddrInfo(uid){
     // 取地址資料
    var sendData = {
        api: "AssCommonAddress/GetData_AssCommonAddress",
        threeModal: true,
        data:{
            iCmid: uid, 
            iAddr_type: -1
        }
    }
    // $.getJSON(ctrlPersonAPI + "GetData_AssCommonAddress", {iCmid: uid, iAddr_type: -1} ).done(function(rs){
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        console.log(rs);
        $.each(rs.Data,function(index, content){
            $.each(content, function(cIndex, value){
                if(content.addr_type == 0){
                    $("#insertDialog").find("#census-content").find("#"+cIndex).val(value);   
                }else{
                    $("#insertDialog").find("#communication-content").find("#"+cIndex).val(value);   
                }
            });
            
        });
    });
}

function getOrgInfo(uid){
     // 先取得使用者資料
    var sendData = {
        api: "AssUser/GetData_AssUser",
        threeModal:true,
        data:{
            sys_code: sys_code,
            iUid: uid
        }
    }
     
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        // console.log(rs);
        // 取得部門資料
        var orgid = rs.Data[0].orgid;
        var jobid = rs.Data[0].posid;
        var sendData = {
            api: "AssOrg/GetData_AssOrg",
            threeModal:true,
            data:{
                sys_code: sys_code,
                iUid: orgid
            }
        };
        // putOrgInfo(putArea,jobPutArea, orgID,listID)
        
        $.getJSON(wrsUrl, sendData ).done(function(rs){
            if(jobid){
                var iOfid = rs.Data[0].officeid;

                // 取得職務資料
                var sendData = {
                    api: "AssPosition/GetData_AssPosition",
                    threeModal:true,
                    data:{
                        sys_code: sys_code,
                        iOfid: iOfid,
                        iOrgid: orgid,
                        iUid: jobid
                    }
                }
            
                $.getJSON(wrsUrl, sendData ).done(function(jobRs){
                    putOrgInfo( $("#insertDialog").find("#orgInfo"), $("#insertDialog").find("#orgJobInfo"), rs.Data[0], jobRs.Data[0]);

                });
            }else{
                putOrgInfo( $("#insertDialog").find("#orgInfo"), $("#insertDialog").find("#orgJobInfo"), rs.Data[0], null);

            }
        });
        

    });
}

// 新增&修改Dialog
function insertDialog(modifyObj, modifyItem){
    // console.log(modifyObj, modifyItem);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(modifyObj != undefined){
        title = "修改自然人資料";
        saveBtn = "修改";
    }else{
        title = "新增管理者自然人資料";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: title,
        headerCloseBtn: false,
        autoShow: true,
        start: function(){
          var option = {styleKind:"person",style:"in_mo"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);
            
            // 點選部門按鈕，可設置
            $(insertPageObj).find("#accountInfo").remove();
            $(insertPageObj).find(".list-items").eq(1).find(".control-label").eq(1).remove();
            
            var date = new Date();
            var nowYear = date.getFullYear();
            var dateOption = {
                    dateFormat: "yy-mm-dd",
                    
                    showOn: "button",
                    buttonText: '<i class="fa fa-calendar fa-lg mouse-pointer send-btn"></i>',
                    onSelect: function(dateText, inst) {
                        // end_date_content
                        $(insertPageObj).find("#birthday_content").removeClass("item-bg-danger").text(dateText);
                        $(insertPageObj).find("#birthday_window").hide();
                        $(insertPageObj).find("#birthday").val(dateText);
                    },
                    maxDate: 0,
                    changeYear: true,
                    yearRange: '1950:'+nowYear
                }

            $(insertPageObj).find("#birthdayBtn").click(function(){
                $(insertPageObj).find("#birthday_window").show();
            });
            $(insertPageObj).find("#birthday_window").datepicker(dateOption);

            // 身分證檢查
            $(insertPageObj).find("#sid").keyup(function(){
                var typeVal = $(this).val().toUpperCase();
                if(!checkSid(typeVal)){
                    $(this).removeClass("item-bg-danger").addClass("item-bg-danger");
                }else{
                    $(this).removeClass("item-bg-danger");
                }
                $(this).val(typeVal);
            });

            // 性別按下後去除紅色筐
            $(insertPageObj).find("#sexBtn label").click(function(){
                $(insertPageObj).find("#sexContent").removeClass("item-bg-danger").empty();
            });

            // 戶籍地點選亦同按鈕
            $(insertPageObj).find("#census-same").click(function(){
                var isCheck = $(this).prop("class").search("fa-check-square-o");
                if(isCheck == -1){
                    $(this).removeClass("fa-square-o").addClass("fa-check-square-o");
                    $(insertPageObj).find("#census-content input:text").each(function(){
                        var id = $(this).prop("id");
                        var value = $(this).val();
                        $(insertPageObj).find("#communication-content").find("#"+id).val(value);
                    });
                }else{
                    $(this).removeClass("fa-check-square-o").addClass("fa-square-o");
                }
            });

            $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));
            tabCtrl("insertDialog");
            // getQCTableTypeList("tableTypeTab","tableType",true);

          });
        },
        button:[
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    // 基本資訊
                    var userInfo = getUserInput("userInfo-content");
                    // 通訊地址
                    var census = getUserInput("census-content");
                    census.addr_type = 0;
                    // 通訊地址
                    var communication = getUserInput("communication-content");
                    communication.addr_type = 1;

                    if(modifyObj == undefined){
                        $("#grid").find(".data-empty").remove();
                    }
                    userInfo.sys_code = sys_code;
                    var sendObj = {
                        userInfo: userInfo,
                        census:census,
                        communication:communication,
                        // sys_code: sys_code
                    }

                    if(modifyObj != undefined){
                        sendObj.userInfo.uid = modifyObj.uid;
                        sendObj.userInfo.userID = modifyObj.userID;
                        sendObj.communication.cmid = modifyObj.uid;
                        sendObj.census.cmid = modifyObj.uid;
                    }
                    // console.log(sendObj);
                    // return;
                    var isEmpty = false;
                    $.each(userInfo, function(i, v){
                        if(i != "birthday" && i != "sex"){
                            if(!$.trim(v)){
                                $("#insertDialog").find("#"+i).addClass("item-bg-danger");
                                isEmpty = true;
                            }
                        }else{
                            if(i == "birthday"){
                                if(!$.trim(v)){
                                    $("#insertDialog").find("#birthday_content").text("尚未選擇生日").addClass("item-bg-danger");
                                    isEmpty = true;
                                }
                            }else if(i == "sex"){
                                if(v != "0" && v != "1"){
                                    $("#insertDialog").find("#sexContent").text("尚未選擇性別").addClass("item-bg-danger");
                                    isEmpty = true;
                                }
                            }
                        }
                    });
                    if(!isEmpty && checkSid(userInfo.sid)){
                        var positionStr = "";
                        // position add
                        $("#insertDialog").find("#postitonList").find(".positionBtn").each(function(){
                            var thisClass = $(this).prop("class");
                            if(thisClass.search("fa-check-square-o") != -1){
                                positionStr += $(this).data('uid')+",";
                            }
                        });
                        if(positionStr != ""){
                            positionStr = positionStr.substring(0, positionStr.length-1);
                        }
                        sendObj.userPosition = positionStr;
                        sendObj.userID = userID;
                        saveData(sendObj, modifyItem);
                    }
                    // console.log(sendObj);
                    // $("#insertDialog").bsDialog("close");
                }
            }
        ]
    });

}

// 儲存
function saveData(sendObj,modifyItem){
    method = "Insert_AssCommon";
    
    var sendData ={
        api: threeModelPersonAPI+method,
        threeModal: true,
        data: sendObj.userInfo
    };
    // 先新增自然人資料
    $.post(wrsUrl, sendData, function(rs){
        var rs = $.parseJSON(rs);

        // console.log(rs);
        // 新增
        if(rs.Status){

            if(sendObj.userInfo.uid == undefined){
                sendObj.userInfo.uid = rs.Data;
                sendObj.census.cmid = rs.Data;
                sendObj.communication.cmid = rs.Data;

                // putDataToPage(sendObj, true);
                // 地址修改ＡＰＩ
                addrMethod = "Insert_AssCommonAddress";
                acMethod = "Insert_AdminAssUser";
            }

            // 之後放入地址資料
            var sendData = {
                api: "AssCommonAddress/"+addrMethod,
                threeModal: true,
                data: sendObj.census
            }
            // $.post(ctrlPersonAPI + addrMethod, sendObj.census, function(addressRs){
            $.post(wrsUrl, sendData, function(addressRs){
                var addressRs = $.parseJSON(addressRs);

                if(addressRs.Status){
                    if(addrMethod == "Insert_AssCommonAddress"){
                        sendObj.census.uid = addressRs.Data;
                    }
                    var sendData = {
                        api: "AssCommonAddress/"+addrMethod,
                        threeModal: true,
                        data: sendObj.communication
                    };
                    // $.post(ctrlPersonAPI + addrMethod, sendObj.communication, function(oRs){
                    $.post(wrsUrl, sendData, function(oRs){
                        var oRs = $.parseJSON(oRs);

                        if(oRs.Status){

                            if(addrMethod == "Insert_AssCommonAddress"){
                                sendObj.communication.uid = oRs.Data;
                            }
                            
                            
                        }
                        // 測試
                        // acMethod = "Insert_AssUser";
                        var sendData = {
                            api: "AssUser/"+acMethod,
                            threeModal: true,
                            data: {
                                cmid: sendObj.userInfo.uid,
                                uuid: userLoginUuid,
                                sys_code: sys_code
                            }
                        };
                        // 放入帳號設置的部分
                        $.post(wrsUrl, sendData, function(rs){
                            var rs = $.parseJSON(rs);
                            if(rs.Status){
                                // userLoginInfo.userID = rs.Data;
                                $.post(configObject.setUserID,{userID: rs.Data},function(setRs){
                                    // var setRs = $.parseJSON(setRs);
                                    var sendData = {
                                        api: UpUserPostionAPI+"Update_UpUserPostion_User",
                                        data: {
                                            forUser: userLoginUuid.userID,
                                            userID: userLoginUuid.userID,
                                            up_posid: sendObj.userPosition
                                        },
                                        threeModal: true
                                    }
                                    $.post(wrsUrl, sendData, function(){
                                        location.href = location.origin + "/content.html";
                                    });
                                });
                                // location.href = location.origin + "/content.html";
                                // putDataToPage(sendObj.userInfo, true);
                            }
                        });
                    });
                }

            });
            
        }else{
            msgDialog(rs.msg);
        }
    });
}

function checkSid(value){
    var arr = value.split("");
    var letters = /^[A-Z]+$/;
    if(arr.length){
        if(!arr[0].match(letters)){
            return false;
        }
        var changeObj = {
            "A": 10,"B": 11,"C": 12,"D": 13,"E": 14,"F": 15,"G": 16,"H": 17,"I": 34,"J": 18,"K": 19,"L": 20,"M": 21,
            "N": 22,"O": 35,"P": 23,"Q": 24,"R": 25,"S": 26,"T": 27,"U": 28,"V": 29,"W": 32,"X": 30,"Y": 31,"Z": 33
        };
        var processNumber = {
            "1": 8, "2": 7, "3": 6, "4": 5, "5": 4, "6":3, "7":2, "8": 1, "9": 1
        }
        var count = 0;
        $.each(arr, function(i,v){
            if(i>0){
                count += v * processNumber[i];
            }else{
                var tmpStr = changeObj[v].toString();
                var tmpArr = tmpStr.split("");
                count += parseInt(tmpArr[0]);
                count += parseInt(tmpArr[1]) * 9;
            }
        });
        if(count % 10 != 0 || arr.length < 10){
            return false;
        }else{
            return true;
        }
    }
}