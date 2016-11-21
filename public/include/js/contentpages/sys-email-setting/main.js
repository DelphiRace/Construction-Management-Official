var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;

$(function(){
    getEmailSettingValue();
});

// 取得設定值
function getEmailSettingValue(){
    var sendObj = {
        api: UserEmailAPI + "GetData_UserEmail",
        data:{
            sys_code: sys_code,
            userID: userID,
        },
        threeModal: true
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Status){
            $("#email").val(rs.Data[0].Email);
            addEmailSaveBtnClick(rs.Data[0].uid);
        }
    });
}

//設定
function setEmail(uid,email){
    var sendObj = {
        api: UserEmailAPI + "Update_UserEmail",
        threeModal: true,
        data:{
            uid: uid,
            email: email
        }
    };

    $.post(wrsUrl, sendObj, function(rs){
        try{
            var rs = $.parseJSON(rs);
        }catch(error){

        }
        if(rs.Status){
            msgDialog(rs.msg, false);
        }else{
            msgDialog(rs.msg);
        }
    });
}

function addEmailSaveBtnClick(uid){
    // 個人按鈕
    $("#emailSaveBtn").unbind("click").click(function(){
        setEmail(uid,$("#email").val());
    });
}

