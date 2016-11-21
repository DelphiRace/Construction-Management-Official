var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
$(function(){
    getCalendarData();
    // 首頁點選後可以導頁
    $("#calendarMore,#calendarTitle").click(function(){
        loadPage("calendar/list","pagescontent");
        return false;
    });
});
function getCalendarData(type,areaID,uid){
    $("#"+areaID).find(".dataContent").remove();
    $("#"+areaID).find(".data-empty").remove();
    if(type == undefined){
        type = 2;
    }

    if(areaID == undefined){
        areaID = "today-calendarlist";
    }

    var sendData = {
        api: calendarAPI+"GetToDoList",
        data:{
            userId: userID,
            type: type
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.Status){
            putDataToPage(rs.Data, $("#"+areaID));
        }else{
            putEmptyInfo($("#"+areaID));
            $("#calendarMore").parent().remove();
        }
    });
}

// 放資料
function putDataToPage(data, putArea){
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"calendar-list",style:"today"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        $.each(data, function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");

            var desiStr = "個人";
            var desClass = "label-info"; 
            if(content.Type != undefined){
                if(content.Type.Uid == 1){
                    desiStr = "系統";
                    desClass = "label-danger";
                }
            }

            // 分類標籤
            $(pageStyleObj).find(".list-items").eq(0).find(".label").addClass(desClass).text(desiStr);

            // 事項標題可以點開觀看
            var Desc = $("<a>").prop("href","#").text(content.Desc).click(function(){
                calendarView(content, $(pageStyleObj));
                return false;
            });

            if(content.Location == ""){
                $(pageStyleObj).find(".map-marker").hide();
            }else{
                // $(pageStyleObj).find(".map-marker").eq(1).text(content.Location);

            }

            // 事項標題
            $(pageStyleObj).find(".list-items").eq(1).html(Desc);
            
            $(pageStyleObj).appendTo(putArea);

        });
        putArea.find(".dataContent").last().removeClass("list-items-bottom");
    });
}


// 查看
function calendarView(content, putArea){
    $("#calendarViewDialog").remove();
    var calendarViewDialog = $("<div>").prop("id","calendarViewDialog");
    calendarViewDialog.appendTo("body");

    $("#calendarViewDialog").bsDialog({
        title: content.Desc+"項目檢視",
        titleStyle: "list-item-hide-text",
        autoShow: true,
        start: function(){
          var option = {styleKind:"calendar-list",style:"view"};
          getStyle(option,function(calendarView){
            // 細項＆歷程用同一種
            var option = {styleKind:"calendar-list",style:"detail-list"};
            getStyle(option,function(detailPage){
                var calendarViewObj = $.parseHTML(calendarView);
                var isModify = true;
                var detailPutArea = $(calendarViewObj).find("#detailArea").find(".control-label").eq(1)
                
                    // 事項
                    $(calendarViewObj).find(".list-items").find("#Desc").text(content.Desc);

                    // 地點
                    if(!content.Location){
                        $(calendarViewObj).find(".list-items").find("#Location").parent().parent().hide(); 
                    }
                    $(calendarViewObj).find(".list-items").find("#Location").text(content.Location);

                    // 起日
                    $(calendarViewObj).find("#StartDate_content").text(content.StartDate);

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

                    $(calendarViewObj).find("#Pricipal").text(Pricipal);
                    $(calendarViewObj).find("#Designee").text(content.Designee.Name);

                    // 預警日期
                    if(!WarningDate){
                        $(calendarViewObj).find("#WarningDate_content").parent().parent().hide();
                    }
                    $(calendarViewObj).find("#WarningDate_content").text(WarningDate);

                    // 取得細項內容
                    var sendData = {
                        api: calendarAPI+"GetToDoList",
                        data: {
                            userId: userID,
                            type: 1,
                            fid: content.Uid
                        }
                    };
                    $.getJSON(wrsUrl,sendData, function(rs){
                        if(rs.Status){
                            $.each(rs.Data,function(detailIndex, detailContent){
                                //createDetail(detailPage, detailContent, detailPutArea, true);
                                createDetailItem(detailPage, detailContent, detailPutArea);
                            });
                        }else{
                            detailArea.remove();
                        }
                    });
                
                $(calendarViewObj).find("#addDetail").remove();
                $(calendarViewObj).find("#addHistories").remove();

                var historiesArea = $(calendarViewObj).find("#historiesArea").find(".control-label").eq(2);
                if(content.Histories != undefined){
                    if(content.Histories.length){
                        $.each(content.Histories, function(historiesIndex, historiesContent){
                            // createDetail(detailPage, historiesContent, historiesArea, false);
                            createHistories(detailPage, historiesContent, historiesArea);
                        });
                    }else{
                        $(calendarViewObj).find("#historiesArea").hide();
                    }
                }

                if(content.Doc.length){
                    putFileToInfoArea($(calendarViewObj).find("#selectInfo"), content.Doc);
                }else{
                    $(calendarViewObj).find("#selectInfo").parent().hide();
                }

                $(calendarViewObj).appendTo($("#calendarViewDialog").find(".modal-body"));
            });
          });
        },
        button:[
            {
                text: "關閉",
                className: "btn-default-font-color pull-left",
                click: function(){
                    $("#calendarViewDialog").bsDialog("close");
                }
            },
            {
                text: "前往待辦",
                className: "btn-success",
                click: function(){
                    $("#calendarViewDialog").bsDialog("close");
                    var ct = 1;
                    if(content.Type.Uid == 1 || content.Designee.Uid == 0){
                        ct = 7;
                    }else{
                        // 指派
                        if(content.Designee.Uid != content.MyKeypoint.Pricipal.Uid){
                            if(content.Designee.Uid == userID){
                                ct = 3;
                            }
                            if(content.MyKeypoint.Pricipal.Uid == userID){
                                ct = 4;
                            }
                        }
                    }
                    var hash = {
                        i: content.Uid,
                        ct: ct
                    };
                    hashLoadPage("calendar/list", hash, "pagescontent");
                }
            },
        ]
    });
}

// 創建細項
function createDetailItem(detailStyle, content, putArea){
    
    var detailObj = $.parseHTML(detailStyle);
    
    var historiesPutArea = $(detailObj).find(".histories");
    var selectInfoArea = $(detailObj).find("#fileInfo");
    // 是否為協辦人
    var isAssist = (content == null || content == undefined)?false : (content.Assist.Uid == userID) ? true:false;
    // 加載預覽的內容
    
    viewFileArea(detailObj);
    $(detailObj).find(".list-items").eq(1).html(content.Desc);

    if(content != null){
        if(!content.Designee.Uid == userID){
            $(detailObj).find(".fa-cloud-upload").parent().remove();
        }
    }

        
    if(!content.Doc.length){
        $(detailObj).find("#file-expand").parent().remove();
    }
    
    if(content.MyKeypoint.Status.Uid > 1){
        var isCheckItem = $(detailObj).find(".fa-square-o").unbind("click").removeClass("fa-square-o send-btn mouse-pointer ban-not").addClass("fa-check-square-o");
        if(content.Assist.Uid > 0 && content.Assist.Uid != userID){
            isCheckItem.addClass("ban-not");
        }
        $(detailObj).find(".fa-plus").remove();
    }
    
        
    $(detailObj).appendTo(putArea);
    console.log(detailObj,putArea);
}


// 創建細項或歷程
function createDetail(detailStyle, content, putArea, isDetail){
    if(isDetail == undefined){
        isDetail = false;
    }

    var detailObj = $.parseHTML(detailStyle);
    var historiesPutArea = $(detailObj).find(".histories");
    $(detailObj).find(".fa-plus").remove();
    $(detailObj).find(".fa-square-o").remove();
    $(detailObj).find(".histories").remove();
    $(detailObj).find(".fa-trash-o").remove();
    $(detailObj).find(".fa-floppy-o").remove();


    // 目前沒有在編輯時新增細項的功能，所以應急先摘除
    if(isDetail){
        $(detailObj).find(".list-items").eq(1).html(content.Desc);

        $.each(content.Histories,function(i,historiesContents){
            createDetail(detailStyle, historiesContents, historiesPutArea);
        });
        
    }else{
        // 放內容
        $(detailObj).find(".list-items").eq(1).html(content.Desc);

    }
    $(detailObj).appendTo(putArea);
}


function createHistories(historiesStyle, content, putArea){
    var historiesObj = $.parseHTML(historiesStyle);


    // 新增辦況檔案上傳區
    var selectInfoArea = $(historiesObj).find("#historyFileInfo");
    if(content == null){
        $(historiesObj).find(".fa-pencil-square-o").hide();
    }

    // 辦況
    // 完成後刪除
    // 先暫時都刪除"刪除按鈕"
    // $(historiesObj).find(".fa-trash-o").parent().remove();

    $(historiesObj).find(".list-items").eq(1).html(content.Desc);
    
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
    $(historiesObj).appendTo(putArea);
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