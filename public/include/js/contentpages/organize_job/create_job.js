function createJob(sendData, callBack){
    $.blockUI();
    var method = "Insert_AssTypePosition";
    
    if(sendData.uid != undefined){
        method = "Update_AssTypePosition";
    }
    var sendObj = {
        api: "AssTypePosition/"+method,
        threeModal: true,
        data: sendData
    }
    $.post( wrsUrl, sendObj, function(rs){
        $.unblockUI();

        var rs = $.parseJSON(rs);
        callBack(rs);
    });
}
