var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
var menu_code = "eab";
var fileLimit;
var userPosition = userLoginInfo.userPosition;
var signPosList = [];
var docSignStatus = {};
var processDocData = [];
var sendDocIDStr = "";
var otherProcessDocData = [];

// 標籤碼，1:收文，2:發文，3:退件，4:收文歸檔，5:擬文歸檔，6:作廢
var tabCode = 1;

$(function(){
    if(userLoginInfo.isAdmin){
        $("#prefixSetBtn").click(function(){
            prefixViewDialog();
            $("#docCogBtnArea").removeClass("open");
            return false;
        });
        $("#docNumberSettingBtn").click(function(){
            docNumberSettingDialog();
            $("#docCogBtnArea").removeClass("open");
            return false;
        });
    }else{
        $("#docCogBtnArea").remove();
    }
    var hash = getHashParameter();
    // $("#totalTab").find("a").each(function(){
    //     var id = $(this).prop("id");
    //     // if(hash != null){
    //     //     if(hash.s != undefined){
    //     //         if(parseInt(hash.s) == 1){
    //     //             if(id == "sendDoc"){
    //     //                 $(this).parent().parent().find(".active").removeClass("active");
    //     //                 $(this).parent().addClass("active");
    //     //             }
    //     //         }
    //     //     }
    //     // }
    //     $(this).click(function(){
    //         getData(id+"-content");
    //     });
    // });
    tabCtrl("totalTab");
    if(hash != null){
        if(hash.s != undefined){
            if(parseInt(hash.s) == 1){
                tabCode = 2;
                $("#totalTab").find("#received").parent().removeClass("active");
                $("#totalTab").find("#sendDoc").parent().addClass("active");
                $("#received-content").hide();
                $("#sendDoc-content").show();
                // debugger;
            }
        }
        if(hash.ve != undefined){
            if(!parseInt(hash.ve)){
                getData();
            }else{
                widowsOpen(hash);
            }
        }else{
            getData();
        }
    }else{
        getData();
    }

    $("#totalTab").find("#received").click(function(){
        tabCode = 1;
        getData("received-content");
    });

    $("#totalTab").find("#sendDoc").click(function(){
        tabCode = 2;
        getData("sendDoc-content");
    });

    $("#totalTab").find("#signBack").click(function(){
        tabCode = 3;
        getData("signBack-content");
    });

    $("#totalTab").find("#receivedFinish").click(function(){
        tabCode = 4;
        getData("share-content");
    });

    $("#totalTab").find("#sendDocFinish").click(function(){
        tabCode = 5;
        getData("sendDocFinish-content");
    });

    $("#totalTab").find("#invalid").click(function(){
        tabCode = 6;
        getData("invalid-content");
    });
    
    $("#sendDocDropdownBtn").find("#sendDocProcessBtn").click(function(){
        hideDocNotProcessData(processDocData);
        $("#sendDocDropdownBtn").find("#sendDocDropdownText").text($(this).text());
        // return false;
    });
    $("#sendDocDropdownBtn").find("#sendDocAllBtn").click(function(){
        shoDocAllData(processDocData);
        $("#sendDocDropdownBtn").find("#sendDocDropdownText").text($(this).text());
        // return false;
    });
});

function getData(areaID){
    $("#pageInsertBtn").removeClass("item-unclick").show();
    var method = referenceAPI + "getReferenceList";
    var sendData = {
        data:{
            userId:userID,
            sysCodeId:sys_code
        }
    };
    if(areaID == undefined){
        if(tabCode == 1){
            areaID = "received-content";

            
        }else if( tabCode == 2){
            areaID = "sendDoc-content";

            
        }else if(tabCode == 3){
            areaID = "signBack-content";
            
        }else{
            areaID = "share-content";
        }
    }
    $("#sendDocDropdownArea").hide();
    if(tabCode == 1){
        sendData.data.type = 1;
        if($.inArray( "1", userPosition ) == -1 || !userPosition.length){
            $("#pageInsertBtn").addClass("item-unclick");
        }
    }else if(tabCode == 2){
        $("#sendDocDropdownArea").show();
        $("#sendDocDropdownBtn").find("#sendDocDropdownText").text( $("#sendDocDropdownBtn").find("#sendDocProcessBtn").text() );
        method = waDrfAPI + "getDispatchList";
        sendData.data.type = 1; 
        if(userLoginInfo.orgid == null || userLoginInfo.posid == null){
            $("#pageInsertBtn").addClass("item-unclick");
        }
    }else if(tabCode == 3){
        method = waDrfAPI + "getDispatchList";
        sendData.data.type = 2;
        $("#pageInsertBtn").hide();
    }else if(tabCode == 4){
        sendData.data.type = 2; 
        $("#pageInsertBtn").hide();
    }else if(tabCode == 5){
        method = waDrfAPI + "getDispatchList";
        sendData.data.type = 3;  
        $("#pageInsertBtn").hide();
    }else if(tabCode == 6){
        method = waDrfAPI + "getDispatchList";
        sendData.data.type = 4; 
        $("#pageInsertBtn").hide();
    }


    
    $("#"+areaID).show();
    $("#"+areaID).find(".dataContent").remove();
    $("#"+areaID).find(".data-empty").remove();
    blockArea();

    sendData.api = method;
    getPageListData(sendData, function(rs, hashData){
        // console.log(rs);
        
        if(rs.status && rs.data != null){
            if(tabCode == 2){
                var sendData = {
                    api: "ApdData/GetUserSignData_ApdData",
                    threeModal: true,
                    data:{
                        userID: userID,
                    }
                }
                $.post(wrsUrl, sendData, function(signPos){
                    signPos = $.parseJSON(signPos);

                    if(signPos.Status){
                        signPosList = signPos.Data;
                    }
                    
                    putDataToPage(rs.data, $("#"+areaID), hashData, signPos.Data);
                });
            }else{
                putDataToPage(rs.data, $("#"+areaID), hashData);
            }
        }else{
            putEmptyInfo($("#"+areaID));
        }
        blockArea(false);
    }, dataOpen);
    // .fail(function(){
    //     putEmptyInfo($("#"+areaID));
    // });
}

// 資料開啟
function dataOpen(dataObj){
    // console.log(dataObj);
    if(dataObj.i != undefined){
        // 是否需要驗證
        if(dataObj.ve != undefined && parseInt(dataObj.ve)){
            var sendData = {
                api: typeAPI + "getDrfType",
                data:{
                    uid: dataObj.i
                }
            };
            $.getJSON(wrsUrl, sendData, function(rs){
                if(rs.status && rs.type != null){
                    var thisType = parseInt(rs.type);
                    // 0 : 收文, 1: 擬文, 2: 退文, 3: 收歸, 4: 擬歸, 5:作廢
                    dataObj.s = thisType;
                    if(thisType > 0){
                        $("#received-content").hide();
                        $("#sendDocDropdownArea").hide();
                        $("#totalTab").find("#received").parent().removeClass("active");
                        switch(thisType){
                            case 1:
                                tabCode = 2;
                                $("#sendDoc-content").show();
                                $("#sendDocDropdownArea").show();
                                $("#totalTab").find("#sendDoc").parent().addClass("active");
                            break;
                            case 2:
                                tabCode = 3;
                                $("#signBack-content").show();
                                $("#totalTab").find("#signBack").parent().addClass("active");
                            break;
                            case 3:
                                tabCode = 4;
                                $("#share-content").show();
                                $("#totalTab").find("#receivedFinish").parent().addClass("active");
                            break;
                            case 4:
                                tabCode = 5;
                                $("#sendDocFinish-content").show();
                                $("#totalTab").find("#sendDocFinish").parent().addClass("active");
                            break;
                            case 5:
                                tabCode = 6;
                                $("#invalid-content").show();
                                $("#totalTab").find("#invalid").parent().addClass("active");
                            break;
                        }
                    }
                    
                }
                
                toShowDataOpen(dataObj);
            });
        }else{
            toShowDataOpen(dataObj);
        }

    }
}

function widowsOpen(dataObj, isLoad){
    // console.log(dataObj);
    if(dataObj.i != undefined){
        var sendData = {
            api: typeAPI + "getDrfType",
            data:{
                uid: dataObj.i
            }
        };
        $.getJSON(wrsUrl, sendData, function(rs){
            if(rs.status && rs.type != null){
                var thisType = parseInt(rs.type);
                dataObj.s = thisType;
                
                if(thisType > 0){
                    $("#received-content").hide();
                    $("#sendDocDropdownArea").hide();
                    switch(thisType){
                        case 1:
                            tabCode = 2;
                            $("#sendDocDropdownArea").show();
                            $("#sendDoc-content").show();
                            $("#totalTab").find("#sendDoc").parent().addClass("active");
                        break;
                        case 2:
                            tabCode = 3;
                            $("#signBack-content").show();
                            $("#totalTab").find("#signBack").parent().addClass("active");
                        break;
                        case 3:
                            tabCode = 4;
                            $("#share-content").show();
                            $("#totalTab").find("#receivedFinish").parent().addClass("active");
                        break;
                        case 4:
                            tabCode = 5;
                            $("#sendDocFinish-content").show();
                            $("#totalTab").find("#sendDocFinish").parent().addClass("active");
                        break;
                        case 5:
                            tabCode = 6;
                            $("#invalid-content").show();
                            $("#totalTab").find("#invalid").parent().addClass("active");
                        break;
                    }
                    $("#totalTab").find("#received").parent().removeClass("active");
                    $("#received-content").hide();
                }
                
            }
            if(parseInt(dataObj.ve)){
                getData();
            }
            
        });

    }
}

function toShowDataOpen(dataObj){
    // 做簽核
    if(dataObj.s != undefined && (parseInt(dataObj.s) == 1 || parseInt(dataObj.s) == 2 || parseInt(dataObj.s) == 4 || parseInt(dataObj.s) == 5)){
        var sendData = {
            api: waDrfAPI + "getDispatch",
            data:{
                uid: dataObj.i,
                sys_code_id: sys_code,
                user_id: userID
            }
        };
        
    }else{ // 單純收文
        
        var sendData = {
            api: referenceAPI + "getReference",
            data:{
                uid: dataObj.i,
                sys_code_id: sys_code,
                user_id: userID
            }
        };
        
    }

    getPageListData(sendData, function(rs){
        if(rs.status && rs.data != null){
            if(dataObj.s != undefined){
                if(parseInt(dataObj.s) == 1){
                    sendDocViewDialog(rs.data[0], undefined, false);
                }else{
                    referenceViewDialog(rs.data[0],undefined,false);
                }
            }
        }else{
            msgDialog("這筆資料不是您可以查閱的，請確認後再嘗試",true,function(){ 
                deleteHash();
            });
        }
    });
}

// 放資料
function putDataToPage(data, putArea, hashData, signPos){
    if(hashData == undefined){
        hashData = null;
    }
    if(signPos == undefined){
        signPos = null;
    }
    // 畫面設定值
    var style = "reference-list";
    if(tabCode == 2){
        style = "sendDoc-list";
    }else if(tabCode == 3){
        style = "ban-list";
    }else if(tabCode > 3){
        style = "finish-list";
    }
    var option = {styleKind:"received-issued",style:style};



    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        var docIDStr = "";
        $.each(data, function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).find("i").tooltip();
            if(hashData != null){
                if(content.uid == parseInt(hashData.i)){
                    $(pageStyleObj).addClass("hashData");
                }
            }
            // console.log(signPos);
            listDataInfoToShow(putArea, pageStyleObj, content, true, undefined, signPos);
            if(tabCode == 2 && (parseInt(content.status) == 1 || parseInt(content.status) == 3)){
                docIDStr += content.uid + ",";
            }

            if(tabCode == 2 && $.inArray("1",userPosition) != -1 && parseInt(content.status) == 5){
                otherProcessDocData.push(content.uid);
            }
        });
        putArea.find(".dataContent").last().removeClass("list-items-bottom");

        // 是擬文的時候，取得“審核中”更詳盡的狀態
        if(tabCode == 2){
            if(docIDStr){
                docIDStr = docIDStr.substr(0, docIDStr.length - 1);
                sendDocIDStr = docIDStr;
                var sendObj = {
                    api : "ApdData/GetApdData_DocStatus",
                    threeModal: true,
                    data:{
                        docID: docIDStr
                    }
                }

                $.post(wrsUrl, sendObj, function(rs){
                    rs = $.parseJSON(rs);
                    if(rs.Status){
                        docSignStatus = rs.Data;
                        pushSignStatus(rs.Data);
                    }
                });
                // 有權限處理的資料
                var sendObj = {
                    api : "ApdData/GetApdData_ProcessDoc",
                    threeModal: true,
                    data:{
                        docID: docIDStr,
                        userID: userID
                    }
                }

                $.post(wrsUrl, sendObj, function(rs){
                    rs = $.parseJSON(rs);
                    if(rs.Status){
                        processDocData = rs.Data;
                        if(rs.Data.length != 0 || otherProcessDocData.length != 0){
                            hideDocNotProcessData(rs.Data);
                        }else{
                            $("#sendDocDropdownBtn").find("#sendDocDropdownText").text($("#sendDocDropdownBtn").find("#sendDocAllBtn").text());
                        }
                    }
                });

            }
        }
    });
}

// 將審核中改為詳盡狀態
function pushSignStatus(data){
    $("#sendDoc-content").find(".dataContent").each(function(){
        var uid = $(this).data("uid");
        if( data[uid] != undefined ){
            $(this).find(".list-items").eq(4).text(data[uid]);
        }
    });
}

// 將非自身需要處理的資料隱藏
function hideDocNotProcessData(data){
    $("#sendDoc-content").find(".dataContent").each(function(){
        var uid = $(this).data("uid");
        if( ($.inArray(uid, processDocData) != -1 || $.inArray(uid,otherProcessDocData) != -1)){
            $(this).show();
        }else{
            $(this).hide();
        }
    });
}

// 顯示所有擬文資料
function shoDocAllData(data){
    $("#sendDoc-content").find(".dataContent").each(function(){
        $(this).show();
    });
}

// 新增類
function tabInsert(){
    if(tabCode == 1){
        if(userPosition.length > 0 && $.inArray( "1", userPosition ) != -1){
            // 收文
            referenceInsertDialog();
        }
    }else if(tabCode == 2){
        // insertDialog();
        if(userLoginInfo.orgid != null && userLoginInfo.posid != null){
            selectSampleDialog();
        }else{
            var msg = "";
            if(userLoginInfo.isAdmin){
                msg += "，按下關閉後將導入內部使用者介面進行設定";
            }else{
                msg += "，請聯絡管理員協助設定";
            }
            msgDialog("尚未設定組織或部門"+msg, true, function(){
                if(userLoginInfo.isAdmin){
                    loadPage("user-mana/person","pagescontent");
                }
            });
        }
    }
}

// 確認資料顯示的內容
function listDataInfoToShow(putArea, pageStyleObj, content, isPutToPage, beforItem, signPos){
    if(isPutToPage == undefined){
        isPutToPage = true;
    }

    if(signPos == undefined){
        signPos = null;
    }

    $(pageStyleObj).addClass("dataContent");

    // 放置id
    $(pageStyleObj).data("uid", content.uid);

    // 事項標題
    $(pageStyleObj).find(".list-items").eq(0).html(content["doc_number"]);

    // 主旨
    $(pageStyleObj).find(".list-items").eq(1).text(content.subject);

    // 速別/密等
    var str = "";
    var secText = "";
    if(tabCode == 1){
        str = content.receive_time;
        secText = content.from_name;
    }else if(tabCode == 2){
        str = (content.dispatch_end_date)?content.dispatch_end_date:"-";
        secText = content.pricipalUserName;
    }else if(tabCode == 3 || tabCode == 6){
        str = (content.sendDate)?content.sendDate:"-";
        secText = content.pricipalUserName;
    }else if(tabCode == 5){
        str = (content.sendDate)?content.sendDate:"-";
        secText = content.pricipalUserName;
    }else if(tabCode == 4){
        str = (content.receive_time)?content.receive_time:"-";
        secText = content.from_name;
    }
    // $(pageStyleObj).find(".list-items").eq(3).text(str);

    // 預警
    // var endDate = (content.endDate)? content.endDate : "-";
    // $(pageStyleObj).find(".list-items").eq(3).text(endDate);
    $(pageStyleObj).find(".list-items").eq(2).text(secText);
    $(pageStyleObj).find(".list-items").eq(3).text(str);

    
    if(tabCode == 1 || tabCode == 2){
        // 狀態
        var statusItem = $(pageStyleObj).find(".list-items").eq(4);
        statusItem.text(content.statusName)
        if(tabCode == 1 && content.relaventUsers != undefined){
            var processUserName = "";
            $.each(content.relaventUsers, function(i,v){
                processUserName += v.userName + ",";
            });
            processUserName = processUserName.substr(0,processUserName.length - 1);
            statusItem.prop("title",processUserName);
            statusItem.tooltip();
        }
    }
    
    // 閱讀按鈕-共通的
    var readBtn = $(pageStyleObj).find(".fa-file-text-o");

    if(tabCode == 1){
        
        // 退回總收發
        var backReceived = $(pageStyleObj).find(".fa-arrow-circle-left");
        // 分文按鈕
        var pushDocBtn = $(pageStyleObj).find(".fa-sitemap");
        // 開始做按鈕
        var startBtn = $(pageStyleObj).find(".fa-chain-broken");
        // 辦況
        var courseBtn = $(pageStyleObj).find(".fa-plus-circle");
        // 辦況列表
        var doneListBtn = $(pageStyleObj).find(".fa-list-alt");
        // 完成按鈕
        var finishBtn = $(pageStyleObj).find(".fa-check-circle-o");
        // 回文按鈕
        var replyBtn = $(pageStyleObj).find(".fa-reply");
        // 行事曆
        var calendarBtn = $(pageStyleObj).find(".fa-calendar");
        // 目前先砍
        // replyBtn.remove();
        // 退回總承辦
        if(parseInt(content.status) != 1 || !parseInt(content.pos_des)){
            backReceived.remove();
        }
        // 辦況
        if(!parseInt(content.pos_do) || (parseInt(content.status) != 3 && parseInt(content.status) != 6)){
            courseBtn.remove();
        }

        if(parseInt(content.status) < 3 ){
            // 辦況按鈕
            doneListBtn.remove();
            calendarBtn.remove();
        }

        if(!$.trim(content.todo_uid)){
            calendarBtn.remove();
        }

        // 閱讀權限按鈕
        if(!parseInt(content.pos_read)){
             readBtn.remove();
        }
        // 分文按鈕
        if(!parseInt(content.pos_setof)){
            pushDocBtn.remove();
        }else{
            // if(content.status != 0 && content.status != 1){
            if(content.status != 0){
                pushDocBtn.remove();
            }
        }

        // 開始按鈕
        if(!parseInt(content.pos_do)){
            // startBtn.remove();
            // 完成按鈕
            finishBtn.remove();
            // 回文按鈕
            replyBtn.remove();
            calendarBtn.remove();
        }else{
            // if(content.status != 2 ){
            //    startBtn.remove();
            // }
            // 完成按鈕
            if(content.status != 3 && content.status != 6){
               finishBtn.remove();
               // 回文按鈕
               replyBtn.remove();
            }
        }
        // 回文
        if(!parseInt(content.reply)){
            replyBtn.remove();
        }else{
            calendarBtn.remove();
            finishBtn.remove();
        }

        // 預覽
        readBtn.click(function(){
            referenceViewDialog(content, $(pageStyleObj));
        });
        
        // 分文
        pushDocBtn.click(function(){
            // 設定組織
            if(content.status == 0){
                orgTreeDialog(content, $(pageStyleObj));
            }else if(content.status == 1){ // 設定承辦事項
                // userListData(content, $(pageStyleObj));
                // 新的
                // setReferenceCalendarDialog(content, $(pageStyleObj));
                referenceChooseProcessType(content, $(pageStyleObj));
            }
        });
        // 開始做的圖示
        startBtn.click(function(){
            processItem($(pageStyleObj), content);
        });

        // 辦況按鈕新增
        courseBtn.remove();
        // courseBtn.click(function(){
            
        //     referenceCheckItemDialog(content, $(pageStyleObj));
        // });

        // 完成
        finishBtn.remove();
        finishBtn.click(function(){
            var option = {
              sureCall: function(){
                finishReferenceAndCalendar(content.uid, $(pageStyleObj));
              },
              title: "完成訊息",
              sureText: "完成",
            };
            var msg = "若將「"+content.doc_number+"」完成，則將無法異動本次相關資料，<br>";
            msg += "您確定要完成並送出「"+content.doc_number+"」？";
            chooseDialog(msg, option);
            // $(this).remove();
            // referenceCheckItemFinishDialog(content, $(pageStyleObj));

        });

        // 辦況歷史記錄
        doneListBtn.remove();
        // doneListBtn.click(function(){
        //     referenceDoneListView(content);
        // });

        // 回文
        replyBtn.click(function(){
            var sendData = {
                api: referenceAPI+"getReference",
                data:{
                    userId:userID,
                    uid: content.uid,
                    sysCodeId:sys_code
                }
            }
            getPageListData(sendData, function(rs){
                // console.log(rs);
                if(rs.status && rs.data != null){
                    var sourceData = {
                        uid: content.uid,
                        doc_number: content.doc_number,
                        // 來文單位
                        fromID : rs.data[0]["come_from"]
                    }
                    selectSampleDialog(sourceData);
                }else{
                    msgDialog("無法讀取資料，請稍候再嘗試");
                }
            });
            
        });

        // 部門退回文鈕
        backReceived.click(function(){
            var option = {
              sureCall: function(){
                orgReferenceBack(content,$(pageStyleObj));
              },
              title: "退回訊息",
              sureText: "退回",
              sureClass: "btn-danger"
            };
            var msg = "若將「"+content.doc_number+"」退回，再次分派部門前將無法異動，<br>";
            msg += "您確定要退回「"+content.doc_number+"」？";
            chooseDialog(msg, option);
        });

        // 行事曆點選後前往待辦
        calendarBtn.click(function(){
            var hash = {
                i: content.todo_uid,
                ct: 4
            };
            hashLoadPage("calendar/list", hash, "pagescontent");
            // getCalendarUidData(701, function(calendarData){
            //     calendarView(calendarData);
            // });
            return;
            if(content.todo_uid != ""){
                getCalendarUidData(content.todo_uid, function(calendarData){
                    calendarView(calendarData);
                });
            }else{
                msgDialog("無法取得待辦資料");
            }
        });

        if(content.CompletionDate){
            $(pageStyleObj).find(".fa-pencil-square-o").remove();
            $(pageStyleObj).find(".fa-check").remove();
        }

    }else if(tabCode == 2){
        // if(parseInt(content.wfPos) == 0){
        //     $(pageStyleObj).find(".fa-list-alt").remove();
        // }
        // 簽核檢閱按鈕
        var signStatusBtn = $(pageStyleObj).find(".fa-list-alt");
        // if(signPos == null || signPos.Data == undefined){
        if(signPos == null){
            signStatusBtn.remove();
        // }else if(signPos != null && signPos.Data != undefined){
        }else if(signPos != null){
            if($.inArray(content.uid, signPos) == -1){
                signStatusBtn.remove();
            }
        }

        // 文件狀態
        if(content.status == 2){
            $(pageStyleObj).find(".list-items").eq(4).addClass("received-back");
        }
        // 簽核狀態預覽
        signStatusBtn.click(function(){
            signStatusViewDialog(content);
        });

        // 文件預覽
        readBtn.click(function(){
            sendDocViewDialog(content, $(pageStyleObj));
        });

        // 重新送審
        var modifyDocBtn = $(pageStyleObj).find(".fa-pencil-square-o");
        // 退件才可以按
        if( (parseInt(content.status) == 2 || parseInt(content.status) == 6) && parseInt(content.pos_modify) ){
            modifyDocBtn.click(function(){
                insertDialog( content, $(pageStyleObj) );
            });
        }else{
            modifyDocBtn.remove();
        }

        var pos_setof = (content.pos_setof == undefined) ? 0 : parseInt(content.pos_setof);
        // 回填
        var fileUpload = $(pageStyleObj).find(".fa-cloud-upload");
        // 只有上傳回填才可以按
        if(parseInt(content.status) == 5 && pos_setof == 1){
            fileUpload.click(function(){
                sendDocFileUpload(content, $(pageStyleObj));
            });
        }else{
            fileUpload.remove();
        }

        // 列印按鈕
        var printBtn = $(pageStyleObj).find(".fa-print");
        
        // 完成才可以按
        if((parseInt(content.status) == 4 || parseInt(content.status) == 5) && $.inArray( "1", userPosition ) != -1){
            printBtn.click(function(){
                sendDocPrintSelect(content);
            });
        }else{
            printBtn.remove();
        }

        //歷史檔案
        var historyBtn = $(pageStyleObj).find(".fa-list-ol");
        if(parseInt(content.status) == 4){
            historyBtn.click(function(){
                sendDocDoneListView(content);
            });
        }else{
            historyBtn.remove();
        }
        // console.log(docSignStatus);
        var uid = content.uid;
        if(parseInt(content.status) == 1 && (docSignStatus[uid] != undefined ||  docSignStatus[parseInt(uid)] != undefined)){
            // 狀態
            $(pageStyleObj).find(".list-items").eq(4).text(docSignStatus[uid]||docSignStatus[parseInt(uid)]);
            
        }

        // printBtn.click(function(){
        //     sendDocPrintSelect(content);
        // });

    }else if(tabCode == 3){
        // 重新送審
        var modifyDocBtn = $(pageStyleObj).find(".fa-pencil-square-o");
        if(!parseInt(content.pos_modify)){
            modifyDocBtn.remove();
        }
        // 簽核狀態預覽
        $(pageStyleObj).find(".fa-list-alt").click(function(){
            signStatusViewDialog(content);
        });
        // 修改
        modifyDocBtn.click(function(){
            insertDialog( content, $(pageStyleObj) );
        });

        // 文件預覽
        readBtn.click(function(){
            sendDocViewDialog(content, $(pageStyleObj));
        });

    }else{
        var historyBtn = $(pageStyleObj).find(".fa-list-ol");
        if(tabCode == 4){
            historyBtn.remove();
            $(pageStyleObj).find(".fa-list-alt").remove();
            readBtn.click(function(){
                referenceViewDialog(content, $(pageStyleObj));
            });
        }else if(tabCode == 5 || tabCode == 6){
            
            if(tabCode == 5){
                historyBtn.click(function(){
                    sendDocDoneListView(content);
                });
            }else{
                historyBtn.remove();
            }
            // 簽核狀態預覽
            $(pageStyleObj).find(".fa-list-alt").click(function(){
                signStatusViewDialog(content);
            });
            readBtn.click(function(){
                sendDocViewDialog(content, $(pageStyleObj));
            });
        }

    }


    if(putArea != null && putArea != undefined){
        if(putArea.find(".data-empty").length){
            $(putArea).find(".data-empty").remove();
            $(pageStyleObj).appendTo(putArea);
        }else if(isPutToPage){
            if(beforItem == undefined){
                $(pageStyleObj).appendTo(putArea);
            }else{
                $(beforItem).before(pageStyleObj);
            }
        }
    }
    
}

// 重新放置單筆資料
function renewListData(pageObjArea, content, isModify){
    if(isModify == undefined){
        isModify = false;
    }
    // 先取得資料

    var method = referenceAPI + "getReferenceList";
    var style = "reference-list";

    if(tabCode == 2 || tabCode == 3){
        method = waDrfAPI + "getDispatchList";
        style = "sendDoc-list";
    }

    var uid = (content.uid != undefined) ? content.uid : content;
    var sendObj = {
        api: method,
        data: {
            userId: userID,
            uid: uid,
            sysCodeId: sys_code
        }
    }
    $.getJSON(wrsUrl, sendObj).done(function(rs){
        // console.log(rs);
        
        if(rs.status && rs.data != null){
            // 畫面設定值
            var option = {styleKind:"received-issued",style:style};
            // 取得畫面樣式
            getStyle(option,function(pageStyle){
                $.blockUI();
                var pageStyleObj = $.parseHTML(pageStyle);
                if($.inArray(uid.toString(),processDocData) == -1 && tabCode == 2){
                    $(pageStyleObj).hide();
                }
                if(!isModify){
                    var itemActionBtn = $(pageStyleObj).find(".item-actionBtn").clone();
                    $(pageObjArea).find(".item-actionBtn").html(itemActionBtn);
                    listDataInfoToShow(null, pageObjArea, rs.data[0], false,undefined,signPosList);
                }else{
                    listDataInfoToShow(pageObjArea, pageStyleObj, rs.data[0], true, pageObjArea.find(".dataContent").eq(0), signPosList);
                    pageObjArea.find(".dataContent").last().removeClass("list-items-bottom");
                }
                $.unblockUI();

            });
        }else{
            msgDialog(rs.Message || "無法取得資料，將重新載入；點選關閉後，將重新載入",true, function(){
                getData();
            });
        }
    });
    
}


// 開始做事項
function processItem(pageObjArea, content){
    $.blockUI();
    var sendObj = {
        api: referenceAPI+"setReferenceWorkStatus",
        data:{
            uid: content.uid,
            status: 1
        }
    };

    $.post(wrsUrl, sendObj, function(rs){
        $.unblockUI();
        var rs = $.parseJSON(rs);
        if(rs.status){
            msgDialog("「"+content["doc_number"]+"」開始辦理", false);
            renewListData(pageObjArea, content);
        }else{
            msgDialog(rs.Message);
        }
    });
}

function putDataEmptyInfo(putArea){
    // 畫面設定值
    var option = {styleKind:"system",style:"data-empty"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        // 相關設定
        putArea.append(pageStyle);

        putArea.find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}

// 準備簽核前的視窗，顯示與設定最後結束日期
function signInfoAndDate(sendObj, modifyItem,putFormArea, isReDispatch){
    $("#signInfoAndDateDialog").remove();
    $("#setReferenceDateDailog").remove();

    $("<div>").prop("id","signInfoAndDateDialog").appendTo("body");

    $("#signInfoAndDateDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        // headerCloseBtn:false,
        // modalClass: "bsDialogWindow",
        title: "設置簽核結束日期",
        start: function(){
            var option = {
                styleKind: "received-issued",style:"undertake-dateandtype"
            }
            getStyle(option,function(pageStyle){
                var pageStyleObj = $.parseHTML(pageStyle);
                var thisMaxDate = new Date(sendObj.dispatch_end_date);
                $(".ui-datepicker").remove();
                var dateOption = {
                    dateFormat: "yy-mm-dd",
                    onSelect: function(dateText, inst) {
                        $(pageStyleObj).find("#end_date_content").removeClass("item-bg-danger").text(dateText);
                        $(pageStyleObj).find("#end_date").val(dateText);
                        $(pageStyleObj).find("#endDateSelect").hide();
                    },
                    minDate: 0,
                    maxDate: thisMaxDate
                };

                $(pageStyleObj).find("#endDateSelect").hide().datepicker(dateOption);
                
                $(pageStyleObj).find("#end_calendar").click(function(){
                    $(pageStyleObj).find("#endDateSelect").toggle();
                });
                
                $(pageStyleObj).appendTo($("#signInfoAndDateDialog").find(".modal-body"));
            });
        },
        button:[
            {
                text: "會簽",
                className: "btn-info",
                click: function(){
                    var end_date = $("#signInfoAndDateDialog").find("#end_date").val();
                    
                    if(end_date){
                        sendObj.end_date = end_date;
                        sendObj.actionType = 0;
                        sendObj.userID = userID;
                        sendObj.sys_code = sys_code;
                        // signWFSelect(sendObj, modifyItem,putFormArea, isReDispatch);
                        countersignOrgTreeDialog(sendObj, modifyItem, putFormArea, isReDispatch);

                    }else{
                        $("#signInfoAndDateDialog").find("#end_date_content").text("尚未選擇日期").addClass("item-bg-danger");
                        
                    }
                }
            },
            {
                text: "簽核",
                className: "btn-success",
                click: function(){
                    var end_date = $("#signInfoAndDateDialog").find("#end_date").val();
                    if(end_date){
                        sendObj.end_date = end_date;
                        sendObj.actionType = 1;
                        sendObj.userID = userID;
                        sendObj.sys_code = sys_code;
                        
                        // console.log(sendObj);
                        // return;
                        var option = {
                          sureCall: function(){
                            saveSignData(sendObj, modifyItem, putFormArea, isReDispatch);
                          },
                          sureText: "確認",
                          closeText: "取消",
                          title: "提示訊息"
                        };
                        var msg = "您確定要開始簽核？";
                        chooseDialog(msg, option);
                        
                        // signWFSelect(sendObj, modifyItem,putFormArea, isReDispatch);
                        // $("#signInfoAndDateDialog").bsDialog("close");

                    }else{
                        $("#signInfoAndDateDialog").find("#end_date_content").text("尚未選擇日期").addClass("item-bg-danger");
                    }
                }
            }
        ]
    });
}

// 簽核WF設定
function signWFSelect(sendObj, modifyItem,putFormArea, isReDispatch){
    // actionType是該文件簽核類型（0:匯簽,1:簽核）
    var data = [];
    var sendData = {
        api: "workflow/getWorkFlow",
        threeModal: true,
        data:{
            sys_code:sys_code,
            menu_code:menu_code
        }
    };

    $.getJSON(wrsUrl,sendData,function(rs){
        // $("#signDocDialog").find(".modal-body").append(orgChart);
        if(rs.status){
            data = rs.data;
            signWFDialog(data, sendObj, modifyItem,putFormArea, isReDispatch);
        }else{
            msgDialog("尚未有簽核流程，請新增後再嘗試");
        }
    });
}

function signWFDialog( data, sendObj, modifyItem,putFormArea, isReDispatch ){
    // console.log(sendObj);
    $("#signWFDialog").remove();
    $("<div>").prop("id","signWFDialog").appendTo("body");
    var title = "";

    if(sendObj.actionType){
        title += "請選擇簽核流程";
    }else{
        title += "請選擇會簽流程";
    }
    var signWFDialog = $("#signWFDialog").bsDialogSelect({
        autoShow:true,
        showFooterBtn:true,
        // headerCloseBtn:false,
        // modalClass: "bsDialogWindow",
        title: title,
        data: data,
        textTag: "name",
        valeTag: "uid",
        view: true,
        viewAction: function(data){
            getADPDataWF(data.uid);
        },
        button:[
            {
                text: "返回",
                // className: "btn-success",
                click: function(){
                
                    $("#signWFDialog").bsDialog("close");
                    
                }
            },
            {
                text: "確定",
                className: "btn-success",
                click: function(){
                    var wfID = signWFDialog.getValue();
                    // console.log(wfID);
                    if(wfID){
                        sendObj.wfID = wfID;
                        sendObj.userID = userID;
                        sendObj["sys_code"] = sys_code;
                        // console.log(sendObj);
                        saveSignData(sendObj, modifyItem, putFormArea, isReDispatch);
                        // $("#signWFDialog").bsDialog("close");
                    }else{
                        msgDialog("未選擇簽核流程");
                    }
                }
            }
        ]
    });
}

// 取得簽核資料
function getADPDataWF(wfUid){
    var sendData = {
        api: "ApdData/GetData_WorkFlow",
        threeModal: true,
        data: {
            wf_uid: wfUid,
            sys_code: sys_code
        }
    };
    $.getJSON(wrsUrl, sendData,function(rs){
        // console.log(rs);
        // 整理資料
        if(rs.status){
            var modifyObj = {};
            modifyObj.layer = {};
            modifyObj.layerName = {};
            $.each(rs.data,function(index,content){
                if(index == 0){
                    modifyObj.name = content.title;
                    modifyObj.uid = content.uid;
                }
                if(typeof modifyObj.layer[content.layer] == "undefined"){
                    modifyObj.layer[content.layer] = [];
                    modifyObj.layerName[content.layer] = [];
                }
                modifyObj.layer[content.layer].push(content.data_uid);
                modifyObj.layerName[content.layer].push(content.orgName);
            });
            signworkViewDialog(modifyObj);
        }else{
            msgDialog("無法取得資料，請重新整理之後再嘗試");
        }
    });
}

// 在選擇階段加號後，放置部門的內容
function orgContentPutList(putArea,id,name,canDel){
    if(canDel == undefined){
        canDel = true;
    }
    var dataStyle = $("<div>").addClass("col-xs-12 col-md-12 item-list-border contents signflowItem");
    // var content = $("<div>").addClass("col-xs-12 col-md-12");
    
    var strContent = $("<div>").addClass("col-xs-11 col-md-9");
    var trashContent = $("<div>").addClass("col-xs-1 col-md-3");
    var idContent = $("<input>").prop("type","hidden").addClass("flowID").val(id);
    // <i class="fa fa-trash-o"></i>
    strContent.text(name).appendTo(dataStyle);
    if(canDel){
        var trash = $('<i class="fa fa-trash-o mouse-pointer cancel-btn"></i>');
        trash.click(function(){
            dataStyle.remove();
            if(!putArea.find(".signflowItem").length){
                var emptyContent = $("<div>").addClass("empty").html("此順序未有資料");
                
                putArea.html(emptyContent);
            }
        });
        trashContent.append(trash).appendTo(dataStyle);
    }
    
    idContent.appendTo(dataStyle);
    dataStyle.appendTo(putArea);
}

// 多檔案上傳
function fileSelect(putFormArea){
    var fileInput = $("<input>").prop("type","file").prop("name","files[]").change(function(){
        var fileThis = $(this);
        getFileLimit(sys_code, function(rs){
            var fileSize = clientFileUnitTrans(fileThis.prop("files")[0].size, rs.Unit);
            if((rs.LastSpace - fileSize) > 0){
                // console.log($(this));
                var names = $.map(fileThis.hide().prop("files"), function(val,i) { 
                    // return val.name; 
                    // console.log(val)
                    var borderDiv = $("<div>").addClass("col-xs-12 col-md-12");
                    var infoDiv = $("<div>").addClass("col-xs-10 col-md-10").html(val.name);
                    var trash = $('<i>').addClass('fa fa-trash-o mouse-pointer cancel-btn');
                    var deleteDiv = $("<div>").addClass("col-xs-2 col-md-2");
                    trash.click(function(){
                        fileInput.remove();
                        borderDiv.remove();
                    });
                    trash.appendTo(deleteDiv);
                    borderDiv.append(infoDiv).append(deleteDiv);
                    $("#insertDialog").find("#isSelectFile").find(".control-label").eq(1).append(borderDiv);
                });

                // console.log(names);
                fileThis.appendTo(putFormArea);
            }else{
                var last = serverFileUnitTrans(parseFloat(rs.LastSpace));
                msgDialog("您剩餘的空間不足，請選擇請確認檔案大小，剩餘:"+last.LastSpace+last.Unit);
            }
        });
        // console.log(formObj);
        $("#insertDialog").find("#isSelectFile").show();
    });
    fileInput.click();
}

// 多檔案上傳
function newFileSelect(putFormArea, selectInfoArea){
    var fileInput = $("<input>").hide().prop("type","file").prop("name","files[]").change(function(){
        var fileThis = $(this);
        getFileLimit(sys_code, function(rs){
            var fileSize = clientFileUnitTrans(fileThis.prop("files")[0].size, rs.Unit);
            if((rs.LastSpace - fileSize) > 0){
                // console.log($(this));
                var names = $.map(fileThis.prop("files"), function(val,i) { 
                    // return val.name; 
                    // console.log(val)
                    var borderDiv = $("<div>").addClass("col-xs-12 col-md-12");
                    var infoDiv = $("<div>").addClass("col-xs-10 col-md-10").html(val.name);
                    var trash = $('<i>').addClass('fa fa-trash-o mouse-pointer cancel-btn');
                    var deleteDiv = $("<div>").addClass("col-xs-2 col-md-2");
                    trash.click(function(){
                        fileInput.remove();
                        borderDiv.remove();
                    });
                    trash.appendTo(deleteDiv);
                    borderDiv.append(infoDiv).append(deleteDiv);
                    // $("#insertDialog").find("#isSelectFile").find(".control-label").eq(1).append(borderDiv);
                    selectInfoArea.append(borderDiv);
                });

                // console.log(names);
                fileThis.appendTo(putFormArea);
                // console.log(formObj);
            }else{
                var last = serverFileUnitTrans(parseFloat(rs.LastSpace));
                msgDialog("您剩餘的空間不足，請選擇請確認檔案大小，剩餘:"+last.LastSpace+last.Unit);
            }
        });
    });
    fileInput.click();
}

// 多檔案上傳
function calendarFileSelect(putFormArea, calendarItemType, selectInfoArea){
    var fileInput = $("<input>").hide().prop("type","file").prop("name","files["+calendarItemType+"][]").change(function(){
        var fileThis = $(this);
        getFileLimit(sys_code, function(rs){
            var fileSize = clientFileUnitTrans(fileThis.prop("files")[0].size, rs.Unit);
            if((rs.LastSpace - fileSize) > 0){
                // console.log($(this));
                var names = $.map(fileThis.prop("files"), function(val,i) { 
                    // return val.name; 
                    // console.log(val)
                    var borderDiv = $("<div>").addClass("col-xs-12 col-md-12");
                    var infoDiv = $("<div>").addClass("col-xs-10 col-md-10").html(val.name);
                    var trash = $('<i>').addClass('fa fa-trash-o mouse-pointer cancel-btn');
                    var deleteDiv = $("<div>").addClass("col-xs-2 col-md-2");
                    trash.click(function(){
                        fileInput.remove();
                        borderDiv.remove();
                    });
                    trash.appendTo(deleteDiv);
                    borderDiv.append(infoDiv).append(deleteDiv);
                    // $("#insertDialog").find("#isSelectFile").find(".control-label").eq(1).append(borderDiv);
                    selectInfoArea.append(borderDiv);
                });

                // console.log(names);
                fileThis.appendTo(putFormArea);
                // console.log(formObj);
            }else{
                var last = serverFileUnitTrans(parseFloat(rs.LastSpace));
                msgDialog("您剩餘的空間不足，請選擇請確認檔案大小，剩餘:"+last.LastSpace+last.Unit);
            }
        });
    });
    fileInput.click();
}


function chartToHtml(htmlString){
    return htmlString.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

// 取得收文列表資料(用於來文憑依)
function getReferenceList(infoPutArea, valuePutArea, selectData){
    var totalListArr = [];
    var ReferenceTitle = "";
    var ReferenceContent = "";
    // 取收文
    var sendData = {
        api: referenceAPI + "getReferenceList",
        data:{
            userId:userID,
            sysCodeId:sys_code
        }
    };

    getPageListData(sendData, function(rs){
        if(rs.status && rs.data != null){
            totalListArr = $.merge(rs.data, totalListArr);
        }else{
            ReferenceTitleStr = "來文";
            ReferenceContent = "新增收文後";
        }
        // 取擬文且已發文的
        var sendData = {
            api: waDrfAPI + "getDispatchList",
            data:{
                userId:userID,
                sysCodeId:sys_code,
                type: 3
            }
        };
        getPageListData(sendData, function(rs2){
            if(rs2.status && rs2.data != null){
                totalListArr = $.merge(rs2.data, totalListArr);
                selectReferenceList(totalListArr, infoPutArea, valuePutArea, selectData);
            }else{
                var str = "";
                if(ReferenceTitle){
                    str = "未有"+ReferenceTitle+"或已發之公文，若需選擇收文或已發之公文，請"+ReferenceContent+"或發文後再使用";
                }else{
                    str = "未有已發之公文，若需選擇已發之公文，請發文後再使用";
                }
                msgDialog(str);
            }
        });
    });
}

// 取得收文列表資料(用於來文憑依)
function selectReferenceList(listData, infoPutArea, valuePutArea, selectData){
    if(selectData == undefined){
        selectData = [];
    }
    // console.log(sendObj);
    $("#selectReferenceListDialog").remove();
    $("<div>").prop("id","selectReferenceListDialog").appendTo("body");
    var title = "選擇關聯文號";

    var selectReferenceList = $("#selectReferenceListDialog").bsDialogSelect({
        autoShow:true,
        showFooterBtn:true,
        title: title,
        data: listData,
        textTag: "doc_number",
        valeTag: "uid",
        selectData: selectData,
        onlySelect: false,
        button:[
            {
                text: "取消",
                // className: "btn-success",
                click: function(){
                
                    $("#selectReferenceListDialog").bsDialog("close");
                    
                }
            },
            {
                text: "確定",
                className: "btn-success",
                click: function(){
                    $(infoPutArea).empty();
                    var selectData = selectReferenceList.getValue();
                    if(selectData.length){                        
                        $(valuePutArea).val(selectData);
                        var selectText = selectReferenceList.getText();
                        // selectText = selectText.split(",");
                        // $.each(selectText, function(i, v){
                        //     var border = $("<div>").addClass("col-xs-12 col-md-12 control-label list-items list-items-bottom");
                        //     border.append(v);

                        //     $(infoPutArea).append(border);
                        // });
                        $(infoPutArea).append(selectText);
                        $("#selectReferenceListDialog").bsDialog("close");
                    }else{
                        msgDialog("尚未選擇來文依據");
                    }
                }
            }
        ]
    });
}

function getCalendarUidData(uid, callback){
    var sendData = {
        api: calendarAPI+"GetToDoItem",
        data:{
            uid: uid,
            userId: userID,
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.Status){
            callback(rs.Data);
        }else{
            msgDialog("無法取得待辦資料");
        }
    });
}

function creatHistory(historyData, historiesArea, isModify){
    if(historyData.length){
        var style = "sys-history";
        var option = {styleKind:"calendar-list",style:style};
        getStyle(option,function(historyPage){
            $.each(historyData, function(historiesIndex, historiesContent){
                createHistories(historyPage, historiesContent, historiesArea, isModify);
            });
        });
    }
}

// 創建歷程
function createHistories(historiesStyle, content, putArea, isModify){
    var historiesObj = $.parseHTML(historiesStyle);
    // 新增辦況檔案上傳區
    var selectInfoArea = $(historiesObj).find("#historyFileInfo");
    // 辦況
    $(historiesObj).find("#historyContent").show().html(content.Desc);
    // 讀取、放檔案
    if(content.Doc != undefined && content.Doc.length){
        if(!$(historiesObj).find("#haveFile").find(".fa-paperclip").length){
            var fileIcon = $("<i>").addClass("fa fa-paperclip");
            $(historiesObj).find("#haveFile").append(fileIcon);
        }
        var isExpand = false;

        selectInfoArea.hide();
        $(historiesObj).find("#expandBtn").addClass("mouse-pointer").unbind("click").click(function(){
            var option = {
                effect:"blind",
                complete:function(){
                    if(!isExpand){
                        $(historiesObj).addClass("item-border");
                        $(historiesObj).find("#expandBtn").find("i").removeClass("fa-angle-double-right").addClass("fa-angle-double-down");
                        isExpand = true;
                    }else{
                        $(historiesObj).removeClass("item-border");
                        $(historiesObj).find("#expandBtn").find("i").removeClass("fa-angle-double-down").addClass("fa-angle-double-right");
                        isExpand = false;
                    }
                }
            }
            selectInfoArea.toggle(option);
        });

        putFileToInfoArea(selectInfoArea, content.Doc);
    }
    if(putArea.find(".detail-item").length){
        putArea.find(".detail-item").eq(0).before(historiesObj);
    }else{
        $(historiesObj).appendTo(putArea);
    }
}

// 放置檔案到顯示區
function putFileToInfoArea(putArea, content, isModify, uid){
    if(isModify == undefined){
        isModify = false;
    }
    putArea.empty();
    var style = (isModify)?"file-modify-list":"file-list";
    var option = {styleKind:"calendar-list",style:style};
    getStyle(option,function(filelistPage){
        $.each(content, function(i, fileContent){
            var filelistObj = $.parseHTML(filelistPage);
            $(filelistObj).data("Uid",fileContent.Uid);
            if(isModify){
                $(filelistObj).find(".fa-trash-o").parent().click(function(){
                    var defaultOption = {
                      sureCall: function(){
                        deleteFile(uid, fileContent.Uid, $(filelistObj));
                      },
                      sureText: "刪除",
                      sureClass: "btn-danger",
                      title: "刪除確認"
                    };
                    var msg = "若刪除檔案則不會保留檔案<br/>確定要刪除「"+fileContent.Name+"」？";
                    chooseDialog(msg, defaultOption);
                });
            }else{
                $(filelistObj).find(".fa-trash-o").data("Uid",fileContent.Uid);
                $(filelistObj).find(".fa-file-o").click(function(){
                    downloadFile(fileContent.Uid, fileContent.Name);
                });
            }
            $(filelistObj).find(".list-items").eq(1).text(fileContent.Name);


            putArea.append(filelistObj);
        });
    });
}