// 查看
var calendarType = 1
function calendarView(content, putArea){
    $("#calendarViewDialog").remove();
    var calendarViewDialog = $("<div>").prop("id","calendarViewDialog");
    calendarViewDialog.appendTo("body");
    if(putArea == undefined){
        putArea = null;
    }
    var isVerify = false;
    if(content.MyKeypoint.Status.Uid == 1){
        isVerify = true;
    }
    $("#calendarViewDialog").bsDialog({
        title: content.Desc+"項目檢視",
        autoShow: true,
        start: function(){
          var option = {styleKind:"received-issued",style:"calendar-view"};
          getStyle(option,function(calendarView){
            // 細項＆歷程用同一種
            var option = {styleKind:"calendar-list",style:"detail-view"};
            getStyle(option,function(detailPage){
                var calendarViewObj = $.parseHTML(calendarView);
                var isModify = true;
                var isView = true;
                var detailArea = $(calendarViewObj).find("#detailArea");
                var detailPutArea = detailArea.find(".control-label").eq(1);
                var auditArea = $(calendarViewObj).find("#auditArea");
                var auditPutArea = auditArea.find(".control-label").eq(1);
                // 判斷是否為指派
                var isDesignee = true;
                var isMyElement = false;
                // isModify, isHistories, isDetail, isDesignee, modifyObj
                if(content.Designee.Uid != content.MyKeypoint.Pricipal.Uid){
                    if(content.MyKeypoint.Pricipal.Uid != userID){
                        isDesignee = false;
                    }
                }else{
                    isMyElement = true;
                }

                if(content.MyKeypoint.Status.Uid != 1 && content.MyKeypoint.Status.Uid != 4){
                    $(calendarViewObj).find("#addHistories").remove();
                }
                
                // 如果不是被指派的人，不可以增加辦況
                if(!isDesignee){
                    $(calendarViewObj).find("#historiesArea").find(".control-label").eq(1).empty();
                    $(calendarViewObj).find("#Designee").parent().parent().remove();
                }else{
                    $(calendarViewObj).find("#Pricipal").parent().parent().remove();
                }

                if(isMyElement){
                    $(calendarViewObj).find("#Designee").parent().parent().remove();
                }
                

                // 取得細項內容
                var sendData = {
                    api: calendarAPI+"GetToDoList",
                    data: {
                        userId: userID,
                        type: calendarType,
                        fid: content.Uid
                    }
                };
                $.getJSON(wrsUrl,sendData, function(rs){

                    if(rs.Status){
                        var tmpModifyObj = {
                            modifyObj: content,
                            modifyItem: putArea
                        };
                        $.each(rs.Data,function(detailIndex, detailContent){
                            // createDetail(detailPage, detailContent, detailPutArea, isModify, isView, true,true, isDesignee, tmpModifyObj);
                            // auditPutArea
                            var pushArea = (detailContent.Type.Uid == 3)?auditPutArea:detailPutArea;
                            
                            createDetailItem(detailPage, detailContent, pushArea, isModify, isDesignee, true, content);
                        });
                        if(auditPutArea.find(".detail-item").length){
                            auditArea.show();
                        }
                    }else{
                        detailArea.remove();
                    }
                });
                
                $(calendarViewObj).find("#addDetail").remove();

                var historiesArea = $(calendarViewObj).find("#historiesArea").find(".control-label").eq(2);
                if(content.Histories != undefined){
                    creatHistory(content.Histories, historiesArea, false, content);
                }
                // 增加辦況
                $(calendarViewObj).find("#addHistories").click(function(){

                    var tmpModifyObj = {
                        modifyObj: content,
                        modifyItem: putArea
                    };
                    // console.log(tmpModifyObj);
                    // createDetail(detailPage, content.Uid, historiesArea, isModify, true, false, tmpModifyObj);
                    addHistory(null, historiesArea, isModify, false, content);
                });

                $(calendarViewObj).appendTo($("#calendarViewDialog").find(".modal-body"));
                $.unblockUI();
            });
          });
        },
        button:createViewBtn(isVerify, content, putArea)
    });
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


// view 用
// 檔案內容先隱藏起來
function viewFileArea(pageObj){
    $(pageObj).find("#fileInfo").hide();
    var isExpand = false;
    // 點擊後展開
    $(pageObj).find("#file-expand").click(function(){
        var fileExpand = $(this);
        if($(this).find(".fa-expand").length){
            $(this).find(".fa-expand").removeClass("fa-expand").addClass("fa-compress");
        }else{
            $(this).find(".fa-compress").removeClass("fa-compress").addClass("fa-expand");
        }
        var option = {
            effect:"blind",
            complete:function(){
                if(!isExpand){
                    fileExpand.parent().addClass("item-border");
                    fileExpand.addClass("list-items-bottom-dash");
                    isExpand = true;
                }else{
                    fileExpand.parent().removeClass("item-border");
                    fileExpand.removeClass("list-items-bottom-dash");
                    isExpand = false;
                }
            }
        }
        $(pageObj).find("#fileInfo").toggle(option);
    });
}

function createViewBtn(isVerify, listContent, listItem){
    var btn = [];
    var closeBtnClass = " pull-left";
    btn.push({
        text: "關閉",
        className: "btn-default-font-color",
        click: function(){
            deleteHash();
            $("#calendarViewDialog").bsDialog("close");
        }
    });
    return btn;
}

// 創建細項
function createDetailItem(detailStyle, content, putArea, isModify, isDesignee, isView, parentData, putBefore, isPut){
    if(isView == undefined){
        isView = false;
    }

    if(isPut == undefined){
        isPut = true;
    }
    if(putBefore == undefined){
        putBefore = false;
    }


    // 確認是否為空
    if(content == null || content == undefined){
        content = null;
        $(detailObj).find(".fa-ban").remove();
    }
    if(isPut){
        var detailObj = $.parseHTML(detailStyle);
    }else{
        var detailObj = detailStyle;
    }

    var historiesPutArea = $(detailObj).find(".histories");
    var selectInfoArea = $(detailObj).find("#fileInfo");
    // 是否為協辦人
    var isAssist = (content == null || content == undefined)?false : (content.Assist.Uid == userID) ? true:false;
    // 加載預覽的內容
    if(isView){
        viewFileArea(detailObj);
    }
    // 若可以審查，則判斷是否為指派人
    // if(content != null){
    //     if(content.Designee.Uid == userID && parentData.MyKeypoint.Status.Uid == 2 && content.MyKeypoint.Complete == 2){
    //         // $(detailObj).find(".fa-ban").click(function(){
    //         //     banDetailBtn(content.Uid, Desc, parentData.Uid);
    //         // });
    //     }else{
    //         // $(detailObj).find(".fa-ban").remove();
    //     }
    // }
    if(isDesignee || isAssist){
        // 加號，可新增歷程
        $(detailObj).find(".fa-plus").click(function(){
            addHistory(null, historiesPutArea, isModify, isDesignee, content);
            // console.log("T");
        });
    }else{
        $(detailObj).find(".fa-plus").remove();
        $(detailObj).find(".fa-square-o").removeClass("send-btn mouse-pointer").addClass("ban-not");

    }

    if(calendarType == 1){
        $(detailObj).find(".fa-user").remove();
    }

    if(content != null){
        if(!content.Designee.Uid == userID){
            $(detailObj).find(".fa-cloud-upload").parent().remove();
        }
    }

    if(isModify){
        if(isView){
            if(!content.Doc.length){
                $(detailObj).find("#file-expand").parent().remove();
            }
            // 如果該項目的副節點事項已完成，則不能新增任何辦況
            if((parentData.MyKeypoint.Status.Uid != 1 && parentData.MyKeypoint.Status.Uid != 4) || parentData.Type == 1){
                $(detailObj).find(".fa-plus").remove();
                $(detailObj).find(".fa-square-o").removeClass("send-btn mouse-pointer").addClass("ban-not");
            }else{
                // 只有若有設置協辦，該協辦才可以點完成、增加辦況
                if(content.Assist.Uid > 0 && content.Assist.Uid != userID){
                    $(detailObj).find(".fa-square-o").removeClass("send-btn mouse-pointer").addClass("ban-not");
                    $(detailObj).find(".fa-plus").parent().remove();
                }else if((isDesignee || (content.Assist.Uid > 0 && content.Assist.Uid == userID)) && content.Histories.length){

                    $(detailObj).find(".fa-square-o").unbind('click').click(function(){
                        // 完成事件
                        finishDetailBtn($(this), $(detailObj), content, parentData.Uid);
                        
                    });
                }
                if(!content.Histories.length){
                    $(detailObj).find(".fa-square-o").removeClass("send-btn mouse-pointer").addClass("ban-not");
                }
            }
            if(content.MyKeypoint.Status.Uid > 1){
                var isCheckItem = $(detailObj).find(".fa-square-o").unbind("click").removeClass("fa-square-o send-btn mouse-pointer ban-not").addClass("fa-check-square-o");
                if(content.Assist.Uid > 0 && content.Assist.Uid != userID){
                    isCheckItem.addClass("ban-not");
                }
                $(detailObj).find(".fa-plus").remove();
            }
            if(parentData.MyKeypoint.Status.Uid > 1 && parentData.MyKeypoint.Status.Uid < 4){
                var isCheckItem = $(detailObj).find(".fa-square-o").unbind("click");
                if(content.MyKeypoint.Status.Uid > 1){
                    isCheckItem.removeClass("fa-square-o send-btn mouse-pointer ban-not").addClass("fa-check-square-o");
                }else{
                    isCheckItem.removeClass("send-btn mouse-pointer").addClass("ban-not");
                }
            }
        }else{
            // 只有在編輯狀態，才需要額外的上傳傳送方式
            var putFormArea = $("<form>");
            $("#insertDialog").find("#uploadFiles").after(putFormArea);
        }

        if(content != null){
            if(!isView){
                if(content.MyKeypoint.Status.Uid > 1){
                    // 若使用者已完成該事項，就不可以再修改
                    $(detailObj).find("input:text").parent().html(content.Desc);

                    $(detailObj).find(".fa-floppy-o").parent().html("-");
                    var finishBtn = $("<i>").addClass("fa fa-check finish-status");
                    $(detailObj).find("#deleteAssistItem").parent().empty().append(finishBtn);
                }else{
                    $(detailObj).find("input:text").val(content.Desc);
                }
            }else{
                $(detailObj).find("input:text").parent().html(content.Desc);
            }


            if(content.Doc != undefined && content.Doc.length){
                if(content.MyKeypoint.Status.Uid > 1 || isView){
                    putFileToInfoArea(selectInfoArea, content.Doc);
                }else{
                    putFileToInfoArea(selectInfoArea, content.Doc, true, content.Uid);
                }
            }
            if(content.Histories != undefined && content.Histories.length){
                $.each(content.Histories,function(i,historiesContents){
                    historyList(historiesContents, historiesPutArea, false, isDesignee, content);
                });
            }
            // 顯示協辦
            if(content.Assist.Uid > 0){
                $(detailObj).find("#assistUserArea").show();
                $(detailObj).find("#Assist").val(content.Assist.Uid);
                $(detailObj).find("#assistUserInfo").text(content.Assist.Name);
            }
            // $(detailObj).find(".fa-trash-o").parent().remove();
            // $(detailObj).find(".fa-floppy-o").parent().remove(); 
        }
        // 儲存修改資料
        $(detailObj).find(".fa-floppy-o").unbind('click').click(function(){
            saveDetailAction(detailObj, content, putFormArea, parentData, isDesignee);
            // console.log(content);
        });

        // 再輸入筐按下enter儲存
        $(detailObj).find("#detailDesc").unbind('keypress').keypress(function(keydown){
            if(keydown.which == 13) {
                saveDetailAction(detailObj, content, putFormArea, parentData, isDesignee);
            }else{
                return;
            }
        });
        
    }else{
        var putFormArea = $(detailObj).find("#fileSelect");
        $(detailObj).find(".fa-floppy-o").remove();
    }
    
    // var object = { form:putFormArea, item:$(detailObj) };
    // detailArr.push(object);
    // 細項檔案上傳
    $(detailObj).find(".fa-cloud-upload").unbind('click').click(function(){
        // return;
        fileSelect(putFormArea, "0" , selectInfoArea);
    });

    // 刪除鈕
    $(detailObj).find("#deleteAssistItem").unbind('click').click(function(){
        var removeArea = $(this).parents(".detail-item").eq(0);
        if(content != undefined && content != null){
            var option = {
              sureCall: function(){
                deleteData(content.Uid, removeArea, true, putFormArea);
              },
              sureText: "刪除",
              sureClass: "btn-danger",
              title: "刪除訊息"
            };
            var msg = "若刪除「"+content.Desc+"」相關資料將無法留存，<br>";
            msg += "您確定刪除「"+content.Desc+"」？";
            chooseDialog(msg, option);
            return;
        }else{
            removeArea.remove();
        }
    });

    var infoPutArea = $(detailObj).find("#assistUserInfo");
    var valuePutArea = $(detailObj).find("#Assist");
    var userArea = $(detailObj).find("#assistUserArea");
    // 協辦人
    $(detailObj).find(".fa-user").unbind('click').click(function(){
        var selectData = valuePutArea.val().split(",");                
        addUserListData(infoPutArea, valuePutArea, selectData);
        userArea.show();
    });
    // 放置順序
    if(isPut){
        if(putBefore){
            if(putArea.find(".detail-item").length){
                putArea.find(".detail-item").eq(0).before(detailObj);
            }else{
                $(detailObj).appendTo(putArea);
            }
        }else{
            $(detailObj).appendTo(putArea);
        }
    }
}


// 完成按鈕
function finishDetailBtn(btn, detailObj, content, parentListID){
    var option = {
      sureCall: function(){
        finishDetail(content.Uid, detailObj, parentListID, btn);
      },
      title: "完成訊息"
    };
    var msg = "若完成細項「"+content.Desc+"」相關資料將無法異動，<br>";
    msg += "您確定要完成「"+content.Desc+"」？";
    chooseDialog(msg, option);
}

// 儲存細項動作
function saveDetailAction(detailObj, content, putFormArea, parentData, isDesignee){
    var desc = $(detailObj).find("#detailDesc").val();
    var AssistID = $(detailObj).find("#Assist").val();
    if(content != null && content != undefined){
        if($.trim(desc)){
            content.Desc = desc;
            
            if(AssistID){
                content.Assist = {};
                content.Assist.Uid = AssistID;
            }
            saveDetail(content, putFormArea, $(detailObj), parentData, isDesignee);
        }
    }else{
        var sendData = {
              "Type": {
                "Uid": 2,
              },
              "Desc": desc,
              "Designee": {
                "Uid": parentData.Designee.Uid,
              },
              "Pricipal": {
                "Uid": parentData.MyKeypoint.Pricipal.Uid,
              },
              "Assist": {
                "Uid": AssistID,
              },
              "Location": parentData.Location,
              "StartDate": parentData.StartDate,
              "EndDate": parentData.MyKeypoint.EndDate,
              "WarningDate": parentData.MyKeypoint.WarningDate,
              "Keywords": parentData.MyKeypoint.Keywords,
              "Fid": parentData.Uid,
              "Trace": true                   
        };
        var newInsertData = $.extend(parentData, sendData, {});
        delete newInsertData.Uid;
        // console.log(newInsertData);
        // return;
        saveDetail(newInsertData, putFormArea, $(detailObj), parentData, isDesignee);
    }
}

// 創建歷程
function createHistories(historiesStyle, content, putArea, isModify, isDesignee, modifyObj, isPut){
    if(isPut == undefined){
        isPut = true;
    }
    if(isPut){
        var historiesObj = $.parseHTML(historiesStyle);
    }else{
        var historiesObj = historiesStyle;
    }
    // 新增辦況檔案上傳區
    var historiesForm = $("<form>");
    var putFormArea = historiesForm;
    var selectInfoArea = $(historiesObj).find("#historyFileInfo");
    if(content == null){
        $(historiesObj).find(".fa-pencil-square-o").hide();
    }
    if(isModify){
        // 放內容
        // $(historiesObj).find(".fa-square-o").parent().html('<i class="fa fa-angle-double-right"></i>');
        // $(historiesObj).find(".fa-trash-o").removeClass("pull-left").addClass("pull-right");
        $(historiesObj).find(".histories").remove();
            
    }else{
        // 辦況
        // 完成後刪除
        if(parseInt(modifyObj.MyKeypoint.Status.Uid) > 1 || content.IsSubmit){
            $(historiesObj).find(".fa-pencil-square-o").parent().remove();
            $(historiesObj).find(".fa-trash-o").parent().remove();
        }
        // 先暫時都刪除"刪除按鈕"
        // $(historiesObj).find(".fa-trash-o").parent().remove();

        $(historiesObj).find("#historyDesc").hide().val(content.Desc);
        $(historiesObj).find("#historyContent").show().html(content.Desc);
        
        $(historiesObj).find(".fa-floppy-o").parent().hide();
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
    }

    // 再輸入筐按下enter儲存
    $(historiesObj).find("input:text").unbind("keypress").keypress(function(keydown){
        if(keydown.which == 13) {
            var Desc = $(historiesObj).find("#historyDesc").val();
            var isNew = (content == null)?true:false;
            if($.trim(Desc)){
                var modifyHistoryBtn = $(historiesObj).find("#modifyHistory");
                if(modifyHistoryBtn.prop("class").search("fa-pencil-square-o") == -1){
                    modifyHistoryBtn.removeClass("fa-times").addClass("fa-pencil-square-o");
                }
                saveHistories(content, Desc, $(historiesObj), modifyObj, historiesForm, isNew);
            }else{
                $(historiesObj).find("#historyDesc").attr("placeholder","未輸入辦況");
            }
        }else{
            return;
        }
    });
    // 存辦況
    $(historiesObj).find(".fa-floppy-o").unbind("click").click(function(){
        // console.log(content,$(detailObj).find("input:text").val());
        var Desc = $(historiesObj).find("#historyDesc").val();
        var isNew = (content == null)?true:false;
        if($.trim(Desc)){
            var modifyHistoryBtn = $(historiesObj).find("#modifyHistory");
            if(modifyHistoryBtn.prop("class").search("fa-pencil-square-o") == -1){
                modifyHistoryBtn.removeClass("fa-times").addClass("fa-pencil-square-o");
            }
            saveHistories(content, Desc, $(historiesObj), modifyObj, historiesForm, isNew);
        }else{
            $(historiesObj).find("#historyDesc").attr("placeholder","未輸入辦況");
        }

    });
    
    // 檔案上傳
    $(historiesObj).find(".fa-cloud-upload").unbind("click").click(function(){
        // 一維
        fileSelectOneDimensional(putFormArea, selectInfoArea);
    });


    // 刪除鈕
    $(historiesObj).find(".fa-trash-o").unbind("click").click(function(){
        var removeArea = $(this).parents(".detail-item").eq(0);
        // 代表已有內容，要呼叫刪除ＡＰＩ
        if(content != undefined){
            var option = {
              sureCall: function(){
                
                if(historiesForm != undefined){
                    historiesForm.remove();
                }
                var hisLingth = removeArea.parent().find(".detail-item").length;
                if(hisLingth == 1){
                    var checkBtn = removeArea.parent().parent().find(".fa-square-o");
                    checkBtn.removeClass("send-btn mouse-pointer").addClass("ban-not");
                    checkBtn.unbind('click');
                }
                deleteHistoryData(modifyObj.Uid,content.Uid,removeArea);
              },
              sureText: "刪除",
              sureClass: "btn-danger",
              title: "刪除訊息"
            };
            var msg = "若刪除辦況「"+content.Desc+"」相關資料將無法留存，<br>";
            msg += "您確定刪除「"+content.Desc+"」？";
            chooseDialog(msg, option);
            return;
        }
        
        removeArea.remove();
        if(historiesForm != undefined){
            historiesForm.remove();
        }
    });
    // 編輯
    var modifyBtn = $(historiesObj).find(".fa-pencil-square-o");
    modifyBtn.unbind("click").click(function(){
        if($(this).prop("class").search("fa-pencil-square-o")!= -1){
            $(historiesObj).find("#historyContent").hide();
            $(historiesObj).find("#historyDesc").show();
            $(historiesObj).find("#actionBtn").show();
            $(historiesObj).find("#historyFileInfo").show();
            $(this).removeClass("fa-pencil-square-o").addClass("fa-times");
            $(historiesObj).find("#historyFileInfo").find(".file-items").each(function(){
                var removeArea = $(this);
                var fileName = $(this).find(".list-items").eq(1).text();
                $(this).removeClass("send-btn");
                var fileUid = $(this).data("Uid");
                var icon = $(this).find(".list-items").eq(0);
                var trash = $("<i>").addClass("fa fa-trash-o fa-2x mouse-pointer");
                trash.click(function(){
                    // 呼叫刪除檔案的API
                    var option = {
                      sureCall: function(){
                        deleteHistoryFile(content.Uid, fileUid, removeArea);
                      },
                      sureText: "刪除",
                      sureClass: "btn-danger",
                      title: "刪除訊息"
                    };
                    var msg = "您現在刪除的是已上傳的檔案，若刪除檔案「"+fileName+"」將無法留存，<br>";
                    msg += "您確定刪除「"+fileName+"」？";
                    chooseDialog(msg, option);
                });
                icon.append(trash);

                icon.removeClass("send-btn").addClass("cancel-btn");
                icon.find(".fa-file-o").hide();
                
            });
        }else{
            $(historiesObj).find("#historyContent").show();
            var originalVal = $(historiesObj).find("#historyContent").text();
            $(historiesObj).find("#historyDesc").val(originalVal).hide();
            $(historiesObj).find("#actionBtn").hide();
            $(historiesObj).find("#historyFileInfo").hide();
            $(historiesObj).find("#historyFileInfo").find(".newFile").find(".fa-trash-o").each(function(){
                $(this).click();
            });
            $(historiesObj).find("#historyFileInfo").find(".file-items").each(function(){
                var icon = $(this).find(".list-items").eq(0);
                icon.removeClass("cancel-btn").addClass("send-btn");
                icon.find(".fa-trash-o").remove();
                icon.find(".fa-file-o").show();
                $(this).addClass("send-btn");
            });

            $(this).addClass("fa-pencil-square-o").removeClass("fa-times");
            historiesForm.empty();
        }
       
    });

    if(isPut){
        // console.log(content,modifyObj);
        if(putArea.find(".detail-item").length){
            putArea.find(".detail-item").eq(0).before(historiesObj);
        }else{
            $(historiesObj).appendTo(putArea);
        }
    }
}

// 新增辦況
function addHistory(content, putArea, isModify, isDesignee, modifyObj){
    var option = {styleKind:"calendar-list",style:"history"};
    getStyle(option,function(historyPage){
        // createDetail(historyPage, content.Uid, putArea, isModify, isView, isHistories, isDetail, isDesignee, modifyObj);
        createHistories(historyPage, content, putArea, true, isDesignee, modifyObj);
    });
}

// 辦況列表
function historyList(content, putArea, isModify, isDesignee, modifyObj){
    var option = {styleKind:"calendar-list",style:"history"};
    getStyle(option,function(historyPage){
        // createDetail(historyPage, content, putArea, isModify, isView, isHistories, isDetail, isDesignee, modifyObj);
        createHistories(historyPage, content, putArea, isModify, isDesignee, modifyObj);
    });
}

function creatHistory(historyData, historiesArea, isModify, modifyObj){
    if(historyData.length){
        var style = "history";
        if(parseInt(modifyObj.Type.Uid) == 1){
            style = "sys-history";
        }
        var option = {styleKind:"calendar-list",style:style};
        getStyle(option,function(historyPage){
            $.each(historyData, function(historiesIndex, historiesContent){
                createHistories(historyPage, historiesContent, historiesArea, isModify, false, modifyObj);
            });
        });
    }
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


// 新增辦況
function saveHistories(content, Desc, area, modifyObj, historiesForm, isNew){
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
                    }
                    content = content[content.length-1];
                    area.find(".fa-pencil-square-o").show();
                    createHistories(area, content, null, false, null, modifyObj, false, true);
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
                    createHistories(area, content, null, false, null, modifyObj, false, true);
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


// 多檔案上傳- 一維
function fileSelectOneDimensional(putFormArea, selectInfoArea){
    var fileInput = $("<input>").prop("type","file").prop("name","files[]").change(function(){
        var fileThis = $(this);
        getFileLimit(sys_code, function(rs){
            var fileSize = clientFileUnitTrans(fileThis.prop("files")[0].size, rs.Unit);
            if((rs.LastSpace - fileSize) > 0){
                var names = $.map(fileThis.hide().prop("files"), function(val,i) { 
                    // return val.name; 
                    // console.log(val)
                    var option = {styleKind:"calendar-list",style:"file-upload"};
                    getStyle(option,function(fileUploadPage){
                        var fileUploadObj = $.parseHTML(fileUploadPage);

                        var infoDiv = $(fileUploadObj).find(".list-items").eq(1).html(val.name);
                        var trash = $(fileUploadObj).find(".list-items").eq(0);
                        trash.click(function(){
                            fileInput.remove();
                            $(fileUploadObj).remove();
                        });
                        // $("#insertDialog").find("#isSelectFile").find(".control-label").eq(1).append(borderDiv);
                        selectInfoArea.append(fileUploadObj);
                    });
                });
                fileThis.appendTo(putFormArea);
            }else{
                var last = serverFileUnitTrans(parseFloat(rs.LastSpace));
                msgDialog("您剩餘的空間不足，請選擇請確認檔案大小，剩餘:"+last.LastSpace+last.Unit);
            }
        });
    });
    fileInput.click();
}


// 取得辦況單筆
function getHistoriesUidData(toDoId, uid, callback){
    var sendData = {
        api: calendarAPI+"GetHistory",
        data:{
            toDoId: toDoId,
            historyId: uid,
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        callback(rs.Data);
    });
}


function deleteHistoryData(parentID,uid, modifyItem){
    // 
    var tmpData = { "ToDoId": parentID, "HistoryId": uid };
    var data = "'"+JSON.stringify(tmpData)+"'";

    // var data = tmpData;
    var sendData = {
        api: calendarAPI+"DeleteHistory",
        // api: calendarAPI+"RemoveToDoList",
        data:data,
        contentType: "application/json",
        changeJson: true
    };
    $.ajax({
        url: wrsUrl,
        type: "DELETE",
        // type: "PUT",
        data: sendData,
        success:function(rs){
            rs = $.parseJSON(rs);
            if(rs.Status){
                modifyItem.remove();
            }else{
                msgDialog(rs.Data||rs.Message||"刪除失敗");
            }
        }
    });
}


// 刪除檔案
function deleteHistoryFile(uid, fileID, modifyItem){
    var tmpData = {
            "history_id": uid,
            "doc_id": fileID
        };
    var data = "'"+JSON.stringify(tmpData)+"'";
    // var data = tmpData;
    var sendData = {
        // api: calendarAPI+"RemoveToDoFiles",
        api: calendarAPI+"DeleteHistoryFiles",
        data:data,
        contentType: "application/json",
        changeJson: true
    };
    $.ajax({
        url: wrsUrl,
        // type: "PUT",
        type: "DELETE",
        data: sendData,
        success: function(rs){
            var rs = $.parseJSON(rs);
            if(!rs.Status){
                msgDialog(rs.Data||rs.Message||"刪除檔案失敗");
            }else{
                modifyItem.remove();
            }
            
        }
    });
}