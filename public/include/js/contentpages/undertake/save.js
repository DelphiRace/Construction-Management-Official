// 儲存收文新增/修改
function saveReferenceData(sendObj, modifyItem, putFormArea){
    sendObj.user_name = userLoginInfo.userName;
	
	var method = "setReferenceInsert";
	var processURL = wrsUrl;
    var fileUpload = false;
	if( $(putFormArea).find("input:file").length > 0){
		processURL = wrsAPI + "uploaderAPI";
		method = "setReferenceDocInsert";
        fileUpload = true;
	}
    var changeJson = false;
    if(fileUpload){
        uploadBlockInfo();
        changeJson = true;
    }else{
        $.blockUI();
    }

    var sendData = {
        api: referenceAPI + method,
        data: sendObj,
        changeJson: changeJson,
        sendJsonIndex: "jsonString",
        sysCode: sys_code,
        userID: userID
    };

	// console.log(sendObj);
    var options = {
		url: processURL,
        type:"POST",
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");

        },
        success: function(rs) {
           // console.log(rs);
            if(rs.status){
                // getData();
                renewListData($("#received-content"), rs.uid, true);
                $("#insertDialog").bsDialog('close');
            }else{
                if(rs.bpsNoPosition != undefined){
                    if(rs.bpsNoPosition){
                        msgDialog("您沒有總收發權限");
                    }
                }else{
                    msgDialog(rs.Message);
                }
            }
            $.unblockUI();
            
            
        },

    };
    $(putFormArea).ajaxSubmit(options);

}

// 發文送出
function saveSignData(sendObj, modifyItem, putFormArea, isReDispatch){
    
    var method = "setDispatchInsert";
    var processURL = wrsUrl;
    var fileUpload = false;
    if( $(putFormArea).find("input:file").length > 0){
        processURL = wrsAPI + "uploaderAPI";
        method = "setDispatchDocInsert";
        fileUpload = true;
    }

    var changeJson = false;
    if(fileUpload){
        uploadBlockInfo();
        changeJson = true;
    }else{
        $.blockUI();
    }

    var sendData = {
        api: waDrfAPI + method,
        data: sendObj,
        changeJson: changeJson,
        sendJsonIndex: "jsonString",
        sysCode: sys_code
    };

    // console.log(sendObj);
    // return;
    // console.log(sendObj);
    var options = {
        url: processURL,
        type:"POST",
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");
        },
        success: function(rs) {
            if(rs.status){
                signPosList.push(rs.uid.toString());
                docSignStatus[rs.uid] = (sendObj.actionType)?"簽核中":"會簽中";
                docIDStr = rs.uid+","+sendDocIDStr;
                if(isReDispatch){
                    modifyItem.remove();
                }

                // 有權限處理的資料
                var sendData = {
                    api : "ApdData/GetApdData_ProcessDoc",
                    threeModal: true,
                    data:{
                        docID: docIDStr,
                        userID: userID
                    }
                }

                $.post(wrsUrl, sendData, function(pdDatas){
                    if(tabCode == 2){
                        pdDatas = $.parseJSON(pdDatas);
                        if(pdDatas.Status){
                            processDocData = pdDatas.Data;
                        }

                        renewListData($("#sendDoc-content"), rs.uid, true);
                        $("#signInfoAndDateDialog").bsDialogSelect('close');
                        $("#signWFDialog").bsDialogSelect('close');
                        $("#orgTreeDialog").bsDialogSelect('close');
                    }
                    msgDialog("新增成功", false);
                });

                
            }else{
                msgDialog(rs.Message || rs.errMsg, true);
            }
            $.unblockUI();
        },
    };
    $(putFormArea).ajaxSubmit(options);
}

// 儲存收文確認事項
function saveReferenceCheckItemData(sendObj, modifyItem, putFormArea, isFinish){
    
    var method = "setReferenceHandlingInsert";
    var processURL = wrsUrl;
    var fileUpload = false;

    if( $(putFormArea).find("input:file").length > 0){
        processURL = wrsAPI + "uploaderAPI";
        method = "setReferenceHandlingDocInsert"
    }

    var changeJson = false;

    if(fileUpload){
        uploadBlockInfo();
        changeJson = true;
    }else{
        $.blockUI();
    }

    var sendData = {
        api: referenceAPI + method,
        data: sendObj,
        changeJson: changeJson,
        sendJsonIndex: "jsonString",
        sysCode: sys_code
    };
    
    var options = {
        url: processURL,
        type:"POST",
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");
          
        },
        success: function(rs) {
            if(isFinish){
                // 完成事項
                finishReferenceAndCalendar(sendObj.uid, modifyItem);
            }else{
                if(rs.status){
                    $("#insertDialog").bsDialog("close");
                }else{
                    msgDialog(rs.Message);
                }
            }
            $.unblockUI();
            // console.log(rs);
        },
    };
    $(putFormArea).ajaxSubmit(options);
}

// 完成收文事項
function finishReferenceAndCalendar(uid, modifyItem){
    $.blockUI();
    var sendData = {
        api: referenceAPI + "setReferenceWorkStatus",
        data:{
          "uid": uid,
          "status": 1
        }
    }
    $.post(wrsUrl, sendData, function(rs){
        var rs = $.parseJSON(rs);
        if(rs.status){
            renewListData(modifyItem, uid, false);
        }else{
            msgDialog(rs.Message);
        }
        $.unblockUI();
    });
}

// 公告事項
function referenceToAnnouncement(uid, modifyItem){
    $.blockUI();
    var sendData = {
        api: referenceAPI + "setReferenceWorkStatus",
        data:{
          "uid": uid,
          "status": 2,
          userId:userID
        }
    }
    $.post(wrsUrl, sendData, function(rs){
        var rs = $.parseJSON(rs);
        if(rs.status){
            renewListData(modifyItem, uid, false);
        }else{
            msgDialog(rs.Message);
        }
        $.unblockUI();
    });
}

// 發文審核儲存
function sendDocCheckSave(sendData, modifyObj, modifyItem, isPass){
    // console.log(modifyObj);
    // return;
    var method = "setDispatchPass";
    var msg = "通過「"+modifyObj.docNumber+"」文件";
    if(!isPass){
        method = "setDispatchBack";
        msg = "「"+modifyObj.docNumber+"」退件成功";
    }else if(isPass == 12){
        msg = "「"+modifyObj.docNumber+"」作廢成功";
    }
    // var sendData = {
    //     api: waDrfAPI + method,
    //     data:sendData
    // };
    var sendData = {
        api: "ApdData/Verify_ApdData",
        data:sendData,
        threeModal: true
    };

    $.post(wrsUrl, sendData).done(function(rs){
        var rs = $.parseJSON(rs);
        if(rs.Status){
            // 有權限處理的資料
            var docIDStr = sendDocIDStr;

            var sendData = {
                api : "ApdData/GetApdData_ProcessDoc",
                threeModal: true,
                data:{
                    docID: docIDStr,
                    userID: userID
                }
            }

            $.post(wrsUrl, sendData, function(pdDatas){
                pdDatas = $.parseJSON(pdDatas);
                if(pdDatas.Status){
                    processDocData = pdDatas.Data;
                }

                $("#sendDocCheckDialog").bsDialog("close");
                $("#sendDocViewDialog").bsDialog("close");
                msgDialog(msg, false);
                if(modifyItem != undefined){
                    if(isPass == 12 || !isPass){
                        modifyItem.remove();
                    }else{
                        renewListData(modifyItem, modifyObj);
                    }
                }else{
                    getData();
                }
            });
        }else{
            msgDialog(rs.Message || rs.errMsg || rs.msg);
        }
        $.unblockUI();
    });
}

// 擬文用印檔案上傳
function sendDocFileUploadSave(modifyObj,modifyItem){
    var method = "setDispatchResponse";
    var form = $("#sendDocFileUploadDialog").find("#uploadFile");

    var sendData = {
        api: waDrfAPI + method,
        data: {
          "uid": modifyObj.uid,
          "sys_code_id": sys_code,
          "user_id": userID,
          "user_name": userLoginInfo.userName,
        },
        changeJson: true,
        sendJsonIndex: "jsonString",
        sysCode: sys_code
    };

    uploadBlockInfo();
    
    var options = {
        url: wrsAPI + "uploaderAPI",
        type:"POST",
        data: sendData,
        dataType:"JSON",
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");
          
        },
        success: function(rs) {
            if(rs.status){
                // 有權限處理的資料
                var docIDStr = sendDocIDStr;
                var sendData = {
                    api : "ApdData/GetApdData_ProcessDoc",
                    threeModal: true,
                    data:{
                        docID: docIDStr,
                        userID: userID
                    }
                }

                $.post(wrsUrl, sendData, function(pdDatas){
                    pdDatas = $.parseJSON(pdDatas);
                    if(pdDatas.Status){
                        processDocData = pdDatas.Data;
                    }
                    otherProcessDocData = $.grep(otherProcessDocData, function(v,i){
                        if(v != modifyObj.uid){
                            return v;
                        }
                    });
                    renewListData(modifyItem, modifyObj.uid, false);
                    $("#sendDocFileUploadDialog").bsDialog("close");
                });
            }else{
                msgDialog(rs.Message);
            }
            $.unblockUI();
            
            // console.log(rs);
        },
    };
    $(form).ajaxSubmit(options);
}

// 部門退回收文
function orgReferenceBack(modifyObj,modifyItem){
    $.blockUI();
    var sendData = {
        api: referenceAPI+"setReferenceOfficeBack?uid="+modifyObj.uid,
        // data:{
        //   "uid": modifyObj.uid,
        //   // "officeId": userLoginInfo.orgid
        // }
    };

    $.post(wrsUrl, sendData, function(rs){
        rs = $.parseJSON(rs);
        if(rs.status){
            renewListData(modifyItem, modifyObj.uid, false);
        }else{
            msgDialog(rs.Message||"退回失敗");
        }
        $.unblockUI();
    });
}