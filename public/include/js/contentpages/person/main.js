var sys_code = userLoginInfo.sysCode;
var testData = [];
var userLoginUuid = userLoginInfo.uuid;
var orgTreeChart;
var jobTreeChart;
var jobData = [];
$(function(){
    getOUData();
});
// 取得資料
function getOUData(uid){
    // var sendData = {}
    var sendData = {
        api: "AssCommon/GetData_AssCommon",
        threeModal: true,
        data:{
            "sys_code": sys_code
        }
    };
    if(uid != undefined){
        sendData.data.iUid = uid;
    }
    loader($("#grid"));
    // ＡＰＩ呼叫
    getPageListData(sendData, function(rs){
        $("#grid").empty();
        if(rs.Status){
            if(uid == undefined){
                putDataToPage(rs.Data);
            }else{
                // insertDialog(uid,name);
            }
        }else{
            // 放入空的
            putEmptyInfo($("#grid"));
        }
        // console.log(rs);
    });
    // .fail(function(){
    //     $("#grid").empty();
    //     // 放入空的
    //     putEmptyInfo($("#grid"));
    // });
}

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
        if(rs.status){
            $.each(rs.Data,function(index, content){
                $.each(content, function(cIndex, value){
                    if(content.addr_type == 0){
                        $("#insertDialog").find("#census-content").find("#"+cIndex).val(value);   
                    }else{
                        $("#insertDialog").find("#communication-content").find("#"+cIndex).val(value);   
                    }
                });
            });
        }
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
        if(orgid){
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
                        if(jobRs.Status){
                            putOrgInfo( $("#insertDialog").find("#orgInfo"), $("#insertDialog").find("#orgJobInfo"), rs.Data[0], jobRs.Data[0]);
                        }else{
                            putOrgInfo( $("#insertDialog").find("#orgInfo"), $("#insertDialog").find("#orgJobInfo"), rs.Data[0], null);
                        }
                    });
                }else{
                    putOrgInfo( $("#insertDialog").find("#orgInfo"), $("#insertDialog").find("#orgJobInfo"), rs.Data[0], null);

                }
            });
        }
    });
}

// 放資料
function putDataToPage(data){
    if(typeof onlyData == "undefined"){
        onlyData = false;
    }
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"person",style:"list"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        $.each(data,function(index,content){
            putDataOption($("#grid"), pageStyle, content);
        });
        
        $("#grid").find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}
// 放資料
function putDataOption(putArea, pageStyle, content, replace, isNew){
    if(replace == undefined) {
        replace = false;
    }
    var pageStyleObj = $.parseHTML(pageStyle);

    $(pageStyleObj).addClass("dataContent");
    var firstItem = $(pageStyleObj).find(".list-items").eq(0);
    firstItem.html(content.name);
    var isAdminCaption = $(pageStyleObj).find(".list-items").eq(1);

    if(!parseInt(content.is_admin)){
        isAdminCaption.text("一般使用者");
    }else{
        isAdminCaption.text("管理者");
        $(pageStyleObj).find(".fa-ban").remove();
    }

    // 修改
    $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
        // console.log(content);
        // 取地址資料
        insertDialog(content, firstItem);
        getAddrInfo(content.uid);
        getOrgInfo(content.userID);
    });

    // 停權按鈕
    if(parseInt(content.suspend)){
        $(pageStyleObj).find(".fa-ban").removeClass("ban-not");
    }

    // 停權
    $(pageStyleObj).find(".fa-ban").click(function(){
        if($(this).prop("class").search("ban-not") != -1){
            suspendData(content.uid, $(pageStyleObj));
        }else{
            unsuspendData(content.uid, $(pageStyleObj));
        }
    });

    if(!replace){
        if(isNew){
            $(pageStyleObj).removeClass("list-items-bottom");
            putArea.find(".dataContent").last().addClass("list-items-bottom");
        }
        $(pageStyleObj).appendTo(putArea);
    }
}

// 新增&修改Dialog
function insertDialog(modifyObj, modifyItem){
    // console.log(modifyObj);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(modifyObj != undefined){
        title = "修改自然人資料";
        saveBtn = "修改";
    }else{
        title = "新增自然人資料";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");
    // 身分證是否有被使用過
    var sidIsNotUse;
    $("#insertDialog").bsDialog({
        title: title,
        autoShow: true,
        start: function(){

          var option = {styleKind:"person",style:"in_mo"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);
            //取得權限 
            positionID = 1;
            if(modifyObj != undefined){
                modifySetPositionBtn(positionID, modifyObj.userID, $(insertPageObj));
            }else{
                modifySetPositionBtn(positionID, null, $(insertPageObj));
            }
            
            // 點選部門按鈕，可設置
            $(insertPageObj).find(".fa-sitemap").click(function(){
                orgChartDialog( $(insertPageObj).find("#orgInfo"), $(insertPageObj).find("#orgJobInfo"));
            });

            var date = new Date();
            var nowYear = date.getFullYear();
            var dateOption = {
                dateFormat: "yy-mm-dd",
                
                showOn: "button",
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
            if(modifyObj != undefined){
                dateOption.defaultDate = modifyObj.birthday;
                $(insertPageObj).find("#birthday_content").text(modifyObj.birthday);
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
                    var removeAreaColor = $(this);
                    var url = wrsAPI + "userVerifyAPI/verifyUserAccountBySID";
                    var sendData = {
                        sid: typeVal,
                        uuid: userLoginUuid
                    };
                    var isNotUse = false;
                    $.ajax({
                        url: url,
                        type: "POST",
                        data: sendData,
                        dataType: "json",
                        success: function(rs){
                            if(rs.status){
                                removeAreaColor.removeClass("item-bg-danger");
                                sidIsNotUse = true;
                            }else{
                                removeAreaColor.removeClass("item-bg-danger").addClass("item-bg-danger");
                                sidIsNotUse = false;
                            }
                        }
                    });
                    
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

            // 修改
            if(modifyObj != undefined){
                // 如果是管理員，先把帳號資訊先拿掉
                if(parseInt(modifyObj.is_admin)){
                    $(insertPageObj).find("#accountInfo-content").find(".list-items").eq(0).remove();
                }
                $.each(modifyObj, function(index,content){
                    if(index != "sex" ){
                        $(insertPageObj).find("#"+index).val(content);
                    }else{
                        $(insertPageObj).find("[name=sex][value=" + content + "]").attr("checked",true).parent().addClass("active");
                    }
                });
                var account = $(insertPageObj).find("#sid").val();
                $(insertPageObj).find("#accountContent").text(account);
            }else{
                // 新增
                $(insertPageObj).find("#sid").keyup(function(){
                    var account = $(this).val();
                    $(insertPageObj).find("#accountContent").text(account);
                });
            }
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
                    $.blockUI();
                    // 基本資訊
                    var userInfo = getUserInput("userInfo-content");
                    // 通訊地址
                    var census = getUserInput("census-content");
                    census.addr_type = 0;
                    // 通訊地址
                    var communication = getUserInput("communication-content");
                    communication.addr_type = 1;

                    // 取得部門&職務資訊
                    var accountInfo = getOrgVal();


                    if(modifyObj == undefined){
                        $("#grid").find(".data-empty").remove();
                    }
                    userInfo.sys_code = sys_code;
                    var sendObj = {
                        userInfo: userInfo,
                        census:census,
                        communication:communication,
                        org: accountInfo,
                        // sys_code: sys_code
                    }

                    if(modifyObj != undefined){
                        sendObj.userInfo.uid = modifyObj.uid;
                        sendObj.userInfo.userID = modifyObj.userID;
                        sendObj.communication.cmid = modifyObj.uid;
                        sendObj.census.cmid = modifyObj.uid;
                        sendObj.org.cmid = modifyObj.uid;
                    }

                    var isEmpty = false;
                    $.each(userInfo, function(i, v){
                        if(i != "birthday" && i != "sex" && i != "sid"){
                            if(!$.trim(v)){
                                $("#insertDialog").find("#"+i).addClass("item-bg-danger");
                                isEmpty = true;
                            }else{
                                $("#insertDialog").find("#"+i).removeClass("item-bg-danger");
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
                    if(!isEmpty){
                        if(!sendObj.org.org.length){
                            isEmpty = true;
                            $("#accountInfo").click();
                            // alert("帳號設定 > 尚未選擇部門");
                            var emptySelect = $("<div>").addClass("item-bg-danger emptySelect").text("尚未選擇部門");
                            $("#insertDialog").find("#orgInfo").append(emptySelect);
                        }
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
                    }
                    $.unblockUI();
                    // return;
                    if(!isEmpty && modifyObj == undefined && checkSid(userInfo.sid) && sidIsNotUse){
                        saveData(sendObj, modifyItem);
                    }else if(!isEmpty && modifyObj != undefined){
                        sendObj.isAdmin = parseInt(modifyObj.is_admin);
                        saveData(sendObj, modifyItem);
                    }
                }
            },
            
        ]
    });

}

// 儲存
function saveData(sendObj,modifyItem){
    $.blockUI();
    sendObj.uuid = userLoginUuid;
    sendObj.sys_code = sys_code;
    var isAdmin = sendObj.isAdmin;
    delete sendObj.isAdmin;
    var method = "Insert_AssUserComplex";
    if(sendObj.userInfo.uid != undefined){
        method = "Update_AssUserComplex";
        modifyItem.html(sendObj.userInfo.name);
    }
    $.post(wrsAPI+"userRegisteredAPI/"+method, sendObj, function(rs){
        var rs = $.parseJSON(rs);
        if(rs.Status){
            if(isAdmin){
                setUserSysCode(sys_code);
            }
            if(sendObj.userInfo.uid == undefined){
                getUidData(rs.cmid, function(listStyle, data){

                    putDataOption($("#grid"), listStyle, data[0], false, true);
                });
            }
            $("#insertDialog").bsDialog("close");
            // getOUData();
            // msgDialog("",false);

        }else{
            msgDialog(rs.msg);
        }
        $.unblockUI();

    });
}

// 停權
function suspendData(uid, suspendItem){
    var sendData = {
        api: threeModelPersonSuspendAPI,
        threeModal: true,
        data:{
            uid: uid
        }
    };
    
    $.ajax({
        url: wrsUrl,
        type:"POST",
        data: sendData,
        dataType: "json",
        success:function(rs){
            if(!rs.Status){
                // 無法刪除
                // couldNotDeleteDialog(name);
                msgDialog(rs.errMsg || rs.msg);
            }else{
                // removeItem.remove();
                msgDialog(rs.errMsg || rs.msg, true);
                suspendItem.find(".fa-ban").removeClass("ban-not");
                
            }
        },
        error:function(rs){
            msgDialog(rs.errMsg || rs.msg);
        }
    });
}

// 解除停權
function unsuspendData(uid, suspendItem){
    var sendData = {
        api: threeModelPersonUnsuspendAPI,
        threeModal: true,
        data:{
            uid: uid
        }
    };
    
    $.ajax({
        url: wrsUrl,
        type:"POST",
        data: sendData,
        dataType: "json",
        success:function(rs){
            if(!rs.Status){
                // 無法刪除
                // couldNotDeleteDialog(name);
                msgDialog(rs.errMsg || rs.msg);
            }else{
                // removeItem.remove();
                msgDialog(rs.errMsg || rs.msg, true);
                if(suspendItem.find(".fa-ban").prop("class").search("ban-not") == -1){
                    suspendItem.find(".fa-ban").addClass("ban-not");
                }
            }
        },
        error:function(rs){
            msgDialog(rs.errMsg || rs.msg);
        }
    });
}

// 當無法刪除時，提供說明
function couldNotDeleteDialog(name){
    $("#couldNotDeleteDialog").remove();
    $("<div>").prop("id","couldNotDeleteDialog").appendTo("body");

    $("#couldNotDeleteDialog").bsDialog({
        start: function(){
            var string = name+" 已被使用為組織上層，故無法刪除";
            $("#couldNotDeleteDialog").find(".modal-body").html(string);
        },
        button:[
            {
                text: "關閉",
                className: "btn-danger",
                click: function(){
                    $("#couldNotDeleteDialog").bsDialog("close");
                }
            }
        ]
    });

}

// 取得設定的部門資料
function getOrgVal(){
    userOrg = {};
    var orgArr = [];
    $("#insertDialog").find("#accountInfo-content").find(".org").each(function(){
        orgArr.push( $(this).val() );
    });
    var orgJobArr = [];

    // 取得設定的職務資料
    $("#insertDialog").find("#accountInfo-content").find(".jobItemContent").each(function(){
        orgJobArr.push( $(this).val() );
    });
    userOrg.org = orgArr;
    userOrg.job = orgJobArr;
    return userOrg;
}



// 取得部門資訊
function getOrgData(){
    loader( $("#orgChart") );
    // var sendData = {
    //     // api: ctrlAdminAPI,
    //     api: "AssOrg/GetData_AssOrg"
    //     data:{
    //         iSu_Id: 1
    //     }
    // }
    var sendData = {
        api: "AssOrg/GetData_AssOrg",
        threeModal:true,
        data:{
            sys_code: sys_code,
        }
    }; 
    $.getJSON(wrsUrl,sendData,function(rs){
        // console.log(rs);
        $("#orgChart").empty();
        //有資料
        if(rs.Status){
            $.each(rs.Data, function(index, content){
                createTreeData(content.uid,content.name,content.faid, content.officeid);
            });
            createTree();
        }else{ //沒有資料
            var text = $("<div>").addClass("col-xs-12 col-md-12 isOrgEmpty").text("未有組織架構");
            $("<div>").addClass("text-center").append(text).appendTo($("#orgChart"));
        }
    });
}

// 創建組織樹的資訊
function createTreeData(ID,Name,parentID,officeID){
    // console.log(ID,Name,parentID);
    var treeObj = {
        id: ID,
        name: Name,
        parent: parentID,
        listID: officeID
    };
    testData.push(treeObj);
}

// 創建組織樹狀圖
function createTree(){
    orgTreeChart = $('#orgChart').orgChart({
        data: testData,
        showControls: false,
        allowEdit: false,
        newNodeText:"組織",
        selectModal: true,
        selectOnly: true,
        rootSelect: false,
        withoutRoot: true,
        onClickNode: function(node){
            // log('Clicked node '+node.data.id);
            // jobRankTreeDialog(orgTreeChart, node.data);
            // console.log(node.data);
        }
    });
}

// 創建職務
function getJobRank( putArea, orgID, id ){
    jobTreeChart = null;
    jobData = [];
    
    // var sendData = {
    //     api: ctrlAdminJobAPI,
    //     data:{
    //         iSu_Id: 1,
    //         iOfid: orgID
    //     }
    // }
    var sendData = {
        api: threeModelJobAPI,
        threeModal:true,
        data:{
            sys_code: sys_code,
            iOfid: orgID,
            iOrgid: id
        }
    }; 
    $.getJSON(wrsUrl,sendData,function(rs){
        putArea.empty();
        if(rs.Status){
            // 顯示職務架構圖
            $.each(rs.Data,function(index, content){
                createJobTreeData( content.uid, content.name, content.faid );
            });
            createJobRankTree(putArea,orgID);
            // createOtgList(parentID, jobTreeChart, rs.Data,false);
        }else{ // 空的代表還未新增
            // 顯示新增ROOT按鈕
            var text = $("<div>").addClass("col-xs-12 col-md-12 isJobEmpty").text("未有對應職務");
            $("<div>").addClass("text-center").append(text).appendTo(putArea);
        }
    });
}


// 創建組織樹狀圖
function createJobRankTree(putArea, orgID){
    // console.log(jobData);
    jobTreeChart = putArea.orgChart({
        data: jobData,
        showControls: false,
        allowEdit: false,
        newNodeText:"職務",
        selectModal: true,
        selectOnly: true,
        rootSelect: false,
        onClickNode: function(node){
            // log('Clicked node '+node.data.id);
            // jobRankTreeDialog(jobTreeChart, node.data);
            // console.log(node);
        }
    });
}

// 創建組織樹的資訊
function createJobTreeData(ID, Name,parentID){

    // console.log(ID,Name,parentID);
    var treeObj = {
        id: ID,
        name: Name,
        parent: parentID
    };
    jobData.push(treeObj);
}

// 組織架構圖
function orgChartDialog(putArea, jobPutArea){
    $("#orgChartDialog").remove();
    $("<div>").prop("id","orgChartDialog").appendTo("body");

    $("#orgChartDialog").bsDialog({
        title:"組織架構圖",
        autoShow:true,
        start: function(){
            var orgChartDiv = $("<div>").prop("id", "orgChart").addClass("modal-items");
            $("#orgChartDialog").find(".modal-body").append(orgChartDiv);
            getOrgData();
        },
        button:[
            // {
            //     text: "取消",
            //     click: function(){
            //         $("#orgChartDialog").bsDialog("close");
            //     }
            // },
            {
                text: "確認",
                className: "btn-success",
                click: function(){
                    if(!$("#orgChartDialog").find(".isOrgEmpty").length){
                        var selectData = orgTreeChart.getSelectData();
                        if(selectData.pageObj.length){
                            // 目前先以單人單部門做為設計
                            $("#insertDialog").find("#orgInfo").empty();
                            $("#insertDialog").find("#orgJobInfo").empty();

                            $.each(selectData.pageObj,function(i,v){
                                var content = $("<div>").addClass("col-xs-12 col-md-12 orgItem item-border item-border-radius list-items");
                                var text = $("<div>").addClass("col-xs-12 col-md-9");
                                var btnContent = $("<div>").addClass("col-xs-12 col-md-3");
                                var btn = $('<i>').addClass("fa fa-trash-o fa-lg mouse-pointer cancel-btn");
                                var setOrgVal = $("<input>").prop("type","hidden").addClass("org").val(selectData.obj[i]["id"]);

                                var jobContent = $("<div>").addClass("col-xs-12 col-md-12 orgItem item-border item-border-radius list-items");
                                var jobText = $("<div>").addClass("col-xs-12 col-md-9");
                                var jobSetBtn = $("<i>").addClass("fa fa-briefcase fa-lg mouse-pointer send-btn");
                                var jobBtnContent = $("<div>").addClass("col-xs-12 col-md-3");
                                // 部門設置
                                btn.click(function(){
                                    $(content).remove();
                                    $(jobContent).remove();
                                });
                                // 職務設定
                                jobSetBtn.click(function(){
                                    // jobPutArea
                                    jobOrgChartDialog(jobContent, selectData.obj[i]["listID"], selectData.obj[i]["id"]);
                                });
                                text.text(v).appendTo(content);
                                jobText.text(v).appendTo(jobContent);

                                btnContent.append(btn).appendTo(content);
                                setOrgVal.appendTo(content);
                                jobBtnContent.append(jobSetBtn).appendTo(jobContent);


                                content.appendTo(putArea);
                                jobContent.appendTo(jobPutArea);
                            });
                            $("#orgChartDialog").bsDialog("close");
                        }
                    }else{
                        $("#orgChartDialog").bsDialog("close");
                    }
                }
            }
        ]
    });
}

function jobOrgChartDialog(jobPutArea, orgID, dataID){
    $("#jobOrgChartDialog").remove();
    $("<div>").prop("id","jobOrgChartDialog").appendTo("body");

    $("#jobOrgChartDialog").bsDialog({
        title:"職務架構圖",
        autoShow:true,
        start: function(){
            var orgChartDiv = $("<div>").prop("id", "orgJobChart").addClass("modal-items");
            $("#jobOrgChartDialog").find(".modal-body").append(orgChartDiv);
            getJobRank(orgChartDiv, orgID, dataID);
        },
        button:[
            // {
            //     text: "取消",
            //     click: function(){
            //         $("#jobOrgChartDialog").bsDialog("close");
            //     }
            // },
            {
                text: "確認",
                className: "btn-success",
                click: function(){
                    if(!$("#jobOrgChartDialog").find(".isJobEmpty").length){
                        var selectData = jobTreeChart.getSelectData();
                        jobPutArea.find(".jobItem").remove();
                        if(selectData.pageObj.length){
                            // 職務設置
                            var jobContent = $("<div>").addClass("col-xs-12 col-md-12 jobItem");
                            var text = $("<div>").addClass("col-xs-12 col-md-9");
                            var btnContent = $("<div>").addClass("col-xs-12 col-md-3");
                            var btn = $('<i>').addClass("fa fa-trash-o fa-lg mouse-pointer cancel-btn");
                            var setOrgJobVal = $("<input>").prop("type","hidden").addClass("jobItemContent").val(selectData.idStr);
                            btn.click(function(){
                                jobContent.remove();
                            });
                            text.text(selectData.pageObj[0]).appendTo(jobContent);
                            btnContent.append(btn).appendTo(jobContent);
                            setOrgJobVal.appendTo(jobContent);
                            jobContent.appendTo(jobPutArea);
                            $("#jobOrgChartDialog").bsDialog("close");
                        }
                        // console.log(selectData);
                    }else{
                        $("#jobOrgChartDialog").bsDialog("close");
                    }
                }
            }
        ]
    });
}

function putOrgInfo(putArea,jobPutArea, orgObj, jobObj){
    // console.log(jobObj);
    var orgID = orgObj.uid,
    listID = orgObj.officeid;

    var content = $("<div>").addClass("col-xs-12 col-md-12 orgItem item-border item-border-radius list-items");
    var text = $("<div>").addClass("col-xs-12 col-md-9");
    var btnContent = $("<div>").addClass("col-xs-12 col-md-3");
    var btn = $('<i>').addClass("fa fa-trash-o fa-lg mouse-pointer cancel-btn");
    var setOrgVal = $("<input>").prop("type","hidden").addClass("org").val(orgID);

    var jobContent = $("<div>").addClass("col-xs-12 col-md-12 orgItem item-border item-border-radius list-items");
    var jobText = $("<div>").addClass("col-xs-12 col-md-9");
    var jobSetBtn = $("<i>").addClass("fa fa-briefcase fa-lg mouse-pointer send-btn");
    var jobBtnContent = $("<div>").addClass("col-xs-12 col-md-3");
    // 部門設置
    btn.click(function(){
        $(content).remove();
        $(jobContent).remove();
    });
    // 職務設定
    jobSetBtn.click(function(){
        // jobPutArea
        jobOrgChartDialog(jobContent, listID, orgID);
    });
    text.text(orgObj.name).appendTo(content);
    jobText.text(orgObj.name).appendTo(jobContent);

    btnContent.append(btn).appendTo(content);
    setOrgVal.appendTo(content);
    jobBtnContent.append(jobSetBtn).appendTo(jobContent);

    content.appendTo(putArea);
    jobContent.appendTo(jobPutArea);
    if(jobObj != null){
        putJobInfo(jobContent, jobObj);
    }
}

function putJobInfo(jobPutArea, jobObj){
    var jobID = jobObj.uid;
    // 職務設置
    var jobContent = $("<div>").addClass("col-xs-12 col-md-12 jobItem");
    var text = $("<div>").addClass("col-xs-12 col-md-9");
    var btnContent = $("<div>").addClass("col-xs-12 col-md-3");
    var btn = $('<i>').addClass("fa fa-trash-o fa-lg mouse-pointer cancel-btn");
    var setOrgJobVal = $("<input>").prop("type","hidden").addClass("jobItemContent").val(jobID);
    btn.click(function(){
        jobContent.remove();
    });
    text.text(jobObj.name).appendTo(jobContent);
    btnContent.append(btn).appendTo(jobContent);
    setOrgJobVal.appendTo(jobContent);
    jobContent.appendTo(jobPutArea);
    
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

// 取得單筆資料
function getUidData(uid, callback, returnStyle){
    var sendData = {
        api: "AssCommon/GetData_AssCommon",
        threeModal: true,
        data:{
            "sys_code": sys_code,
            "iUid": uid
        }
    };

    var returnStyle = (returnStyle == undefined)?true:returnStyle;

    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.Status){
            if(returnStyle){
                // 畫面設定值
                var option = {styleKind:"person",style:"list"};
                // 取得畫面樣式
                getStyle(option,function(pageStyle){
                    callback(pageStyle, rs.Data);
                });
            }else{
                callback(rs.Data);
            }
        }else{
            // var area = (calendarType == 1)? "total-content":"systems-content";
            if(returnStyle){
                getCalendarData(calendarType,"total-content");
            }else{
                callback(rs.Data);
            }
            // console.log(uid);
        }
    });
}

// 權限
function modifySetPositionBtn(positionID, userID, itemObj){
    var selectArr = [];
    if(userID == null){
        itemObj.find("#loader").remove();
        itemObj.find("#postitonArea").show();
        createPositionList(itemObj.find("#postitonArea").find("#postitonList"), selectArr);
        return;
    }
    var sendObj = {
        api: UpUserPostionAPI+"VerifyData_UpUserPostion",
        data: {
            userID: userID,
            up_posid: positionID
        },
        threeModal: true
    }
    $.post(wrsUrl, sendObj, function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            selectArr = rs.Data;
        }
        itemObj.find("#loader").remove();
        itemObj.find("#postitonArea").show();
        createPositionList(itemObj.find("#postitonArea").find("#postitonList"), selectArr);
    });
}
// 權限列表
function createPositionList(putArea, selectArr){
    if(selectArr == undefined){
        selectArr = [];
    }
    var sendObj = {
        api: UpUserPostionAPI+"GetData_UpUserPostion",
        data: {},
        threeModal: true
    }
    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Status){
            var total = $("<div>").addClass("col-xs-12 col-md-12 list-items item-border item-border-radius");
            $.each(rs.Data, function(i, v){
                var border = $("<div>").addClass("col-xs-12 col-md-12");

                var button = $("<i>").addClass("fa fa-square-o fa-lg send-btn mouse-pointer positionBtn").data("uid", v.uid);
                if($.inArray(v.uid,selectArr) != -1){
                    button.removeClass("fa-square-o").addClass("fa-check-square-o");
                }
                var buttonDiv = $("<div>").addClass("col-xs-2 col-md-2 control-label font-lineHeight text-center");
                var name = $("<div>").addClass("col-xs-10 col-md-10 control-label font-lineHeight").text(v.name);
                
                button.click(function(){
                    var thisClass = $(this).prop("class");
                    if(thisClass.search("fa-check-square-o") == -1){
                        $(this).removeClass("fa-square-o").addClass("fa-check-square-o");
                    }else{
                        $(this).removeClass("fa-check-square-o").addClass("fa-square-o");
                    }
                });

                buttonDiv.append(button);
                border.append(buttonDiv).append(name);
                border.appendTo(total);
            });
            total.appendTo(putArea);
        }else{
            $("#insertDialog").bsDialog("close");
            msgDialog("無法取得權限列表，請重新整理後再嘗試");
        }
    });
}