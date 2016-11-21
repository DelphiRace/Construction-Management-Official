// 收文完成確認
function referenceCheckItemFinishDialog(modifyObj,modifyItem){
    $("body").find("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: "事項完成 - 辦況與附件設定",
        autoShow: true,
        start: referenceCheckItemStart(modifyObj,modifyItem),
        button:[
        
            // {
            //     text: "取消",
            //     className: "btn-default-font-color",
            //     click: function(){
            //         $("#insertDialog").bsDialog("close");
            //     }
            // },
            {
                text: "完成",
                className: "btn-danger",
                click: function(){
                    var userInputOption = {
                        emptyCall: function(obj, id){
                            if(id == "summary"){
                                if(!$("#insertDialog").find("#"+id).parent().find(".contentEmpty").length){
                                    var msg = $("<div>").addClass("col-xs-12 col-md-12 item-bg-danger contentEmpty").text("下方內容不可為空");
                                
                                    $("#insertDialog").find("#"+id).before(msg);
                                }
                            }
                        },
                        success: function(sendObj){
                            sendObj.userID = userID;
                            sendObj.uid = modifyObj.uid;
                            sendObj.userName = userLoginInfo.userName;
                            sendObj.todo_uid = modifyObj.todo_uid;

                            referenceCheckItemClickBtn(sendObj,modifyItem, true);

                        }
                    }
                    checkInputEmpty($("#insertDialog"),userInputOption);
                    // 基本資訊
                    // var sendObj = getUserInput("insertDialog");
                    // var isEmpty = false;

                    // $.each(sendObj, function(i, v){
                    //     if(i == "summary"){
                    //         if(!$.trim(v).length){
                    //             if(!$("#insertDialog").find("#"+i).parent().find(".contentEmpty").length){
                    //                 var msg = $("<div>").addClass("col-xs-12 col-md-12 item-bg-danger contentEmpty").text("下方內容不可為空");
                                
                    //                 $("#insertDialog").find("#"+i).before(msg);
                    //             }
                    //             isEmpty = true;
                    //         }
                    //     }
                    // });

                    // if(!isEmpty){
                    //     sendObj.userID = userID;
                    //     sendObj.uid = modifyObj.uid;
                    //     sendObj.userName = userLoginInfo.userName;

                    //     referenceCheckItemClickBtn(sendObj,modifyItem, true);
                    // }
                }
            }
        ]
    });
}

// 收文辦況確認
function referenceCheckItemDialog(modifyObj,modifyItem){
    $("body").find("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: "新增辦況與附件",
        autoShow: true,
        start: referenceCheckItemStart(modifyObj,modifyItem),
        button:[
            {
                text: "儲存",
                className: "btn-success",
                click: function(){
                    // 基本資訊
                    var userInputOption = {
                        emptyCall: function(obj, id){
                            if(id == "summary"){
                                if(!$("#insertDialog").find("#"+id).parent().find(".contentEmpty").length){
                                    var msg = $("<div>").addClass("col-xs-12 col-md-12 item-bg-danger contentEmpty").text("下方內容不可為空");
                                
                                    $("#insertDialog").find("#"+id).before(msg);
                                }
                            }
                        },
                        success: function(sendObj){
                            sendObj.userID = userID;
                            sendObj.uid = modifyObj.uid;
                            sendObj.userName = userLoginInfo.userName;
                            sendObj.todo_uid = modifyObj.todo_uid;
                            
                            referenceCheckItemClickBtn(sendObj,modifyItem, false);

                        }
                    }
                    checkInputEmpty($("#insertDialog"),userInputOption);                    
                }
            }
        ]
    });
}

// 確認起始畫面
function referenceCheckItemStart(modifyObj,modifyItem){

    var option = {styleKind:"received-issued",style:"reference-checkItem"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        $(insertPageObj).find(".fa-cloud-upload").click(function(){
            var putFormArea = $(insertPageObj).find("#uploadFiles");
            fileSelect(putFormArea);
        });
        
        // CKEDITOR.replace( $(insertPageObj).find("#summary"), {});
        // 放到畫面中
        $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));
        // 加載CKeditor
        // $("#insertDialog").find("#summary").ckeditor();
    });
}

// 收文按下新增或修改按鈕要做的事情
function referenceCheckItemClickBtn(sendObj,modifyItem, isFinish){
    $.blockUI();
    var putFormArea = $("#insertDialog").find("#uploadFiles");
    saveReferenceCheckItemData(sendObj, modifyItem, putFormArea, isFinish);
}

// 收文取得歷史辦況列表
function referenceDoneListView(itemObj){
    $("#referenceDoneListView").remove();
    var referenceDoneListView = $("<div>").prop("id","referenceDoneListView");
    referenceDoneListView.appendTo("body");

    $("#referenceDoneListView").bsDialog({
        title: itemObj.doc_number + "歷史辦況",
        autoShow: true,
        start: referenceDoneListStart(itemObj),
        button:[
            {
                text: "關閉",
                className: "btn-default-font-color",
                click: function(){
                    $("#referenceDoneListView").bsDialog("close");
                }
            }
        ]
    });
}

// 歷史辦況列表起始畫面
function referenceDoneListStart(modifyObj){
    $.blockUI();
    var pageContent = $("<div>").addClass("contents");
    // 先取得資料
    var sendObj = {
        api: referenceAPI + "getReferenceHandling",
        data: {
            uid: modifyObj.uid
        }
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            var option = {styleKind:"received-issued",style:"reference-doneList"};
            getStyle(option,function(viewPage){
                // 檔案列表
                var option = {styleKind:"received-issued",style:"reference-fileList"};
                getStyle(option,function(fileListPage){
                    $.each(rs.data, function(i, content){
                        var viewPageObj = $.parseHTML(viewPage);
                        $(viewPageObj).addClass("dataContent");
                        if($.trim(content.content)){
                            var contentString = $.parseHTML(content.content);
                            $(viewPageObj).find(".list-items").eq(0).html(contentString[0].data);
                        }else{
                            $(viewPageObj).find(".list-items").eq(0).html("沒有辦況說明");
                        }
                        $(viewPageObj).find(".list-items").eq(2).text(content.date);

                        // 檔案列表
                        var fileArea = $(viewPageObj).find(".list-items").eq(1);
                        fileArea.empty();
                        if(content.docUid != undefined && content.docUid != ""){
                            $.each(content.docUid, function(fI,fC){
                                // console.log(fc);
                                var fileListObj = $.parseHTML(fileListPage);
                                $(fileListObj).addClass("fileData");

                                $(fileListObj).find(".fa-paperclip").click(function(){
                                    downloadFile(fC.uid, fC.name_ori);
                                });

                                $(fileListObj).find(".list-items").eq(1).text(fC.name_ori).addClass("send-btn mouse-pointer").click(function(){
                                    downloadFile(fC.uid, fC.name_ori);
                                });
                                $(fileListObj).appendTo(fileArea);
                            });
                            fileArea.find(".fileData").last().removeClass("list-items-bottom");

                        }else{
                            fileArea.text("沒有檔案");
                        }

                        // 放到畫面中
                        $(viewPageObj).appendTo(pageContent); 
                    });
                    pageContent.find(".dataContent").last().removeClass("list-items-bottom");

                });
                
            });
        }else{
            putEmptyInfo(pageContent);
        }
        $("#referenceDoneListView").find(".modal-body").append(pageContent);
        $.unblockUI();
    });
}

// 擬文取得歷史上傳
function sendDocDoneListView(itemObj){
    $("#sendDocDoneListView").remove();
    var sendDocDoneListView = $("<div>").prop("id","sendDocDoneListView");
    sendDocDoneListView.appendTo("body");

    $("#sendDocDoneListView").bsDialog({
        title: itemObj.doc_number + "已發文回傳檔案列表",
        autoShow: true,
        start: sendDocDoneListStart(itemObj),
        button:[
            {
                text: "關閉",
                className: "btn-default-font-color",
                click: function(){
                    $("#sendDocDoneListView").bsDialog("close");
                }
            }
        ]
    });
}

// 歷史辦況列表起始畫面
function sendDocDoneListStart(modifyObj){
    $.blockUI();
    var pageContent = $("<div>").addClass("contents");
    // 先取得資料
    var sendObj = {
        api: waDrfAPI + "getDispatchResponseDoc",
        data: {
            uid: modifyObj.uid
        }
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            var option = {styleKind:"received-issued",style:"sendDoc-doneList"};
            getStyle(option,function(viewPage){
                // 檔案列表
                var option = {styleKind:"received-issued",style:"reference-fileList"};
                getStyle(option,function(fileListPage){
                    $.each(rs.data, function(i, content){
                        var viewPageObj = $.parseHTML(viewPage);
                        $(viewPageObj).addClass("dataContent");
                        
                        // 檔案列表
                        var fileArea = $(viewPageObj).find(".list-items").eq(0);
                        fileArea.empty();
                        if(content.uid != undefined && content.uid != ""){
                            
                            // console.log(fc);
                            var fileListObj = $.parseHTML(fileListPage);
                            $(fileListObj).addClass("fileData");

                            $(fileListObj).find(".fa-paperclip").click(function(){
                                downloadFile(content.uid, content.name_ori);
                            });

                            $(fileListObj).find(".list-items").eq(1).text(content.name_ori).addClass("send-btn mouse-pointer").click(function(){
                                downloadFile(content.uid, content.name_ori);
                            });
                            $(fileListObj).appendTo(fileArea);
                            
                            fileArea.find(".fileData").last().removeClass("list-items-bottom");

                        }else{
                            fileArea.text("沒有檔案");
                        }

                        // 放到畫面中
                        $(viewPageObj).appendTo(pageContent); 
                    });
                    pageContent.find(".dataContent").last().removeClass("list-items-bottom");

                });
                
            });
        }else{
            putEmptyInfo(pageContent);
        }
        $("#sendDocDoneListView").find(".modal-body").append(pageContent);
        $.unblockUI();
    });
}