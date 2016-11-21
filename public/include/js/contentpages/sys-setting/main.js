var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
var isAdmin = userLoginInfo.isAdmin;

$(function(){
    if(!isAdmin){
        $("#adminHomeCalendar").remove();
    }
    getCalendarSettingValue();
    getCalendarSettingValue(1);
});

// 取得設定值
function getCalendarSettingValue(identity){
    if(identity == undefined){
        identity = 2;
    }
    var sendObj = {
        api: calendarAPI + "GetHomePageSetting",
        data:{
            identity: identity,
            sysCodeId: sys_code,
            userId: userID
        }
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Status){
            if(identity == 1){
                $("#defaultHomeCalendar").val(rs.Data);
            }else{
                $("#homeCalendar").val(rs.Data);
            }
        }
    });
}

//設定
function setCalendar(value,identity){
    if(identity == undefined){
        identity = 2;
    }
    var sendObj = {
        api: calendarAPI + "SetHomePageSetting?identity="+identity,
        data:{
            SysCodeId: sys_code,
            UserId: userID,
            Setting: value
        }
    };

    $.post(wrsUrl, sendObj, function(rs){
        try{
            var rs = $.parseJSON(rs);
        }catch(error){

        }
        if(rs.Status){
            msgDialog(rs.Data, false);
        }else{
            msgDialog(rs.Data);
        }
    });
}

// 個人按鈕
$("#homeCalendarSaveBtn").click(function(){
    setCalendar($("#homeCalendar").val());
});

// 管理員預設按鈕
$("#defaultHomeCalendarSaveBtn").click(function(){
    setCalendar($("#defaultHomeCalendar").val(), 1);
});

// 管理員重整按鈕
$("#defaultHomeCalendarRefreshBtn").click(function(){
    getCalendarSettingValue(1);
});

// 個人重整按鈕
$("#homeCalendarRefreshBtn").click(function(){
    getCalendarSettingValue();
});
