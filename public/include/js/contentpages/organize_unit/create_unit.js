function createUnit(isNew, uid, name, sys_code, callBack){
    var method = "Insert_AssTypeOffice";
    if(!isNew){
        method = "Update_AssTypeOffice";
    }

    var sendData = {
        api: "AssTypeOffice/"+method,
        threeModal: true,
        data: {
            uid: uid,
            name: name,
            sys_code: sys_code
        }
    }
    $.blockUI();
    $.post(wrsUrl,sendData,function(rs){
        var rs = $.parseJSON(rs);
        callBack(rs);
        $.unblockUI();
    });
}
