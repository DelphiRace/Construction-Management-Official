// 字號管理
function prefixViewDialog(){
    $("#prefixViewDialog").remove();
    var prefixViewDialog = $("<div>").prop("id","prefixViewDialog");
    prefixViewDialog.appendTo("body");

    var dialogContents = $("<div>").addClass("contents");
    dialogContents.appendTo( prefixViewDialog );
    
    $.blockUI();

    prefixViewDialog.bsDialog({
        title: "擬文字號管理",
        autoShow: true,
        start: prefixViewStart(prefixViewDialog),
        button:[
            {
                text: "關閉",
                className: "pull-left",
                click: function(){
                    prefixViewDialog.bsDialog("close");
                }
            },
            {
                text: "新增字號",
                className: "btn-info",
                click: function(){
                    insertPrefix();
                }
            }
        ],
        // showFooterBtn: false
    });

   
}

// 字號管理開啟的動作要做的事情
function prefixViewStart(prefixViewDialog){
    var option = {styleKind:"received-issued",style:"prefix-list"};
    getStyle(option,function(listPage){
        getPrefixData(null, function(rs){
            var dialogContents = prefixViewDialog.find(".contents");
            // console.log(rs.data[0]);
            if(rs.Status){
                $.each(rs.Data, function(i, content){
                    var listPageObj = $.parseHTML(listPage);
                    pushPrefixData(dialogContents, listPageObj, content);
                });
                dialogContents.find(".dataContents").last().removeClass("list-items-bottom");
            }else{
                putEmptyInfo( dialogContents );
            }
            $.unblockUI();
        });
    });
        
    
}

function insertPrefix(modifyObj, modifyItem){
    var title = "新增擬文字號";
    var btnName = "新增";
    if(modifyObj == undefined){
        modifyObj = null;
    }else{
        title = "修改擬文字號";
        btnName = "修改";
    }

    $("#insertPrefixDialog").remove();
    var insertPrefixDialog = $("<div>").prop("id","insertPrefixDialog");
    insertPrefixDialog.appendTo("body");

    $.blockUI();

    insertPrefixDialog.bsDialog({
        title: title,
        autoShow: true,
        start: insertPrefixStart(modifyObj, insertPrefixDialog),
        button:[
            {
                text: btnName,
                className: "btn-success",
                click: function(){
                    var option = {
                        success: function(sendObj){
                            
                            sendObj.sys_code = sys_code;
                            // console.log(sendObj);
                            if(modifyObj != null){
                                sendObj.uid = modifyObj.uid;
                            }
                            savePrefix(sendObj, modifyItem);
                            insertPrefixDialog.bsDialog("close");
                        }
                    };
                    checkInputEmpty(insertPrefixDialog,option);
                    
                }
            }
        ],
        // showFooterBtn: false
    });
}

// 字號管理開啟的動作要做的事情
function insertPrefixStart(modifyObj, insertPrefixDialog){
    console.log(modifyObj);
    var option = {styleKind:"received-issued",style:"prefix-insert"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        if(modifyObj != null){
            $(insertPageObj).find("#name").val(modifyObj.name);
        }

        $(insertPageObj).appendTo( insertPrefixDialog.find(".modal-body") );

        $.unblockUI();
    });
}

// 儲存
function savePrefix(sendObj, modifyItem){
    var method= "Insert_PlPrefix";
    if(sendObj.uid != undefined){
        method= "Update_PlPrefix";
    }
    var sendData = {
        api: prefixAPI + method,
        threeModal: true,
        data:sendObj
    }

    $.post(wrsUrl, sendData, function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            getPrefixData(rs.NewID, function(prefixRs){
                if(rs.Status){
                    // 新增
                    if(sendObj.uid == undefined){
                        var option = {styleKind:"received-issued",style:"prefix-list"};
                        getStyle(option,function(listPage){
                            if( $("#prefixViewDialog").find(".dataContents").length){
                                $("#prefixViewDialog").find(".dataContents").last().addClass("list-items-bottom");
                            }else{
                                $("#prefixViewDialog").find(".data-empty").remove();
                            }
                            var listPageObj = $.parseHTML(listPage);
                            $(listPageObj).removeClass("list-items-bottom");

                            var putArea = $("#prefixViewDialog").find(".contents");
                            pushPrefixData(putArea, listPageObj, prefixRs.Data);
                           
                        });
                    }else{
                        sendObj.is_use = 0;
                        pushPrefixData(null, $(modifyItem), sendObj);
                    }                    
                   
                }
            });
            
        }else{
            msgDialog(rs.msg);
        }
    });
}

// 取資料
function getPrefixData(uid, callBack){
    var sendData = {
        api: prefixAPI + "GetData_PlPrefix",
        threeModal:true,
        data:{
            sys_code: sys_code
        }
    };
    if(uid != undefined || uid != null){
        sendData.data.iUid = uid;
    }
    $.getJSON(wrsUrl, sendData).done(function(rs){
        callBack(rs);
    });
}

// 放資料
function pushPrefixData(putArea, listObj, content){
    $(listObj).find("#name").text(content.name);

    if(parseInt(content.is_use) == 1){
        $(listObj).find(".fa-trash-o").remove();
    }

    // 修改
    $(listObj).find(".fa-pencil-square-o").unbind("click").click(function(){
        insertPrefix(content, $(listObj));
    });

    // 刪除
    $(listObj).find(".fa-trash-o").unbind("click").click(function(){
        deletePrefixData(content.uid, listObj, putArea);
    });
    if(putArea != null || putArea != undefined){
        $(listObj).appendTo( putArea );
    }
}

// 刪除
function deletePrefixData(uid, modifyItem, putArea){
    var sendData = {
        // api: calendarAPI+"RemoveToDoFiles",
        api: prefixAPI+"Delete_PlPrefix",
        data:{
            uid: uid,
        },
        threeModal: true
    };
    $.ajax({
        url: wrsUrl,
        type: "DELETE",
        data: sendData,
        success: function(rs){
            var rs = $.parseJSON(rs);
            if(!rs.Status){
                msgDialog(rs.msg||"刪除失敗");
            }else{
                $(modifyItem).remove();
                if(!putArea.find(".dataContents").length){
                    putEmptyInfo(putArea);
                }else{
                    putArea.find(".dataContents").last().removeClass("list-items-bottom");
                }
            }
            
        }
    });
}