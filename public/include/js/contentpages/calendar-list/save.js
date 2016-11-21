// 完成事項
function finishList(uid, itemType, modifyItem, modifyObj){
    $.blockUI();
    // var data = [];
    // data.push(uid);
    var sendData = {
        api: calendarAPI+"ReturnToDoList",
        data:{
            Type: itemType,
            ToDoId: uid
        },
        // changeJson: true
    };
    // console.log(uid, itemType, modifyItem);
    // return;
    // console.log(sendData);
    $.post(wrsUrl,sendData,function(rs){
        $.unblockUI();

        try{
            rs = $.parseJSON(rs);
            if(rs.Status){
                if(modifyItem != undefined){
                    uid = (modifyObj == undefined) ? uid:modifyObj.Uid;
                    getUidData(uid, function(pageStyle, rsData){
                        var pageStyleObj = $.parseHTML(pageStyle); 
                        var renewBtn = $(pageStyleObj).find(".item-actionBtn").html();
                        modifyItem.find(".item-actionBtn").empty().html(renewBtn);
                        // console.log(modifyItem);
                        putDataOption(null, modifyItem, rsData);
                        if(parseInt(rsData.MyKeypoint.Status.Uid) != 2){
                            $(modifyItem).remove();
                        }
                        if(rsData.MyKeypoint.Status.Uid == 3){
                            $("#finishBadge").text("N");
                        }
                        
                    });
                }
            }
        }catch(err){
            msgDialog("無法取得資料");
        }
    });
}

// 完成事項
function finishDetail(detailUid, detailObj, parentListID, finishBtn){
    // var data = [];
    // data.push(uid);
    var sendData = {
        api: calendarAPI+"ReturnToDoList",
        data:{
            Type: 2,
            ToDoId: detailUid
        },
        // changeJson: true
    };
    $.post(wrsUrl,sendData,function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            finishBtn.removeClass("fa-square-o send-btn mouse-pointer").addClass("fa-check-square-o").unbind("click");
            $(detailObj).find(".fa-plus").remove();
            $(detailObj).find(".histories").find(".detail-item").each(function(){
                $(this).find(".fa-pencil-square-o").parent().remove();
                $(this).find(".fa-trash-o").parent().remove();
            });
            $("#total-content").find(".dataContent").each(function(){
                var listUid = $(this).data("Uid");
                if(listUid == parentListID){
                    var dataContent = $(this);
                    getUidData(parentListID, function(pageStyle, content){
                        var pageStyleObj = $.parseHTML(pageStyle);
                        var renewBtn = $(pageStyleObj).find(".item-actionBtn").html();
                        dataContent.find(".item-actionBtn").empty().html(renewBtn);
                        pageStyleObj = dataContent;
                        putDataOption(null, pageStyleObj, content, false);

                    }, true);
                }
            });
        }else{
            msgDialog(rs.Message|| rs.Data ||"無法完成細項");
        }
    });
}

// 儲存
function saveData(sendObj, modifyItem){
    var uploadFileLength = $("#insertDialog").find("#uploadFiles").find("input:file").length;
    
    // console.log(sendObj);
    // return;
    var method;
    var type;
    var data;
    var contentType = "";
    var changeJson = false;
    var dataObj = {};
    var detailFileUpload = false;
    var processURL = (uploadFileLength)?wrsAPI+"uploaderAPI":wrsUrl;

    var eventIsSelf = false;
    if(sendObj.Pricipal.Uid == userID && sendObj.Designee.Uid == userID){
        eventIsSelf = true;
    }


    if(sendObj.Uid != undefined){
        processURL = wrsUrl;
        method = "UpdateToDoList";
        type = "PUT";
        dataObj = sendObj;
    }else{
        method = (uploadFileLength)?"InsertToDoListWithFiles":"InsertToDoList";
        type = "POST";
        data = [];
        data.push(sendObj);

        var detailExist = $("#insertDialog").find(".detail-item").length;
        if(detailExist){
            // 放入細項輸入的資訊
            $("#insertDialog").find(".detail-item").each(function(i){
                var detailItemVal = $(this).find("input:text").val();
                if(detailItemVal){
                    var tmpObj = $.extend({}, sendObj);
                    tmpObj.Desc = detailItemVal;
                    tmpObj.Fid = -1;
                    var Assist = $(this).find("#Assist").val();
                    if(Assist && !eventIsSelf){
                        tmpObj.Assist = {};
                        tmpObj.Assist.Uid = Assist;
                    }
                    data.push(tmpObj);
                    // 檢驗是否有檔案
                    var filesExist = $(this).find("#fileSelect").find("input:file");
                    if(filesExist){
                        $(this).find("#fileSelect").find("input:file").each(function(){
                            $(this).prop("name","files["+(i+1)+"][]");
                        });
                    }
                } 
            });
        }

        contentType = "application/json";
        changeJson = true;
        dataObj.data = $.extend(arrayToObject(data), dataObj, {});
        dataObj.sys_code_id = sys_code;
    }
    
    if(uploadFileLength && modifyItem == undefined){
        uploadBlockInfo();
    }else{
        $.blockUI();
    }

    // console.log(dataObj);
    // return;
    var sendData ={
        api: calendarAPI+method,
        data: dataObj,
        contentType: contentType,
        changeJson: changeJson,
        sendJsonIndex: "JsonString",
        sysCode: sys_code,
    };
    // console.log(sendData);
    // return;
    var options = {
        url: processURL,
        type:type,
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);

            // var totalPercent = (parseInt(percentComplete) / totalDetail);
            // totalPercent = totalPercent.toFixed();
            $("#processFileUpload").text(percentComplete+"%");

        },
        success: function(rs) {
            
            // console.log(rs);
            if(rs.Status){
                var uid;
                var putBefore = false;
                if(sendObj.Uid != undefined){
                    uid = sendObj.Uid;
                }else{
                    uid = rs.Data[0];
                    putBefore = true;
                }
                
                // 若事項有新增檔案則需要跑這塊
                if(uploadFileLength && modifyItem != undefined){
                    $.unblockUI();
                    saveFile(uid, modifyItem, undefined, false);
                }else{
                    // 如果是指派給自己，那就是備忘
                    if(calendarType == 3 && eventIsSelf){
                        msgDialog("您所新增的待辦事項承辦與回報皆為同一人，該事項已變為「備忘」", false);
                    }else{
                        getUidData(uid, function(pageStyle, content){
                            var pageStyleObj = $.parseHTML(pageStyle);
                            var putArea = null; 
                            if(modifyItem != undefined){
                                var renewBtn = $(pageStyleObj).find(".item-actionBtn").html();
                                modifyItem.find(".item-actionBtn").empty().html(renewBtn);
                                pageStyleObj = modifyItem;
                            }else{
                                if($("#total-content").find(".dataContent").length){
                                    putArea = $("#total-content").find(".dataContent").eq(0);
                                }else{
                                    putArea = $("#total-content");
                                    putBefore = false;
                                }
                            }
                            
                            putDataOption(putArea, pageStyleObj, content, putBefore);
                            $("#total-content").find(".dataContent").last().removeClass("list-items-bottom");
                        });
                    }
                    $("#insertDialog").bsDialog("close");
                    $.unblockUI();
                }
            }else{
                if(rs.overLimit != undefined){
                    msgDialog(rs.msg || "新增失敗");
                }else{
                    msgDialog(rs.Data || rs.Message || "新增失敗");
                }
                $.unblockUI();
            }
            
        }
    };
    if(modifyItem == undefined){
        $("#insertDialog").find("#uploadFiles").ajaxSubmit(options);
    }else{
        $.ajax(options);
    }
}

// 新增事項 & 細項檔案(修改狀態下)
function saveFile(uid, modifyItem, detialPutFileArea, isDetial){

    uploadBlockInfo();

    var processURL = wrsAPI+"uploaderAPI";

    var sendData ={
        api: calendarAPI+"InsertToDoFiles",
        data: {
            "sys_code_id": sys_code,
            "to_do_id": uid,
            "user_id": userID
        },
        changeJson: true,
        sendJsonIndex: "JsonString",
        sysCode: sys_code
    };

    var options = {
        url: processURL,
        type:"POST",
        data: sendData,
        dataType:"JSON",
        uploadProgress: function(event, position, total, percentComplete) {
            $("#processFileUpload").text(percentComplete+"%");
        },
        success: function(rs) {
            if(rs.Status){
                if(!isDetial){
                    getUidData(uid, function(pageStyle, content){
                        var pageStyleObj = $.parseHTML(pageStyle);
                        var putArea = null; 
                        var renewBtn = $(pageStyleObj).find(".item-actionBtn").html();
                        modifyItem.find(".item-actionBtn").empty().html(renewBtn);
                        pageStyleObj = modifyItem;
                        
                        putDataOption(putArea, pageStyleObj, content, false);
                        $("#total-content").find(".dataContent").last().removeClass("list-items-bottom");
                    });
                    $("#insertDialog").bsDialog("close");
                }else{
                    //取得細項單筆資料
                    getDetailUidData(uid, function(content){
                        detialPutFileArea.empty();
                        // 放檔案
                        putFileToInfoArea(modifyItem.find("#fileInfo"), content.Doc);
                    });
                }
                
            }else{
                msgDialog(rs.Data || rs.Message || "檔案上傳失敗");
            }
            $.unblockUI();
        }
    };
    if(!isDetial){
        $("#insertDialog").find("#uploadFiles").ajaxSubmit(options);
    }else{
        detialPutFileArea.ajaxSubmit(options);
    }
}

// 新增/修改細項
function saveDetail(sendObj, putFileArea, modifyItem, parentData, isDesignee){
    var uploadFileLength = putFileArea.find("input:file").length;

    var method;
    var type;
    var data;
    var contentType = "";
    var changeJson = false;
    var dataObj = {};
    var processURL = (uploadFileLength)?wrsAPI+"uploaderAPI":wrsUrl;

    if(sendObj.Uid != undefined){
        method = "UpdateToDoList";
        type = "PUT";
        dataObj = sendObj;
        processURL = wrsUrl;
    }else{
        data = [];
        data.push(sendObj);

        method = (uploadFileLength)?"InsertToDoListWithFiles":"InsertToDoList";
        type = "POST";        
        contentType = "application/json";
        changeJson = true;
        dataObj.data = $.extend(arrayToObject(data), dataObj, {});
        dataObj.sys_code_id = sys_code;
    }
    // return;
    if(uploadFileLength && sendObj.Uid == undefined){
        uploadBlockInfo();
    }else{
        $.blockUI();
    }

    var sendData ={
        api: calendarAPI+method,
        data: dataObj,
        contentType: contentType,
        changeJson: changeJson,
        sendJsonIndex: "JsonString",
        sysCode: sys_code
    };

    var options = {
        url: processURL,
        type: type,
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        // async: false,
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");

        },
        success: function(rs) {
            // console.log(rs);
            if(rs.Status){
                $.unblockUI();
                if(sendObj.Uid != undefined){
                    uid = sendObj.Uid;
                }else{
                    uid = rs.Data[0];
                    sendObj.Uid = uid;
                }

                if(uploadFileLength){
                    saveFile(uid, modifyItem, putFileArea, true);
                }else{
                    //取得細項單筆資料
                    getDetailUidData(uid, function(content){
                        putFileArea.empty();
                        // 放檔案
                        // putFileToInfoArea(modifyItem.find("#fileInfo"), content.Doc);
                        createDetailItem(modifyItem, content, null, true, isDesignee, false, parentData, false, false)
                    });
                }
            }else{
                msgDialog(rs.Data || rs.Message || "新增細項失敗");
                $.unblockUI();
            }

        }
    };
    if(sendObj.Uid == undefined){
        putFileArea.ajaxSubmit(options);
    }else{
        $.ajax(options);
    }
}

// 新增辦況
function saveHistories(content, Desc, area, modifyObj, historiesForm, isNew, isDataListItem, dataListItemID){
    if(isDataListItem == undefined){
        isDataListItem = false;
    }
    // console.log(modifyObj.Uid);
    // return;
    listID = (content == null)?modifyObj.Uid:content.ListId;
    var data = [];
    var sendObj = {
        ListId: listID,
        Desc: Desc,
        UserId: userID
    }
    data.push(sendObj);
    var dataObj = {};
    
    // data.forEach(function(content, index){
    //     dataObj[index] = content;
    // });

    var floppy = $(area).find(".fa-floppy-o");
    var trash = $(area).find(".fa-trash-o");
    
    // 檢查辦況有沒有檔案
    var uploadFileLength = historiesForm.find("input:file").length;
    var method = (content == null || content.Uid == undefined)?"InsertHistories":"UpdateHistory";
    var type = (content == null || content.Uid == undefined)?"POST":"PUT";
    changeJson = true;
    if(uploadFileLength){
        dataObj.data = arrayToObject(data);
        uploadBlockInfo();
        if(content == undefined || content == null || content.Uid == undefined){
            method = "InsertHistoriesWithFiles";
            dataObj.sys_code_id = sys_code;
        }else{
            var jsonStr = { "ToDoId": listID, "HistoryId": content.Uid, "Desc": Desc };
            dataObj = JSON.stringify(jsonStr);
        }
    }else{
        if(content == undefined || content == null || content.Uid == undefined){
            dataObj = data;
        }else{
            var jsonStr = { "ToDoId": listID, "HistoryId": content.Uid, "Desc": Desc };
            dataObj = JSON.stringify(jsonStr); 
        }
        $.blockUI();
    }
   
    var sendData = {
        api: calendarAPI+method,
        data: dataObj,
        contentType: "application/json",
        changeJson: changeJson,
        sendJsonIndex: "JsonString",
        sysCode: sys_code
    };
    // sendData.sendData.sys_code_id = sys_code;
    var processURL = (uploadFileLength && content == null)?wrsAPI+"uploaderAPI":wrsUrl;
    var options = {
        url: processURL,
        type:type,
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");

        },
        success: function(rs) {
            // console.log(rs);
            if(rs.Status){
                if(!isNew){
                    uid = content.Uid;
                    if(uploadFileLength){
                        updateHistoryFile(historiesForm, listID, uid, area, modifyObj, floppy, trash);
                        return;
                    }
                }else{
                    uid = rs.Data[0];
                }
                getHistoriesUidData(listID, uid, function(content){
                    if(isNew){
                        // 取得檔案列表
                        //取得辦況單筆資料
                        
                        var hisLingth = area.parent().find(".detail-item").length;
                        if(hisLingth == 1){
                            var checkBtn = area.parent().parent().find(".fa-square-o");
                            checkBtn.addClass("send-btn mouse-pointer").removeClass("ban-not");
                            checkBtn.unbind('click').click(function(){
                                finishDetailBtn( $(this), area.parent().parent(), modifyObj, modifyObj.Fid);
                            });
                        }
                        if(isDataListItem){
                            getUidData(dataListItemID, function(content){
                                var pageStyleObj = null;
                                var putArea = null; 
                                $("#total-content").find(".dataContent").each(function(){
                                    var listDataID = $(this).data("Uid");
                                    if(listDataID == dataListItemID){
                                        pageStyleObj = $(this);
                                    }
                                });
                                if(pageStyleObj != null){
                                    putDataOption(putArea, pageStyleObj, content, false);
                                }
                            },false);
                        }
                    }
                    content = content[content.length-1];
                    area.find(".fa-pencil-square-o").show();
                    area.find("#haveFile").show();
                    createHistories(area, content, null, false, null, modifyObj, false, isDataListItem, dataListItemID);
                });
                historiesForm.empty();
                floppy.parent().hide();
            }else{
                msgDialog(rs.Message||"新增失敗");
                floppy.show();
                trash.show();
            }
            $.unblockUI();

        },error: function(rs){
            msgDialog(rs.Message||"新增失敗");
                floppy.show();
                trash.show();
            $.unblockUI();
        }
    };  
    if(uploadFileLength && content == null){
        historiesForm.ajaxSubmit(options);
    }else{
        $.ajax(options);
    }
}

// 編輯辦況時新增檔案
function updateHistoryFile(historiesForm, listID, uid, area, modifyObj, floppy, trash){
    var processURL = wrsAPI+"uploaderAPI";
    var sendData = {
        api: calendarAPI+"InsertHistoryFiles",
        data: { 
            "sys_code_id": sys_code, 
            "history_id": uid, 
            "user_id": userID 
        },
        contentType: "application/json",
        changeJson: true,
        sendJsonIndex: "JsonString",
        sysCode: sys_code
    };
    
    var options = {
        url: processURL,
        type:"POST",
        data: sendData,
        dataType:"JSON",
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");

        },
        success: function(rs) {
            // console.log(rs);
            if(rs.Status){
                getHistoriesUidData(listID, uid, function(content){
                    content = content[content.length-1];
                    area.find(".fa-pencil-square-o").show();
                    area.find("#haveFile").show();
                    createHistories(area, content, null, false, null, modifyObj, false);
                });
                historiesForm.empty();
                floppy.parent().hide();
            }else{
                msgDialog(rs.Message||"上傳檔案失敗");
                floppy.show();
                trash.show();
            }
            $.unblockUI();

        },error: function(rs){
            msgDialog(rs.Message||"上傳檔案失敗");
                floppy.show();
                trash.show();
            $.unblockUI();
        }
    };
    historiesForm.ajaxSubmit(options);
}

// 退回事項
function rejectCalendar(content, listItem, sendObj){
    $.blockUI();
    // console.log(content);
    // 先新增審退意見，再把狀態改掉
    var data = [];
    data.push(sendObj);
    var dataObj = {}
    dataObj.data = data;
    var contentType = "application/json";
    var changeJson = true;
    var uid = content.Uid;

    var sendData = {
        api: calendarAPI+"InsertToDoList",
        data:dataObj,
        contentType: contentType,
        changeJson: changeJson
    };

    $.post(wrsUrl,sendData,function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            var sendData = {
                api: calendarAPI+"ReturnToDoList",
                data:{
                    Type: 3,
                    ToDoId: content.Uid
                },
            };
            $.post(wrsUrl,sendData,function(rejectRS){
                rejectRS = $.parseJSON(rejectRS);
                if(rejectRS.Status){
                    getUidData(uid, function(pageStyle, dataContent){
                        var pageStyleObj = $.parseHTML(pageStyle);
                        var putArea = null; 
                        var renewBtn = $(pageStyleObj).find(".item-actionBtn").html();
                        listItem.find(".item-actionBtn").empty().html(renewBtn);
                        pageStyleObj = listItem;
                        
                        putDataOption(putArea, pageStyleObj, dataContent, false);
                        // 關閉
                        $("#banCalendarDialog").bsDialog("close");
                        $("#calendarViewDialog").bsDialog("close");
                        $.unblockUI();

                    });
                }else{
                    msgDialog(rejectRS.Message || rejectRS.Data || "退回失敗");
                    deleteDetailData(rs.Data[0]);
                    $.unblockUI();

                }
            });
        }else{
            msgDialog(rs.Message || rs.Data || "新增審退意見失敗");
            $.unblockUI();
        }
    });
    
    
}