var socket = io.connect(configObject.socketConn);

var sysCode, uuid, userID;
// 登入資訊確認後才設置
function setSocket(){
    sysCode = userLoginInfo.sysCode;
    uuid = userLoginInfo.uuid;
    userID = userLoginInfo.userID;
    var sendData = {
        uuid: uuid,
        userID: userID,
        sysCode: sysCode
    }

    socket.emit('onlineSystem', sendData);
}

socket.on('sysPushSpecified', function(data) {
    var msg = ""
    if(data.link != undefined){
        msg = '<a href="'+data.link+'">'+data.msg+'</a>';
    }else{
        msg = data.msg;
    }
    showNoticeToast(msg);
});