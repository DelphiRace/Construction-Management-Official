// 查看
function calendarView(content, putArea){
    $("#calendarViewDialog").remove();
    var calendarViewDialog = $("<div>").prop("id","calendarViewDialog");
    calendarViewDialog.appendTo("body");
    if(putArea == undefined){
        putArea = null;
    }
    var isVerify = false;
    if(content.MyKeypoint.Status.Uid == 2 && content.Designee.Uid == userID){
        isVerify = true;
    }
    
    var title = "備忘";

    if(content.Designee.Uid == userID && content.MyKeypoint.Pricipal.Uid != userID){
        title = "指派";
    }

    if(content.Designee.Uid != userID && content.MyKeypoint.Pricipal.Uid == userID){
        title = "被指派";
    }


    if(content.Opid != "" && content.SourceId != 0){
        var sendData = {
            api: "menuUrl/GetData_MenuURL",
            data: {
                opid: content.Opid
            },
            threeModal: true
        }
        $.getJSON(wrsUrl, sendData, function(rs){
            if(rs.status){
                $("#calendarViewDialog").bsDialog({
                    title: title+" - 「"+content.Desc+"」",
                    titleStyle: "list-item-hide-text",
                    autoShow: true,
                    start: calendarViewStart(content, putArea, rs.data),
                    button:createViewBtn(isVerify, content, putArea, rs.data)
                });
            }else{
                msgDialog("無法取得關聯系統資料");
            }
        });
    }else{
        $("#calendarViewDialog").bsDialog({
            title: title+" - 「"+content.Desc+"」",
            titleStyle: "list-item-hide-text",

            autoShow: true,
            start: calendarViewStart(content, putArea),
            button:createViewBtn(isVerify, content, putArea)
        });
    }
}

function calendarViewStart(content, putArea, sysUrl){
    if(sysUrl == undefined){
        sysUrl = "";
    }
    var option = {styleKind:"calendar-list",style:"view"};
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

            if((content.MyKeypoint.Status.Uid != 1 && content.MyKeypoint.Status.Uid != 4) || content.Type.Uid == 1){
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
            
            // 事項
            $(calendarViewObj).find(".list-items").find("#Desc").text(content.Desc);

            // 地點
            if(!content.Location){
                $(calendarViewObj).find(".list-items").find("#Location").parent().parent().hide();
            }
            $(calendarViewObj).find(".list-items").find("#Location").text(content.Location);

            // 起日
            $(calendarViewObj).find("#StartDate_content").text(content.StartDate);
            // 如果是系統的話，改其他字
            if(parseInt(content.Type.Uid) == 1){
                $(calendarViewObj).find("#StartDate_content").parent().find(".control-label").eq(0).text("新增日期");
            }

            // 迄日
            var EndDate = "";
            var Pricipal;
            var WarningDate = "";
            if(content.MyKeypoint != undefined){
                EndDate = content.MyKeypoint.EndDate;
                WarningDate = (content.MyKeypoint.WarningDate)?content.MyKeypoint.WarningDate:"";
                Pricipal = content.MyKeypoint.Pricipal.Name;
            }else{
                EndDate = content.EndDate;
                WarningDate = content.WarningDate;
                Pricipal = content.Pricipal.Name;
            }

            if(!EndDate){
                $(calendarViewObj).find("#EndDate_content").parent().parent().hide();
            }
            $(calendarViewObj).find("#EndDate_content").text(EndDate);

            // 預警日期
            if(WarningDate){
                $(calendarViewObj).find("#WarningDate_content").text(WarningDate);
            }else{
                $(calendarViewObj).find("#WarningDate_content").parent().parent().hide();
            }
            $(calendarViewObj).find("#Pricipal").text(content.MyKeypoint.Pricipal.Name);
            $(calendarViewObj).find("#Designee").text(content.Designee.Name);

            if(content.Doc.length){
                putFileToInfoArea($(calendarViewObj).find("#selectInfo"), content.Doc);
            }else{
                $(calendarViewObj).find("#selectInfo").parent().hide();
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
                if(content.Histories.length){
                    creatHistory(content.Histories, historiesArea, false, content, true, content.Uid);
                }else{
                    if(parseInt(content.Type.Uid) == 1){
                        historiesArea.parent().parent().hide();
                    }
                }
            }else{
                if(parseInt(content.Type.Uid) == 1){
                    historiesArea.parent().parent().hide();
                }
            }
            // 增加辦況
            $(calendarViewObj).find("#addHistories").click(function(){

                var tmpModifyObj = {
                    modifyObj: content,
                    modifyItem: putArea
                };
                // console.log(tmpModifyObj);
                // createDetail(detailPage, content.Uid, historiesArea, isModify, true, false, tmpModifyObj);
                addHistory(null, historiesArea, isModify, false, content, true, content.Uid);
            });
            
            if(sysUrl && calendarType == 4){
                $(calendarViewObj).find("#fromSource").find("#goToSource").click(function(){
                    deleteHash();
                    var hash = {
                    i: content.SourceId,
                    ve: 1
                    };
                    hashLoadPage(sysUrl, hash, "pagescontent");
                    return false;
                });
                $(calendarViewObj).find("#fromSource").show();
            }else{
                $(calendarViewObj).find("#fromSource").remove();
            }

            $(calendarViewObj).appendTo($("#calendarViewDialog").find(".modal-body"));
            $.unblockUI();
        });
    });
}


function createViewBtn(isVerify, listContent, listItem, sysUrl){
    if(sysUrl == undefined){
        sysUrl = "";
    }
    var btn = [];
    var closeBtnClass = " pull-left";
    btn.push({
        text: "關閉",
        className: "btn-default-font-color",
        click: function(){
            deleteHash();
            var isNotSave = checkViewHistory();
            if(isNotSave){
                var option = {
                  sureCall: function(){
                    $("#calendarViewDialog").bsDialog("close");
                  },
                  title: "關閉確認",
                  sureClass: "btn-danger",
                  sureText: "不儲存辦況並關閉"
                };
                var msg = "您還有尚未儲存的辦況，關閉將不會存取辦況，<br>";
                msg += "您是否要關閉不存取辦況？";
                chooseDialog(msg, option);
            }else{
                $("#calendarViewDialog").bsDialog("close");
            }
        }
    });
    
    if(calendarType == 3 && isVerify){

        btn[0]["className"] += closeBtnClass;
        btn.push({
            text: "退回",
            className: "btn-danger",
            click: function(){
                deleteHash();
                // console.log(modifyObj, modifyItem);
                banCalendarBtn(listContent, listItem);
            }
        });
        btn.push({
            text: "通過",
            className: "btn btn-success",
            click: function(){
                deleteHash();
                passCalendarBtn(listContent, listItem);
            }
        });
    }

    if(sysUrl && calendarType != 4){
        // GetData_MenuURL
        btn[0]["className"] += closeBtnClass;
        btn.push({
            text: "前往查閱",
            className: "btn btn-warning",
            click: function(){
                deleteHash();
                var hash = {
                    i: listContent.SourceId,
                    ve: 1
                };
                hashLoadPage(sysUrl, hash, "pagescontent");
            }
        });
    }
    return btn;
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

// 通過事項
function passCalendarBtn(listContent,listItem){
    var option = {
      sureCall: function(){
        // 通過事項
        $("#calendarViewDialog").bsDialog('close');
        finishList(listContent.Uid, 2, listItem, listContent);
      },
      sureText: "確定",
      title: "確認訊息"
    };
    var msg = "若通過「"+listContent.Desc+"」，則該事項將無法異動<br>";
    msg += "您確定要通過「"+listContent.Desc+"」？";
    chooseDialog(msg, option);
}

// 退回事項
function banCalendarBtn(listContent,listItem){
    var option = {
      sureCall: function(){
        // 退回細項
        // finishList(uid, 0, undefined);
        // 退回事項
        // finishList(listContent.Uid, 0, listItem,listContent);
        banCalendarAction(listContent, listItem);
      },
      sureText: "確定",
      sureClass: "btn-danger",
      title: "退回訊息"
    };
    var msg = "若退回「"+listContent.Desc+"」，則該事項將退回承辦處理您所填寫的「審退意見」，並填寫相關辦況後才可提交<br>";
    msg += "您確定要退回「"+listContent.Desc+"」？";
    chooseDialog(msg, option);
}

// 退回動作
function banCalendarAction(listContent, listItem){
    $("#banCalendarDialog").remove();
    var banCalendarDialog = $("<div>").prop("id","banCalendarDialog");
    banCalendarDialog.appendTo("body");

    var detailUidContentArr = [];
    $("#banCalendarDialog").bsDialog({
        title: "審退意見",
        autoShow: true,
        start: function(){
            var option = {styleKind:"calendar-list",style:"reject-calendar"};
            getStyle(option,function(rejectPage){
                var rejectPageObj = $.parseHTML(rejectPage);
                $(rejectPageObj).appendTo($("#banCalendarDialog").find(".modal-body"))
            });
        },
        button:[
            {
                text: "取消",
                className: "btn-default-font-color",
                click: function(){
                    $("#banCalendarDialog").bsDialog("close");
                }
            },
            {
                text: "退回",
                className: "btn-danger",
                click: function(){
                    
                    
                    if($.trim($("#banCalendarDialog").find("#Desc").val())){
                        var newDetail = $.extend({}, listContent, {});
                        newDetail.Desc = $("#banCalendarDialog").find("#Desc").val();
                        newDetail.Fid = newDetail.Uid;
                        newDetail.Pricipal = newDetail.MyKeypoint.Pricipal;
                        newDetail.EndDate = newDetail.MyKeypoint.EndDate;
                        newDetail.WarningDate = newDetail.MyKeypoint.WarningDate;
                        newDetail.Keywords = newDetail.MyKeypoint.Keywords;
                        newDetail.Assist = {};
                        newDetail.Assist.Uid = 0;
                        newDetail.Trace = true;
                        newDetail.Type = {};
                        newDetail.Type.Uid = 3;

                        delete newDetail.Uid;
                        delete newDetail.Histories;
                        delete newDetail.MyKeypoint;
                        delete newDetail.Opid;
                        delete newDetail.SourceId;
                        delete newDetail.Progress;
                        delete newDetail.HasDetialItem;
                        delete newDetail.CompletionDate;
                        // console.log(newDetail);
                        rejectCalendar(listContent, listItem, newDetail);
                    }else{
                        $("#banCalendarDialog").find("#Desc").addClass("item-bg-danger");
                    }
                }
            }
        ]
    });
}