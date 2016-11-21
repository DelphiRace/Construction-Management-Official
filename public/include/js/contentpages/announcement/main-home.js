var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
$(function(){
    getAnnouncementData();
    // 首頁點選後可以導頁
    $("#announcementMore,#announcementTitle").click(function(){
        loadPage("announcement/list","pagescontent");
        return false;
    });

    tabContentCtrl($("#announcementTab"));
    $("#announcementTab").find(".announcementTab").click(function(){
        var type = $(this).prop("id");
        getAnnouncementData(type);
    });
});

// 取得列表資料
function getAnnouncementData(type){
    $("#home-announcementlist").empty();
    loader($("#home-announcementlist"));
    if(type == undefined){
        type = 0;
    }

    var sendData = {
        api: announcementAPI+"GetNews",
        data:{
            first: 0,
            count: 5,
            type: type,
            sysCodeId: sys_code
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        $("#home-announcementlist").empty();
        if(rs.Status && rs.Data.length){
            putAnnouncementDataToPage(rs.Data, $("#home-announcementlist"));
            $("#announcementMore").parent().show();
        }else{
            putEmptyInfo($("#home-announcementlist"));
            $("#announcementMore").parent().hide();
        }
    });
}

// 放資料
function putAnnouncementDataToPage(data, putArea){
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"announcement",style:"list"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        $.each(data, function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");

            var desiStr, desClass;
            var dateStr = content.Date;
            if(content.Type == 1){
                desiStr = "收文";
                desClass = "label-warning";
            }
            if(content.Type == 2){
                desiStr = "檔案";
                desClass = "label-info";
            }
            if(content.Type == 3){
                desiStr = "逾期";
                desClass = "label-danger";
                dateStr = overDateTime(dateStr);

                // console.log();

            }
            if(content.Type == 4){
                desiStr = "發文";
                desClass = "label-warning";
            }
            

            // 分類標籤
            $(pageStyleObj).find(".list-items").eq(0).find(".label").addClass(desClass).text(desiStr);

            // 事項標題可以點開觀看
            var Desc = $("<a>").prop("href","#").text(content.Title).click(function(){
                announcementView(content);
                return false;
            });

            // 事項標題
            $(pageStyleObj).find(".list-items").eq(1).html(Desc);
            // 日期
            $(pageStyleObj).find(".list-items").eq(2).html(dateStr);
            
            $(pageStyleObj).appendTo(putArea);

        });
        // putArea.find(".dataContent").last().removeClass("list-items-bottom-dash");
    });
}

function overDateTime(dateStr){
    var overTime = new Date(dateStr);
    var todayTime = new Date(); // today time
    var gapDate = (todayTime - overTime);

    if(gapDate >= 86400){
        gapDate = Math.floor(gapDate/86400000) + "天";
    }else{
        if(gapDate >= 3600){
            gapDate = Math.floor(gapDate / 3600000) + "小時";
        }else{
            gapDate = Math.floor(gapDate/60000) + "分鐘";
        }
    }
    return gapDate;
}

