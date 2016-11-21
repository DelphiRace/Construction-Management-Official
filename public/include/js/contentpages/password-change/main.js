var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
var uuid = userLoginInfo.uuid;

$("#change").click(function(){
    var oldPass = $("#oldPass").val();
    var newPass = $("#newPass").val();
    var confirmPass = $("#confirmPass").val();

    if($.trim(oldPass).length != oldPass.length){
        msgDialog("舊密碼不可有空白");
        return;
    }

    if($.trim(newPass).length != newPass.length){
        msgDialog("新密碼不可有空白");
        return;
    }

    if($.trim(confirmPass).length != confirmPass.length){
        msgDialog("確認密碼不可有空白");
        return;
    }

    if(newPass == confirmPass && oldPass != newPass){
        changePass(oldPass, newPass);
    }else{
        if(newPass != confirmPass){
            $("#newPass").addClass("item-bg-danger");
            $("#confirmPass").addClass("item-bg-danger");
            msgDialog("新密碼與再次確認密碼不同");
        }else if(oldPass == newPass){
            $("#newPass").addClass("item-bg-danger");
            $("#oldPass").addClass("item-bg-danger");
            msgDialog("舊密碼不可與新密碼相同");
        }
        $("#oldPass").val("");
        $("#newPass").val("");
        $("#confirmPass").val("");
    }
});

function changePass(oldPass, newPass){
    var sendData = {
        uuid: uuid,
        oldPass: oldPass,
        newPass: newPass
    };
    $.post(changeAPI, sendData, function(rs){
        try{
            var rs = $.parseJSON(rs);
        }catch(err){

        }
        if(rs.status){
            msgDialog(rs.msg, false);
        }else{
            msgDialog(rs.msg);
        }
        $("#oldPass").val("");
        $("#newPass").val("");
        $("#confirmPass").val("");
    });
}
