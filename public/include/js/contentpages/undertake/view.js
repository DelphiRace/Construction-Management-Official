// 收文預覽
function referenceViewDialog(modifyObj, modifyItem, getViewData){
    if(getViewData == undefined){
        getViewData = true;
    }
    // console.log(modifyItem);
    
    $("#referenceViewDialog").remove();
    var referenceViewDialog = $("<div>").prop("id","referenceViewDialog");
    referenceViewDialog.appendTo("body");
    var btn = referenceDialogBtn(modifyObj, modifyItem);
    if(getViewData){
        $.blockUI();
        var sendData = {
            api: referenceAPI + "getReference",
            data:{
                uid: modifyObj.uid
            }
        };

        $.getJSON(wrsUrl, sendData).done(function(rs){
                // console.log(rs.data[0]);
            if(rs.status && rs.data != null){
                $("#referenceViewDialog").bsDialog({
                    title: modifyObj.doc_number,
                    autoShow: true,
                    start: referenceViewStart(rs.data[0]),
                    button:btn
                });
            }else{
                msgDialog("無法取得「"+modifyObj.subject+"」內容");
                $("#referenceViewDialog").bsDialog("close");
                $.unblockUI();
            }
        });
    }else{
        $("#referenceViewDialog").bsDialog({
            title: modifyObj.doc_number || modifyObj.docNumber,
            autoShow: true,
            start: referenceViewStart(modifyObj),
            button:btn
        });
    }
}

// 創建呈核按鈕
function referenceDialogBtn(modifyObj, modifyItem){
    var btn = [];
    var closeBtnClass = " pull-left";
    btn.push({
        text: "關閉",
        className: "btn-default-font-color",
        click: function(){
            deleteHash();
            $("#referenceViewDialog").bsDialog("close");
        }
    });
    if(parseInt(modifyObj.status) == 1 && parseInt(modifyObj.pos_des)){
        btn[0]["className"] += closeBtnClass;
        btn.push({
            text: "分派",
            className: "btn-success",
            click: function(){
                deleteHash();
                referenceChooseProcessType(modifyObj, modifyItem);
                $("#referenceViewDialog").bsDialog("close");
            }
        });
    }
    if(parseInt(modifyObj.status) == 4 && parseInt(modifyObj.pos_des)){

        btn[0]["className"] += closeBtnClass;
        btn.push({
            text: "退回",
            className: "btn-danger",
            click: function(){
                $.blockUI();
                deleteHash();
                // console.log(modifyObj, modifyItem);
                referenceCheck(modifyObj, modifyItem, true);
                // referenceStatusSet(modifyObj.uid, 4, modifyItem);
            }
        });
        btn.push({
            text: "通過",
            className: "btn btn-success",
            click: function(){
                $.blockUI();
                deleteHash();
                referenceCheck(modifyObj, modifyItem, false);
                // referenceStatusSet(modifyObj.uid, 3, modifyItem);
            }
        });
    }
    return btn;
}

// 發文-文件審核
function referenceCheck(modifyObj, modifyItem, isBan){
    $("#referenceCheckDialog").remove();
    var referenceCheckDialog = $("<div>").prop("id","referenceCheckDialog");
    referenceCheckDialog.appendTo("body");

    var text = "通過";
    var className = "btn-success"; 
    var title = "通過意見";
    var isPass = true;
    if(isBan){
        text = "退回";
        className = "btn-danger";
        title = "退回意見";
        isPass = false;

    }

    $("#referenceCheckDialog").bsDialog({
        title: modifyObj.doc_number + title,
        autoShow: true,
        start: referenceCheckStart(modifyObj),
        button:[
            {
                text: "關閉",
                click: function(){
                    $("#referenceCheckDialog").bsDialog("close");
                }
            },
            {
                text: text,
                className: className,
                click: function(){
                    var cause = $("#referenceCheckDialog").find("#cause").val();
                    if($.trim(cause)){
                        console.log("T");
                        if(isBan){
                            referenceStatusSet(modifyObj.uid, 4, modifyItem, cause);
                        }else{
                            referenceStatusSet(modifyObj.uid, 3, modifyItem, cause);
                        }
                    }else{
                        console.log("T");

                        $.unblockUI();
                    }
                }
            }
        ]
    });

    
}

// 收文-文件審核要做的事情
function referenceCheckStart(modifyObj){
    var option = {styleKind:"received-issued",style:"reference-check"};
    getStyle(option,function(checkPage){
        var checkPageObj = $.parseHTML(checkPage);
        $(checkPageObj).find("#remark").keyup(function(){
            var values = $(this).val();
            if(values.length > 300 ){
                values = values.substring(0, 300);
                $(this).val(values);
            }
        });
        $(checkPageObj).appendTo($("#referenceCheckDialog").find(".modal-body"));

    });
}

function referenceStatusSet(uid, statusCode, modifyItem, cause){
    // console.log(modifyItem);
    var sendData = {
        api: referenceAPI + "setReferenceWorkStatus",
        data:{
          "uid": uid,
          "status": statusCode,
          "cause": cause
        }
    }

    $.post(wrsUrl, sendData, function(rs){
        var rs = $.parseJSON(rs);
        if(rs.status){
            msgDialog("修改成功", false);
            $("#referenceViewDialog").bsDialog("close");
            $("#referenceCheckDialog").bsDialog("close");
            if(modifyItem != undefined){
                renewListData(modifyItem, uid, false);
            }else{
                getData();
            }
        }else{
            msgDialog(rs.errMsg || rs.Message);
        }
        $.unblockUI();
    });
}

// 收文預覽時開啟的動作要做的事情
function referenceViewStart(modifyObj){
    // console.log(modifyObj);
    var option = {styleKind:"received-issued",style:"reference-view"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        var historiesArea = $(insertPageObj).find("#historiesArea").find("#historiesContent");

		$.each(modifyObj, function(i, content){
            if(i!="explanation" && i != "file_info" && i!="according" && i != "drfType" && i != "history"){
               if(content != "" && content != null){
                    $(insertPageObj).find("#"+i).html(content);
                }else{
                    $(insertPageObj).find("#"+i).parent().parent().hide();
                }
            }else{
                if(i=="explanation"){
                    // console.log($.parseHTML(content));
                    // var string = $.parseHTML(content.replace(/&amp;/g, '&'));
                    var string = $.parseHTML(relpaceAMP(content));
                    $(insertPageObj).find("#"+i).html(string[0].data);
                }
                if(i == "file_info" && content.length > 0){
                    $(insertPageObj).find("#fileList").show();
                    var option = {styleKind:"received-issued",style:"reference-fileList"};
                    getStyle(option,function(fileListPage){

                        $.each(content, function(fI,fC){
                            // console.log(fc);
                            var fileListObj = $.parseHTML(fileListPage);
                            $(fileListObj).addClass("fileData");
                            $(fileListObj).find(".fa-paperclip").click(function(){
                                downloadFile(fC.uid, fC.name_ori);
                            });
                            $(fileListObj).find(".list-items").eq(1).text(fC.name_ori).click(function(){
                                downloadFile(fC.uid, fC.name_ori);
                            });
                            $(fileListObj).appendTo($(insertPageObj).find("#fileInfoArea"));
                        });
                        $(insertPageObj).find("#fileInfoArea").find(".fileData").last().removeClass("list-items-bottom");
                    });
                }
                if(i == "according" && content!=null && content != ""){
                    
                    var str = "";
                    $.each(content, function(accIndex,accContent){
                        str += accContent.name + ",";
                    });
                    str = str.substring(0,str.length-1);
                    $(insertPageObj).find("#"+i).text(str);
                    
                }else if(i == "according" && content==null){
                    var str = "無";
                    $(insertPageObj).find("#"+i).text(str);
                }

                if(i == "drfType"){
                    var str = (!parseInt(content))?"正本":"副本";
                    $(insertPageObj).find("#"+i).html(str);
                }

                if(i == "history"){
                    if(content == null){
                        $(insertPageObj).find("#historiesArea").hide();
                    }else{
                        creatHistory(content, historiesArea, false);
                    }
                }
            }
		});


        $(insertPageObj).find("#historiesArea").find("#historyToggle").click(function(){
            var historyShowIcon = $(this).find("#historyShowIcon");
            if(historyShowIcon.prop("class").search("fa-caret-right") == -1){
                historyShowIcon.removeClass("fa-caret-down").addClass("fa-caret-right");
            }else{
                historyShowIcon.removeClass("fa-caret-right").addClass("fa-caret-down");
            }
            historiesArea.toggle();
        });
	
        // 放到畫面中
        $(insertPageObj).appendTo($("#referenceViewDialog").find(".modal-body"));
        $.unblockUI();
    });
}

// 擬文預覽
function sendDocViewDialog(modifyObj, modifyItem, getViewData){
    if(getViewData == undefined){
        getViewData = true;
    }
    $.blockUI();
    if(getViewData){
        var sendData = {
            api: waDrfAPI + "getDispatch",
            data:{
                uid: modifyObj.uid,
                sys_code_id: sys_code,
                user_id: userID
            }
        };
    
        $.getJSON(wrsUrl, sendData).done(function(rs){  
            // console.log(modifyObj);
            if(rs.status && rs.data != null){
                rs.data[0].pos_modify = modifyObj.pos_modify;
                openSendDocViewDialog(rs.data[0], modifyItem);
            }else{
                $.unblockUI();
                msgDialog("無法取得「"+modifyObj.subject+"」內容");
            }

        });
    }else{
        openSendDocViewDialog(modifyObj, modifyItem);
    }
}

function openSendDocViewDialog(modifyObj, modifyItem){
    // 驗證使用者是否為該流程中，最高階的主管
    var sendData = {
        api: "AssUser/VerifyUserIsTopSupervisor_AssUser",
        data:{
            userID: userID,
            sys_code: sys_code,
        },
        threeModal: true
    };

    $.getJSON(wrsUrl,sendData, function(rs){
        // 取得文件審核相關權限
        var sendData = {
            api: "ApdData/UserVerifyPosition_ApdData",
            data:{
                userID: userID,
                doc_uid: modifyObj.uid,
            },
            threeModal: true
        }
        
        $.getJSON(wrsUrl,sendData, function(docPositionRs){
            $("#sendDocViewDialog").remove();
            var sendDocViewDialog = $("<div>").prop("id","sendDocViewDialog");
            sendDocViewDialog.appendTo("body");

            var btn = sendDocDialogBtn(modifyObj, modifyItem, rs, docPositionRs);
            
            $("#sendDocViewDialog").bsDialog({
                title: modifyObj.doc_number || modifyObj["docNumber"],
                autoShow: true,
                start: sendDocViewStart(modifyObj),
                button:btn
            });

        });


    });
    
}

// 創建審核按鈕
function sendDocDialogBtn(modifyObj, modifyItem, TopSupervisor, docVerifyPosition){
    var btn = [];
    var closeBtnClass = " pull-left";
    if(TopSupervisor.TopSupervisor == undefined){
        TopSupervisor = false;
    }else{
        TopSupervisor = TopSupervisor.TopSupervisor;
    }
    btn.push({
        text: "關閉",
        className: "btn-default-font-color",
        click: function(){
            deleteHash();
            $("#sendDocViewDialog").bsDialog("close");
        }
    });

    if((parseInt(modifyObj.status) == 2 || parseInt(modifyObj.status) == 6) && parseInt(modifyObj.pos_modify)){
        btn[0]["className"] += closeBtnClass;
        btn.push({
            text: "修改擬文",
            className: "btn-success",
            click: function(){
                $("#sendDocViewDialog").bsDialog("close");
                insertDialog( modifyObj, $(modifyItem) );
            }
        });
        
    }
    
    // if(parseInt(modifyObj.pos) == 1 && (parseInt(modifyObj.status) == 3 || parseInt(modifyObj.status) == 1) ){
    if(docVerifyPosition.Status && (parseInt(modifyObj.status) == 3 || parseInt(modifyObj.status) == 1)){
        var backStr = "回覆";
        btn[0]["className"] += closeBtnClass;
        if(parseInt(docVerifyPosition.action_type)){
            backStr = "通過";
            // 最高層主管才有作廢的按鈕
            if(TopSupervisor){
                btn.push({
                    text: "作廢",
                    className: "btn-danger"+closeBtnClass,
                    click: function(){
                        deleteHash();
                        sendDocCheck(modifyObj, docVerifyPosition.apdUid, modifyItem, 12);
                        // $("#sendDocViewDialog").bsDialog("close");
                    }
                });
            }
            btn.push({
                text: "退件",
                className: "btn-danger",
                click: function(){
                    deleteHash();
                    sendDocCheck(modifyObj, docVerifyPosition.apdUid, modifyItem, true);
                    // $("#sendDocViewDialog").bsDialog("close");
                }
            });
        }
        btn.push({
            text: backStr,
            className: "btn btn-success",
            click: function(){
                deleteHash();
                sendDocCheck(modifyObj, docVerifyPosition.apdUid, modifyItem, false);
                // $("#sendDocViewDialog").bsDialog("close");
            }
        });
    }
    return btn;
}


// 擬文預覽時開啟的動作要做的事情
function sendDocViewStart(modifyObj){
    // console.log(modifyObj);
    var option = {styleKind:"received-issued",style:"sendDoc-view"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);
        var haveFile = false;
        if(modifyObj.file_info != undefined){
            haveFile = true;
        }
        var historiesArea = $(insertPageObj).find("#historiesArea").find("#historiesContent");
        $(insertPageObj).find("#historiesArea").find("#historyToggle").click(function(){
            var historyShowIcon = $(this).find("#historyShowIcon");
            if(historyShowIcon.prop("class").search("fa-caret-right") == -1){
                historyShowIcon.removeClass("fa-caret-down").addClass("fa-caret-right");
            }else{
                historyShowIcon.removeClass("fa-caret-right").addClass("fa-caret-down");
            }
            historiesArea.toggle();
        });
        // 承辦
        if(modifyObj.pricipalUser != undefined){
            $(insertPageObj).find("#pointPeople").text(modifyObj.pricipalUser[0].name);
        }

        var without = ["explanation","send_to","carbon_paper","file_info","according","history"];
        if(modifyObj.prefix != undefined){
            $(insertPageObj).find("#prefixArea").show();
        }
        $.each(modifyObj, function(i, content){
            if( $.inArray(i, without) == -1 ){
               $(insertPageObj).find("#"+i).html(content);
            }else{
                // console.log($.parseHTML(content));
                if(i=="explanation"){
                    if(content){
                        var string = $.parseHTML(relpaceAMP(content));
                        $(insertPageObj).find("#"+i).html(string[0].data);
                    }
                }
                if(i=="send_to" && content.length > 0){
                    var dataStr = "";
                    $.each(content, function(sI,sC){
                        dataStr += sC.name+",";
                    });
                    dataStr = dataStr.substring(0,dataStr.length-1);
                    $(insertPageObj).find("#send_to_list").text(dataStr);

                }

                if(i=="carbon_paper" && content.length > 0){
                    var dataStr = "";
                    $.each(content, function(sI,sC){
                        dataStr += sC.name+",";
                    });
                    dataStr = dataStr.substring(0,dataStr.length-1);
                    $(insertPageObj).find("#carbon_paper_list").text(dataStr);

                }else if(i=="carbon_paper" && content.length == 0){
                    // console.log("T");
                    $(insertPageObj).find("#carbon_paper_list").text("-");
                }

                if(i == "according" && content !=null && content.length){
                    var str = "";
                    $.each(content, function(accIndex,accContent){
                        str += accContent.name + ",";
                    });
                    str = str.substring(0,str.length-1);
                    $(insertPageObj).find("#"+i).text(str);
                    
                }else if(i == "according" && (content==null || !content.length)){
                    var str = "無";
                    $(insertPageObj).find("#"+i).text(str);
                }

                if(haveFile){
                    $(insertPageObj).find("#fileList").show();
                }else{
                    $(insertPageObj).find("#fileList").hide();
                    $(insertPageObj).find("#fileInfoArea").text("-");
                }
                if(i == "file_info"){
                    if(content.length > 0){
                        
                        var option = {styleKind:"received-issued",style:"reference-fileList"};
                        getStyle(option,function(fileListPage){

                            $.each(content, function(fI,fC){
                                // console.log(fc);
                                var fileListObj = $.parseHTML(fileListPage);
                                $(fileListObj).addClass("fileData");
                                $(fileListObj).find(".fa-paperclip").click(function(){
                                    downloadFile(fC.uid, fC.name_ori);
                                });
                                $(fileListObj).find(".list-items").eq(1).text(fC.name_ori).addClass("send-btn mouse-pointer").click(function(){
                                    downloadFile(fC.uid, fC.name_ori);
                                });
                                $(fileListObj).appendTo($(insertPageObj).find("#fileInfoArea"));
                            });
                            $(insertPageObj).find("#fileInfoArea").find(".fileData").last().removeClass("list-items-bottom");
                        });
                    }
                }

                if(i == "history"){
                    if(content != "" && content != null && content.length){
                        creatHistory(content, historiesArea, false);
                    }else{
                        
                        $(insertPageObj).find("#historiesArea").remove();
                    }
                }

            }
        });

        if(modifyObj.prefix != undefined){
            if(parseInt(modifyObj.prefix) != 0){
                var sendData = {
                    api: prefixAPI + "GetData_PlPrefix",
                    threeModal:true,
                    data:{
                        sys_code: sys_code,
                        iUid: modifyObj.prefix
                    }
                };
                $.getJSON(wrsUrl, sendData, function(prefixRs){
                    // 發文文號
                    $(insertPageObj).find("#prefix").text(prefixRs.Data.name);
                });
            }
        }

        // 取得審核意見，並放入審核意見顯示區，如果有就要顯示出來
        $(insertPageObj).find("#auditArea").find("#auditToggle").click(function(){
            var auditShowIcon = $(this).find("#auditShowIcon");
            if(auditShowIcon.prop("class").search("fa-caret-right") == -1){
                auditShowIcon.removeClass("fa-caret-down").addClass("fa-caret-right");
            }else{
                auditShowIcon.removeClass("fa-caret-right").addClass("fa-caret-down");
            }
            $(insertPageObj).find("#auditContent").toggle();
        });
        var sendObj = {
            api: apdAPI + "Get_ApdDataSignStatus",
            threeModal: true,
            data:{
                sys_code:sys_code,
                docUid: modifyObj.uid
            }

        };
        $.getJSON(wrsUrl, sendObj, function(rs){
            if(rs.status){
                $(insertPageObj).find("#auditArea").show();
                var signData = rs.data;
                var haveRemark = false;
                $.each(signData, function(i, v){
                    $.each(v, function(layerIndex, layerContent){
                        // 放入原因
                        if(layerContent.remark != null){
                            putRemark($(insertPageObj).find("#auditContent"), layerContent.org.orgName, layerContent.name , layerContent);
                            haveRemark = true;
                        }
                        // if(layerIndex == 1 && layerContent.remark != null){
                        //     haveRemark = true;
                        // }
                    });
                });

                if(!haveRemark){
                    $(insertPageObj).find("#auditArea").hide();
                }
            }else{
                $(insertPageObj).find("#auditArea").hide();
            }
        });

        // 放到畫面中
        $(insertPageObj).appendTo($("#sendDocViewDialog").find(".modal-body"));
        
        $.unblockUI();

        // getQCTableTypeList("tableTypeTab","tableType",true);
    });
}

// 發文-文件審核
function sendDocCheck(modifyObj, apdUid, modifyItem, isBan){
    $("#sendDocCheckDialog").remove();
    var sendDocCheckDialog = $("<div>").prop("id","sendDocCheckDialog");
    sendDocCheckDialog.appendTo("body");

    var text = "通過";
    var className = "btn-success"; 
    var title = "通過建議";
    var isPass = true;
    if(isBan == 12){
        text = "作廢";
        className = "btn-danger";
        title = "作廢原因";
        isPass = 12;
    }else if(isBan){
        text = "退件";
        className = "btn-danger";
        title = "退件建議";
        isPass = false;
    } 

    $("#sendDocCheckDialog").bsDialog({
        title: modifyObj.docNumber + title,
        autoShow: true,
        start: sendDocCheckStart(modifyObj),
        button:[
            {
                text: "關閉",
                click: function(){
                    $("#sendDocCheckDialog").bsDialog("close");
                }
            },
            {
                text: text,
                className: className,
                click: function(){
                    $.blockUI();
                    var sendData = getUserInput("sendDocCheckDialog");
                    
                    sendData.uid = apdUid;
                    // sendData.doc_uid = modifyObj.uid;
                    sendData.docNumber = modifyObj.docNumber;
                    sendData.isPass = isPass;
                    sendData.userID = userID;
                    // drf需要?
                    // sendData.sys_code = sys_code;
                    
                    if(!$.trim(sendData.remark).length){
                        $("#sendDocCheckDialog").find("#remark").addClass("item-bg-danger");
                        $.unblockUI();
                        return;  
                    }
                    
                    sendDocCheckSave(sendData, modifyObj, modifyItem, isPass);
                    
                }
            }
        ]
    });

    
}

// 發文-文件審核要做的事情
function sendDocCheckStart(modifyObj){
    var option = {styleKind:"received-issued",style:"sendDoc-check"};
    getStyle(option,function(checkPage){
        var checkPageObj = $.parseHTML(checkPage);
        $(checkPageObj).find("#remark").keyup(function(){
            var values = $(this).val();
            if(values.length > 300 ){
                values = values.substring(0, 300);
                $(this).val(values);
            }
        });
        $(checkPageObj).appendTo($("#sendDocCheckDialog").find(".modal-body"));

    });
}

// 發文-列印，先選擇要列印的對象
function sendDocPrintSelect(modifyObj){
    $.blockUI();
    // console.log(modifyObj);
    $("#sendDocPrintSelectDialog").remove();
    var sendDocPrintSelectDialog = $("<div>").prop("id","sendDocPrintSelectDialog");
    var contents = $("<div>").addClass("contents");
    contents.appendTo(sendDocPrintSelectDialog);
    sendDocPrintSelectDialog.appendTo("body");

    $("#sendDocPrintSelectDialog").bsDialog({
        title: "請選擇 " +modifyObj.doc_number+" 受文對象",
        autoShow: true,
        start: sendDocPrintSelectStart(modifyObj),
        button:[
            {
                text: "關閉",
                click: function(){
                    $("#sendDocPrintSelectDialog").bsDialog("close");
                }
            }
        
        ]
    });
}


// 發文-列印開始畫面要做的事情
function sendDocPrintSelectStart(modifyObj){
    var option = {styleKind:"received-issued",style:"sendDoc-printSelect"};
    getStyle(option,function(printListPage){

        var sendData = {
            api: waDrfAPI + "getDispatch",
            data:{
                uid: modifyObj.uid,
                sys_code_id: sys_code,
                user_id: userID
            }
        };
        // console.log(sendData);
        // 取得資訊
        $.getJSON(wrsUrl, sendData).done(function(rs){
            // console.log(rs);
            $.unblockUI();
            if(rs.status){
                var data = rs.data[0];

                // 正本資訊
                if(data["send_to"] != undefined){
                    if(data["send_to"].length){
                        $.each(data["send_to"], function(i, v){
                            var printListPageObj = $.parseHTML(printListPage);
                            $(printListPageObj).addClass("dataContent");
                            $(printListPageObj).find(".list-items").eq(0).text(v.name);
                            // 列印按鈕
                            $(printListPageObj).find(".fa-print").click(function(){
                                sendDocPrint(data, v);
                                $("#sendDocPrintSelectDialog").bsDialog("close");
                            });
                            $(printListPageObj).appendTo( $("#sendDocPrintSelectDialog").find(".modal-body").find(".contents") );
                        });
                    }
                }

                // 副本資訊
                if(data["carbon_paper"] != undefined){
                    if(data["carbon_paper"].length){
                        $.each(data["carbon_paper"], function(i, v){
                            var printListPageObj = $.parseHTML(printListPage);
                            $(printListPageObj).addClass("dataContent");
                            $(printListPageObj).find(".list-items").eq(0).text(v.name);
                            // 列印按鈕
                            $(printListPageObj).find(".fa-print").click(function(){
                                sendDocPrint(data, v);
                                $("#sendDocPrintSelectDialog").bsDialog("close");
                            });
                            $(printListPageObj).appendTo( $("#sendDocPrintSelectDialog").find(".modal-body").find(".contents"));
                        });
                    }
                }
                // 移除底線
                $("#sendDocPrintSelectDialog").find(".dataContent").last().removeClass("list-items-bottom");
            }
            else{
                msgDialog(rs.errMsg || rs.Message, true, function(){
                    $("#sendDocPrintSelectDialog").bsDialog("close");
                });
            }

        });
    });
}

// 發文-列印
function sendDocPrint(modifyObj, selectSendTarget){
    $.blockUI();
    // console.log(modifyObj);
    $("#sendDocPrintDialog").remove();
    var sendDocPrintDialog = $("<div>").prop("id","sendDocPrintDialog");
    sendDocPrintDialog.appendTo("body");

    $("#sendDocPrintDialog").bsDialog({
        title: modifyObj.docNumber+"列印",
        autoShow: true,
        start: sendDocPrintStart(modifyObj, selectSendTarget),
        modalClass:"bsDialogWindow modal-items",
        button:[
            {
                text: "關閉",
                click: function(){
                    $("#sendDocPrintDialog").bsDialog("close");
                }
            },
            {
                text: "列印",
                className: "btn-success",
                click: function(){
                    // $("#sendDocPrintDialog").bsDialog("close");
                    // 開始列印
                    $("#sendDocPrintDialog").find(".printContent").printArea();
                }
            }
        
        ]
    });
}

// 發文-列印開始畫面要做的事情
function sendDocPrintStart(data, selectSendTarget){
    // console.log(data);
    var option = {styleKind:"received-issued",style:"sendDoc-print"};
    getStyle(option,function(printPage){
        // 取得公司資訊
        var sendData = {
            api: "CompanyInfo/GetData_CompanyInfo",
            data:{
                // userID: data.pricipalUserId,
                userID: data.pricipalUser[0].uid,
                sys_code: sys_code
            },
            threeModal: true
        };

        // 取得公司資訊
        $.getJSON(wrsUrl, sendData).done(function(rs){
            // 要取得公司資訊才給列印
            if(rs.status){
                var printPageObj = $.parseHTML(printPage);

                // 最開始的標頭
                $(printPageObj).find("#companyName").text(rs.data.companyName);
                // 公司地址
                $(printPageObj).find("#companyAddress").text(rs.data.companyAddress);
                // 公司電話
                $(printPageObj).find("#companyPhone").text(rs.data.companyPhone);
                // 公司傳真
                $(printPageObj).find("#companyFax").text(rs.data.companyPhone);
                // 聯絡地址 - 先暫用公司地址
                $(printPageObj).find("#communicationAddress").text(rs.data.companyAddress);
                // 聯絡電話 - 先暫用公司電話
                $(printPageObj).find("#communicationPhone").text(rs.data.companyPhone);
                // 承辦人
                $(printPageObj).find("#userName").text(rs.data.userName);

                // 受文對象
                $(printPageObj).find("#acceptTarget").text(selectSendTarget.name);
                // 發文日期-取今天 - 要換民國年月日
                var date = new Date();
                // 年
                var year = date.getFullYear() - 1911;
                // 月
                var month = date.getMonth() + 1;
                // 日
                var day = date.getDate();
                // 日期字串
                var dateStr = "中華民國"+year+"年"+month+"月"+day+"日";
                // 放入發文日期
                $(printPageObj).find("#sendDate").text(dateStr);
                var docNumberStr = data.docNumber;
                if(data.prefix != undefined){
                    if(parseInt(data.prefix) != 0){
                        var sendData = {
                            api: prefixAPI + "GetData_PlPrefix",
                            threeModal:true,
                            data:{
                                sys_code: sys_code,
                                iUid: data.prefix
                            }
                        };
                        $.getJSON(wrsUrl, sendData, function(prefixRs){
                            docNumberStr = prefixRs.Data.name + data.docNumber + "號";
                            // 發文文號 + 字號
                            $(printPageObj).find("#docNumber").text(docNumberStr);
                        });
                        
                    }else{
                        // 發文文號 + 字號
                        $(printPageObj).find("#docNumber").text(docNumberStr);
                    }
                }else{
                    // 發文文號 + 字號
                    $(printPageObj).find("#docNumber").text(docNumberStr);
                }
                // 速別
                $(printPageObj).find("#level_name").text(data.level_name);
                // 秘等
                $(printPageObj).find("#isopycnic_name").text(data.isopycnic_name);

                // 是否有附件
                var haveFile = "";
                if(data.file_info != undefined){
                    if(data.file_info.length){
                        $.each(data.file_info, function(i,v){
                            haveFile += v.name_ori + '、';
                        });
                        haveFile = haveFile.substring(0, haveFile.length-1);
                    }
                    haveFile = "(副本無檢附)"+haveFile;
                }else{
                    haveFile = "無";
                }

                $(printPageObj).find("#haveFile").text(haveFile);
                // 主旨
                $(printPageObj).find("#subject").text(data.subject);
                var string = $.parseHTML(relpaceAMP(data.explanation));

                
                if(string[0].data != undefined){
                    string = string[0].data;
                }else{
                    string = $(string).prop("outerHTML");
                }
                
                // 說明
                $(printPageObj).find("#explanation").html(string);

                // 處理資訊
                $.each(data, function(i, v){
                    if(i != "carbon_paper" && i != "send_to" && i != "file_info"){

                    }else{
                        // 正本資訊
                        if(i == "send_to" && v.length){
                            var sendStr = "";
                            $.each(v, function(sendIndex, sendContent){
                                sendStr += sendContent.name + "、";
                            });
                            sendStr = sendStr.substring(0, sendStr.length-1);
                            $(printPageObj).find("#send_to").text(sendStr);
                        }

                        // 副本資訊
                        if(i == "carbon_paper" && v.length){
                            var sendStr = "";
                            $.each(v, function(sendIndex, sendContent){
                                sendStr += sendContent.name + "、";
                            });
                            sendStr = sendStr.substring(0, sendStr.length-1);
                            $(printPageObj).find("#carbon_paper").text(sendStr);
                        }else if(i == "carbon_paper" && !v.length){
                            $(printPageObj).find("#carbon_paper").text("無");
                        }
                    }
                });

                $(printPageObj).appendTo($("#sendDocPrintDialog").find(".modal-body"));
            }else{
                msgDialog(rs.msg, true, function(){
                    $("#sendDocPrintDialog").bsDialog("close");
                });
            }

            $.unblockUI();
        });
    });
           
}

function relpaceAMP(str){
    if(str.search("&amp;") != -1){
        str = str.replace(/&amp;/g, '&');
        if(str.search("&amp;") != -1){
            str = relpaceAMP(str);
        }else{
            return str;
        }
    }
    return str;
}

// 檔案下載
function downloadFile(docID, fileName){
  var sendObj = {
    uid: docID,
    // uid: 4101,
    fileName: fileName
  };
  $.fileDownloader(fileDonwloadUrl, sendObj);
}