var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
var userName = userLoginInfo.userName;
var calendarType = 1;
var fileLimit;
// 取得檔案限制
var sendData = {
    api: "FileUseSpace/GetData_FileUseSpace",
    data:{
        sysCode:sys_code
    },
    threeModal:true
}
$.getJSON(wrsUrl,sendData,function(rs){
    // console.log(rs);
    fileLimit = rs;
});

var endDateAsc = function(a, b) {
    return $(a).find(".list-items").eq(1).text() > $(b).find(".list-items").eq(1).text() ? 1 : -1;
}

var endDateDesc = function(a, b) {
    return $(a).find(".list-items").eq(1).text() > $(b).find(".list-items").eq(1).text() ? -1 : 1;
}
$(function(){
    var urlHash = getHashParameter();
    if(urlHash != null){
        if(urlHash.ct != undefined){
            calendarType = parseInt(urlHash.ct);
            $("#totalTab").find("li").removeClass("active");
            var tab = $("#total").parent();
            switch(calendarType){
                case 1:
                    tab = $("#total").parent();
                break;
                case 3:
                    tab = $("#assign").parent();
                break;
                case 4:
                    tab = $("#beAassigned").parent();
                break;
                case 6:
                    tab = $("#finished").parent();
                break;
                case 7:
                    tab = $("#systems").parent();
                break;
            }
            tab.addClass("active");
        }
    }

    if(!userLoginInfo.isSuperiors){
        $("#assign").hide();
    }


    getCalendarData(calendarType);

    // 系統
    $("#systems").click(function(){
        getCalendarData(7,"total-content");
        calendarType = 7;
        $("#insertCalendar").hide();
    });
    // 備忘
    $("#total").click(function(){
        getCalendarData(1,"total-content");
        calendarType = 1;
        $("#insertCalendar").show();
    });
    // 指派
    $("#assign").click(function(){
        getCalendarData(3,"total-content");
        calendarType = 3;
        if(userLoginInfo.isSuperiors){
            $("#insertCalendar").show();
        }else{
            $("#insertCalendar").hide();
        }
    });
    // 被指派
    $("#beAassigned").click(function(){
        getCalendarData(4,"total-content");
        calendarType = 4;
        $("#insertCalendar").hide();
    });
    // 完成
    $("#finished").click(function(){
        getCalendarData(6,"total-content");
        calendarType = 6;
        $("#insertCalendar").hide();
        $("#finishBadge").empty();
    });
    tabContentCtrl("totalTab");
    $("#ContentEndDate").click(function(){
        var sortType = $(this).data("sort");
        if(sortType == "endDateDesc"){
            sortByContent($("#total-content"), endDateAsc);
            $(this).data("sort","endDateAsc");
        }else{
            sortByContent($("#total-content"), endDateDesc);
            $(this).data("sort","endDateDesc");
        }
        
    });
});

function getCalendarData(type,areaID,uid){
    putListTitle(type);
    if(type == 3 || type == 4){
        $(".workPersonTitle").show();
        $(".personal").hide();
    }else{
        $(".workPersonTitle").hide();
        $(".personal").show();
    }
    $("#"+areaID).find(".dataContent").remove();
    $("#"+areaID).find(".data-empty").remove();
    if(type == undefined){
        type = 1;
    }

    if(areaID == undefined){
        areaID = "total-content";
    }

    var sendData = {
        api: calendarAPI+"GetToDoList",
        data:{
            userId: userID,
            type: type
        }
    };
    blockArea();
    getPageListData(sendData, function(rs, hashData){
        if(rs.Status){
            putDataToPage(rs.Data, $("#"+areaID), hashData);

            // if(type == 1){
            // }else{
            //     // putSysDataToPage(rs.Data, $("#"+areaID));
            // }
        }else{
            putEmptyInfo($("#"+areaID));
        }
        blockArea(false);
    }, dataOpen);
}

// 資料開啟
function dataOpen(dataObj){
    // console.log(dataObj);
    if(dataObj.i != undefined){
        getUidData(dataObj.i, function(data){
            if(data != null){
                $.blockUI({
                onBlock: function(){
                    calendarView(data);
                }
            });
            }else{
                msgDialog("這筆資料不是您可以查閱的，請確認後再嘗試",true,function(){ 
                    deleteHash();
                });
            }
        }, false);
    }
}

// 放資料
function putDataToPage(data, putArea, hashData){
    if(hashData == undefined){
        hashData = null;
    }
    // console.log(data);
    var style = "normal";
    // 畫面設定值
    if(calendarType == 3){
        style = "assign";
    }else if( calendarType == 4 ){
        style = "beassign";
    }else if(calendarType == 6){
        style = "finished";
    }

    var option = {styleKind:"calendar-list",style:style};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        $.each(data, function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            if(hashData != null){
                if(content.Uid == hashData.i){
                    $(pageStyleObj).addClass("hashData");
                }
            }
            putDataOption(putArea, pageStyleObj, content);
        });
        
        putArea.find(".dataContent").last().removeClass("list-items-bottom");
    });
}

// 放入資料與建置功能
function putDataOption(putArea, pageStyleObj, content, putBefore){
    if(putBefore == undefined){
        putBefore = false;
    }

    $(pageStyleObj).addClass("dataContent");
    $(pageStyleObj).data("Uid",content.Uid);

    var desiStr = "個人";
    // 指派人
    var DesigneeID = content.Designee.Uid;
    // 承辦人
    var PricipalID = content.MyKeypoint.Pricipal.Uid;
    var itemType = 2;
    var isDesignee = false;
    if(DesigneeID != PricipalID ){
        if(DesigneeID == userID && PricipalID != userID){
            desiStr = "指派";
            // $(pageStyleObj).find(".fa-check")
            // .remove();
            if(content.MyKeypoint.Status.Uid == 1 || content.MyKeypoint.Status.Uid == 3){
                $(pageStyleObj).find(".fa-check").remove();
            }
            isDesignee = true;
        }else{
            itemType = 1;
            desiStr = "被指";
            $(pageStyleObj).find(".fa-trash-o").remove();
            if(content.MyKeypoint.Complete == 1 || content.MyKeypoint.Complete == 2){
                $(pageStyleObj).find(".fa-check").remove();
            }
        }
    }

    if(DesigneeID != userID){
        $(pageStyleObj).find(".fa-pencil-square-o").remove();
    }

    var progressStr = content.Progress + "%";
    if(content.Type.Uid == 1){
        $(pageStyleObj).find(".item-actionBtn").empty().text("-");
        progressStr = "-";
    }

    if(parseInt(content.MyKeypoint.Complete) > 0 ){
        $(pageStyleObj).find(".fa-trash-o").remove();
    }

    // 事項標題可以點開觀看
    var Desc = $("<a>").prop("href","#").text(content.Desc).click(function(){
        getUidData(content.Uid, function(rsData){
            $.blockUI({
                onBlock: function(){
                    calendarView(rsData, $(pageStyleObj));
                }
            });
            
        }, false);
        
        return false;
    });

    // 指派點了按鈕打開看
    $(pageStyleObj).find(".fa-file-o").click(function(){
        getUidData(content.Uid, function(rsData){
            $.blockUI({
                onBlock: function(){
                    calendarView(rsData, $(pageStyleObj));
                }
            });
        }, false);
        
        return false;
    });

    // 完成按鈕
    var finishBtn = $(pageStyleObj).find(".fa-check");

    if(Boolean(content.HasDetialItem) || content.MyKeypoint.Pricipal.Uid != userID){
        finishBtn.remove();
    }
    // 事項標題
    $(pageStyleObj).find(".list-items").eq(0).html(Desc);

    // 類型
    // $(pageStyleObj).find(".list-items").eq(1).text(desiStr);

    // 迄日
    $(pageStyleObj).find(".list-items").eq(1).text(content.MyKeypoint.EndDate);
    
    // 進度
    $(pageStyleObj).find(".list-items").eq(2).text(progressStr);

    var completeStr = "辦理中";
    if(parseInt(content.MyKeypoint.Complete) == 1 ){
        if(isDesignee){
            completeStr = "未審核"; 
        }else{
            completeStr = "已回報<br/>";
            completeStr += content.Designee.Name;
            completeStr += "<br/>未審核"; 
        }
    }else if(parseInt(content.MyKeypoint.Complete) == 2){
        completeStr = "完成";   
    }else if(parseInt(content.MyKeypoint.Complete) == 3){
        completeStr = $("<div>").addClass("received-back").text('退件');
    }

    // 狀態
    // $(pageStyleObj).find(".list-items").eq(4).html(completeStr);
    $(pageStyleObj).find(".list-items").eq(3).html(completeStr);

    // 對象
    if(calendarType == 3 || calendarType == 4){
        // 指派
        if(calendarType == 3){
            $(pageStyleObj).find(".list-items").eq(4).html(content.MyKeypoint.Pricipal.Name);
        }
        // 被指派
        if(calendarType == 4){
            $(pageStyleObj).find(".list-items").eq(4).html(content.Designee.Name);
        }
    }

    // 修改
    $(pageStyleObj).find(".fa-pencil-square-o").unbind("click").click(function(){
        getUidData(content.Uid, function(rsData){
            insertDialog( rsData, $(pageStyleObj) );
        }, false);
        
    });

    // 完成
    finishBtn.unbind("click").click(function(){
        var chekBtn = $(this);
        var option = {
          sureCall: function(){
            finishList(content.Uid, itemType, $(pageStyleObj));
            chekBtn.remove();
            $(pageStyleObj).find(".fa-pencil-square-o").remove();
            $(pageStyleObj).find(".fa-trash-o").remove();
          },
          title: "完成訊息"
        };
        var msgStr = "完成";
        if(calendarType == 3){
            msgStr = "核可通過";
        }else if( calendarType == 4 ){
            msgStr = "提交審核";
        }
        var msg = "若"+msgStr+"「"+content.Desc+"」將無法異動，<br>";
        msg += "您確定要"+msgStr+"「"+content.Desc+"」？";
        chooseDialog(msg, option);
        
    });

    // 刪除
    $(pageStyleObj).find(".fa-trash-o").unbind("click").click(function(){
        var removeItem = $(this).parents(".list-items").parent();
        var defaultOption = {
          sureCall: function(){
            deleteData(content.Uid, removeItem);
          },
          sureText: "確認",
          sureClass: "btn-danger",
          title: "刪除確認"
        };
        var msg = "若此項目已指派且有辦況，刪除將會一併刪除<br/>確定要刪除「"+content.Desc+"」？";
        chooseDialog(msg, defaultOption);
        
    });

    if(content.MyKeypoint.Complete == 2){
        $(pageStyleObj).find(".item-actionBtn").text("-");
    }
    if(putArea != null && putArea != undefined){
        if(putArea.find(".data-empty").length){
            $(putArea).find(".data-empty").remove();
            $(pageStyleObj).appendTo(putArea);
        }else{
            if(putBefore){
                $(putArea).before(pageStyleObj);
            }else{
                $(pageStyleObj).appendTo(putArea);
            }
        }
    }
}

// 放資料
function putSysDataToPage(data, putArea){
    // 畫面設定值
    var option = {styleKind:"calendar-list",style:"sys-tab"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        
        $.each(data, function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");

            // 事項標題
            $(pageStyleObj).find(".list-items").eq(0).html(content.Desc);

            // 迄日
            $(pageStyleObj).find(".list-items").eq(2).text(content.MyKeypoint.EndDate);

            $(pageStyleObj).appendTo(putArea);

        });
        
        putArea.find(".dataContent").last().removeClass("list-items-bottom");
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

        // $.each(historyData, function(historiesIndex, historiesContent){
        //     historyList(historiesContent, historiesArea, isModify, false, modifyObj);
        // });
    }
}

// 創建細項或歷程
function createDetail(detailStyle, content, putArea, isModify, isView, isHistories, isDetail, isDesignee, modifyObj){
    console.log(isHistories,content);
    if(isHistories == undefined){
        isHistories = false;
    }
    if(isDetail == undefined){
        isDetail = false;
    }
    if(isDesignee == undefined){
        isDesignee = false;
    }

    if(modifyObj == undefined){
        modifyObj = false;
    }
    var detailObj = $.parseHTML(detailStyle);
    var historiesPutArea = $(detailObj).find(".histories");

    if(!isDetail){
        var putFormArea = historiesForm;
        var selectInfoArea = $(detailObj).find("#historyFileInfo");
    }else{
        var putFormArea = $(detailObj).find("#fileSelect");
        var selectInfoArea = $(detailObj).find("#fileInfo");

    }

    if(isDetail){
        if(!isView){
            $(detailObj).find(".fa-plus").remove();
        }
        if(isDesignee){
            // 加號，可新增歷程
            $(detailObj).find(".fa-plus").click(function(){
                // 歷程用另一種
                var option = {styleKind:"calendar-list",style:"history"};
                getStyle(option,function(historyPage){
                    addHistory(content, historiesPutArea, false, false, true, false, false);
                });
                
                // console.log("T");
            });
        
            $(detailObj).find(".fa-square-o").click(function(){
                finishList(content.Uid, 2, modifyObj.modifyItem, modifyObj.modifyObj);
                $(this).removeClass("fa-square-o send-btn mouse-pointer").addClass("fa-check-square-o").unbind("click");
            });
        }else{
            $(detailObj).find(".fa-plus").parent().remove();
            // $(detailObj).find(".fa-square-o").parent().remove();
        }
        if(!content.Designee.Uid == userID){
            $(detailObj).find(".fa-cloud-upload").parent().remove();
        }
    }
    // 目前沒有在編輯時新增細項的功能，所以應急先摘除
    if(isModify){
        // $(detailObj).find(".fa-cloud-upload").parent().remove();
        if(isHistories){
            if(typeof content == "object"){
                $(detailObj).find("input:text").parent().html(content.Desc);
                // $(detailObj).find(".fa-trash-o").parent().remove();
                if(parseInt(content.MyKeypoint.Complete) > 0){
                    $(detailObj).find(".fa-square-o").unbind("click").removeClass("fa-square-o send-btn mouse-pointer").addClass("fa-check-square-o");
                }

                $.each(content.Histories,function(i,historiesContents){
                    // createDetail(detailStyle, historiesContents, historiesPutArea, isModify, false, false);
                    historyList(historiesContents, historiesPutArea, isModify, false, false, false, false);
                });

            }else{
                // 新增辦況
                var historiesForm = $("<form>");
                $("#calendarViewDialog").append(historiesForm);

                $(detailObj).find(".fa-plus").remove();
                $(detailObj).find(".fa-square-o").parent().remove();
                $(detailObj).find(".fa-floppy-o").click(function(){
                    // console.log(content,$(detailObj).find("input:text").val());
                    var Desc = $(detailObj).find("#historyDesc").val();
                    var listID = content;
                    if($.trim(Desc)){
                        saveHistories(listID, Desc, $(detailObj), modifyObj, historiesForm);
                    }else{
                        $(detailObj).find("#historyDesc").attr("placeholder","未輸入辦況");
                    }

                });
            }
        }else{
            // 辦況
            $(detailObj).find("input:text").parent().html(content.Desc);
            $(detailObj).find(".fa-trash-o").parent().remove();
            $(detailObj).find(".fa-floppy-o").parent().remove();
        }
            
    }else{
        // 放內容
        $(detailObj).find("input:text").parent().removeClass("col-md-8").addClass("col-md-9");
        $(detailObj).find(".fa-square-o").parent().html('<i class="fa fa-angle-double-right"></i>');
        $(detailObj).find(".fa-plus").parent().remove();
        $(detailObj).find(".fa-floppy-o").remove();
        $(detailObj).find(".fa-trash-o").removeClass("pull-left").addClass("pull-right");
        $(detailObj).find(".histories").remove();
    }
    
    // 細項檔案上傳
    $(detailObj).find(".fa-cloud-upload").click(function(){
        // return;
        if(isHistories){
            fileSelectOneDimensional(putFormArea, selectInfoArea);
        }else{
            fileSelect(putFormArea, "unset" , selectInfoArea);
        }
    });

    // 放檔案
    if(content != undefined && content != null){
        if(content.Doc != undefined && content.Doc.length){
            var option = {styleKind:"calendar-list",style:"file-list"};
            getStyle(option,function(filelistPage){
                $.each(content.Doc, function(i, content){
                    var filelistObj = $.parseHTML(filelistPage);
                    $(filelistObj).click(function(){
                        downloadFile(content.Uid, content.Name);
                    });
                    $(filelistObj).find(".list-items").eq(1).text(content.Name)

                    selectInfoArea.append(filelistObj);
                });
            });

        }
    }

    // 刪除鈕
    $(detailObj).find(".fa-trash-o").click(function(){
        var removeArea = $(this).parents(".detail-item").eq(0);
        removeArea.remove();
        if(historiesForm != undefined){
            historiesForm.remove();
        }
    });
    
    $(detailObj).appendTo(putArea);
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
    var style = "history";
    if(parseInt(modifyObj.Type.Uid) == 1){
        style = "sys-history";
    }
    var option = {styleKind:"calendar-list",style:style};
    getStyle(option,function(historyPage){
        // createDetail(historyPage, content, putArea, isModify, isView, isHistories, isDetail, isDesignee, modifyObj);
        createHistories(historyPage, content, putArea, isModify, isDesignee, modifyObj);
    });
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

        // 系統類別要把編輯拿掉
    if(content != null && content != undefined){
        if(parseInt(content.Type.Uid) == 1){
            $(detailObj).find(".fa-plus").remove();  
        }
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
    if(content != null){
        if(content.Designee.Uid == userID && parentData.MyKeypoint.Complete == 1 && content.MyKeypoint.Complete == 2){
            // $(detailObj).find(".fa-ban").click(function(){
            //     banDetailBtn(content.Uid, Desc, parentData.Uid);
            // });
        }else{
            // $(detailObj).find(".fa-ban").remove();
        }
    }
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
            if((parentData.MyKeypoint.Complete != 0 && parentData.MyKeypoint.Complete != 3) || parentData.Type.Uid == 1){
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
            if(content.MyKeypoint.Complete > 0){
                var isCheckItem = $(detailObj).find(".fa-square-o").unbind("click").removeClass("fa-square-o send-btn mouse-pointer ban-not").addClass("fa-check-square-o");
                if(content.Assist.Uid > 0 && content.Assist.Uid != userID){
                    isCheckItem.addClass("ban-not");
                }
                $(detailObj).find(".fa-plus").remove();
            }
            if(parentData.MyKeypoint.Complete > 0 && parentData.MyKeypoint.Complete < 3){
                var isCheckItem = $(detailObj).find(".fa-square-o").unbind("click");
                if(content.MyKeypoint.Complete > 0){
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
                if(content.MyKeypoint.Complete > 0){
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
                if(content.MyKeypoint.Complete > 0 || isView){
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

    // 系統類別要把編輯拿掉
    if(parseInt(modifyObj.Type.Uid) == 1){
        $(historiesObj).find("#modifyHistory").remove();  
        $(historiesObj).find("#actionBtn").remove(); 
        $(historiesObj).find(".fa-trash-o").remove();
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
        if(parseInt(modifyObj.MyKeypoint.Complete) > 0 || content.IsSubmit){
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

// 取得回報和指派使用者列表
function getUserList(putAreaArr, selectID){
    var sendData = {
        api: "AssCommon/GetData_AssCommon",
        threeModal: true,
        data:{
            sys_code: sys_code
        }
    };
    $.getJSON(wrsUrl, sendData,function(rs){
        if(rs.Status){
            $.each(putAreaArr,function(i,putArea){
                $.each(rs.Data, function(dI, content){
                    selectOptionPut(putArea,content.userID,content.name);
                });
                if(selectID != null){
                    $(putArea).val(selectID);
                }
            });
        }else{
            $.each(putAreaArr,function(i,putArea){
                selectOptionPut(putArea,"","未有資料");
            });
        }
    });
    
}

function deleteData(uid, removeArea, isDetail, putFormArea){
    if(isDetail == undefined){
        isDetail = false;
    }
    var data = [];
    data.push(uid);
    var sendData = {
        api: calendarAPI+"DeleteToDoList",
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
        success: function(rs){
            var rs = $.parseJSON(rs);
            if(!rs.Status){
                msgDialog(rs.Data);
            }else{
                $(removeArea).remove();
                if(!isDetail){
                    if($("#total-content").find(".dataContent").length){
                        $("#total-content").find(".dataContent").last().removeClass("list-items-bottom");
                    }else{
                        putEmptyInfo($("#total-content"));
                    }
                }else{
                    putFormArea.remove();
                }
            }
            
        }
    });
}

function deleteDetailData(uid){
    var data = [];
    data.push(uid);
    var sendData = {
        api: calendarAPI+"DeleteToDoList",
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
function deleteFile(uid, fileID, modifyItem){
    var sendData = {
        // api: calendarAPI+"RemoveToDoFiles",
        api: calendarAPI+"DeleteToDoFiles",
        data:{
            "to_do_id": uid,
            "doc_id": fileID
        },
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
                modifyItem.reomve();
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

// 取得單筆資料
function getUidData(uid, callback, returnStyle){
    var sendData = {
        api: calendarAPI+"GetToDoItem",
        data:{
            uid: uid,
            userId: userID,
        }
    };
    var returnStyle = (returnStyle == undefined)?true:returnStyle;

    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.Status){
            if(returnStyle){
                var style = "normal";
                // 畫面設定值
                if(calendarType == 3){
                    style = "assign";
                }else if( calendarType == 4 ){
                    style = "beassign";
                }else if(calendarType == 6){
                    style = "finished";
                }
                // 畫面設定值
                var option = {styleKind:"calendar-list",style:style};
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

// 取得單筆資料
function getDetailUidData(uid, callback){
    var sendData = {
        api: calendarAPI+"GetToDoItem",
        data:{
            uid: uid,
            userId: userID,
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        callback(rs.Data);
    });
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

// 多檔案上傳-二維
function fileSelect(putFormArea, calendarItemType, selectInfoArea){
    var fileInput = $("<input>").hide().prop("type","file").prop("name","files["+calendarItemType+"][]").change(function(){
        var fileThis = $(this);
        getFileLimit(sys_code, function(rs){
            var fileSize = clientFileUnitTrans(fileThis.prop("files")[0].size, rs.Unit);
            if((rs.LastSpace - fileSize) > 0){
                // console.log($(this));
                var names = $.map(fileThis.prop("files"), function(val,i) { 
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

                // console.log(names);
                fileThis.appendTo(putFormArea);
            }else{
                var last = serverFileUnitTrans(parseFloat(rs.LastSpace));
                msgDialog("您剩餘的空間不足，請選擇請確認檔案大小，剩餘:"+last.LastSpace+last.Unit);
            }
        });
        // console.log(formObj);
    });
    fileInput.click();
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

function putListTitle(calendarType){
    var str = "";
    switch(calendarType){
        case 1:
            str = "備忘";
        break;
        case 3:
            str = "指派";
        break;
        case 4:
            str = "被指派";
        break;
        case 7:
            str = "系統";
        break;
        case 6:
            str = "完成";
        break;

        default:
            str = "備忘";
        break;
    }
    $("#dropdownMenu").find("#selectType").text(str);
    $("#calendarTypeDropdown").removeClass("open");
}