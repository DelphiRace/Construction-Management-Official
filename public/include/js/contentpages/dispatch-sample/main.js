var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
var saveVer;
var listID;
if(userLoginInfo.isAdmin){
    saveVer = 1;
    listID = 1;
}else{
    saveVer = 2;
    listID = 2;
    $("#totalTab").find("#total").parent().remove();
    $("#totalTab").find("#personal").parent().addClass("active");
}

$(function(){
    tabContentCtrl($("#totalTab"));
    getData(listID);
    $("#personal").click(function(){
        getData(2);
        saveVer = 2;
    });
    $("#total").click(function(){
        getData();
        saveVer = 1;
    });
});

function getData(lID){
    if(lID == undefined){
        lID = 1
    }else{
        listID = lID;
    }

    $("#totalContent").find(".dataContent").remove();
    $("#totalContent").find(".data-empty").remove();

    var sendData = {
        api: dispatchAPI+"getTtmplateList",
        data:{
            sys_code_id: sys_code,
            user_id: userID,
            list_id: lID
        }
    };
    getPageListData(sendData, function(rs){
        if(rs.status && rs.data != null){
            putDataToPage(rs.data, $("#totalContent"));
        }else{
            putEmptyInfo($("#totalContent"));
        }
    });
}


// 放資料
function putDataToPage(data, putArea, onlyData){
    if(typeof onlyData == "undefined"){
        onlyData = false;
    }
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"dispatch-sample",style:"list"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        
        $.each(data, function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            putDataOption(putArea, pageStyleObj, content);
        });
        putArea.find(".dataContent").last().removeClass("list-items-bottom");
    });
}

// 放入資料與建置功能
function putDataOption(putArea, pageStyleObj, content, putBefore){
    if(putBefore == undefined){
        putBefore = false;
    }
    $(pageStyleObj).addClass("dataContent");

    // 標題
    $(pageStyleObj).find(".list-items").eq(0).html(content.subject);

    // 類別
    $(pageStyleObj).find(".list-items").eq(1).text(content.big_type_name);

    // 類型
    $(pageStyleObj).find(".list-items").eq(2).text(content.type_name);
    

    // 修改
    $(pageStyleObj).find(".fa-pencil-square-o").unbind("click").click(function(){
        insertDialog( content, $(pageStyleObj) );
    });

    // 刪除
    $(pageStyleObj).find(".fa-trash-o").unbind("click").click(function(){
        deleteData(content, $(this).parents(".list-items").parent());
    });
    if($(putArea).find(".data-empty").length){
        $(putArea).find(".data-empty").remove();
        $(pageStyleObj).appendTo(putArea);
    }else{
        if(putArea != null && !putBefore){
            $(pageStyleObj).appendTo(putArea);
        }else{
            if(putArea != null && putBefore){
                $(putArea).before(pageStyleObj);
            }
        }
    }
}

// 新增&修改Dialog
function insertDialog(modifyObj, modifyItem){
    // console.log(modifyObj);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(modifyObj != undefined){
        title = "修改範本";
        saveBtn = "修改";
    }else{
        title = "新增範本";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: title,
        autoShow: true,
        start: function(){
          var option = {styleKind:"dispatch-sample",style:"insert"};
          getStyle(option,function(insertPage){
            
                var insertPageObj = $.parseHTML(insertPage);
                
                var categoryPutArea = $(insertPageObj).find("#category");
                categoryPutArea.empty();
                // 修改
                if(modifyObj != undefined){
                    // 事項
                    $(insertPageObj).find(".list-items").eq(0).find("input:text").val(modifyObj.subject);
                    if(modifyObj.explanation){
                        var string = $.parseHTML(modifyObj.explanation);
                        $(insertPageObj).find("#explanation").val(string[0].data);
                    }
                    var setOption = {
                        sampleCategoryID: modifyObj.big_type_uid
                    };

                    getSampleListData(categoryPutArea, null, setOption);
                }else{
                    // 
                    getSampleListData(categoryPutArea);
                    
                }
                
                // 類別、類型
                $(insertPageObj).find("#category").change(function(){
                    var sampleTypePutArea = $(insertPageObj).find("#typeid");
                    var setOption;
                    if(modifyObj != undefined){
                        var setOption = {
                            sampleTypeID: modifyObj.type_uid
                        };
                    }
                    getSampleListData(sampleTypePutArea, $(this).val(), setOption);
                });

                // 類別重整鈕
                $(insertPageObj).find("#categoryRefresh").click(function(){
                    categoryPutArea.empty();
                    getSampleListData(categoryPutArea);
                });

                // 類型重整鈕
                $(insertPageObj).find("#typeRefresh").click(function(){
                    var categoryVal = $(insertPageObj).find("#category").val();
                    var sampleTypePutArea = $(insertPageObj).find("#typeid");
                    getSampleListData(sampleTypePutArea, categoryVal);

                });

                $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));
                // 說明或內容
                $("#insertDialog").find("#explanation").ckeditor();
          });
        },
        button:[
            // {
            //     text: "取消",
            //     className: "btn-default-font-color",
            //     click: function(){
            //         $("#insertDialog").bsDialog("close");
            //     }
            // },
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var sendObj = getUserInput("insertDialog");

                    var isEmptyInput = false;
                    $.each(sendObj, function(i, content){
                        
                        if(!$.trim(content)){
                            if(i != "explanation"){
                                $("#insertDialog").find("#"+i).addClass("item-bg-danger");
                            }else{
                                if(!$("#insertDialog").find("#"+i).parent().find(".contentEmpty").length){
                                    var msg = $("<div>").addClass("col-xs-12 col-md-12 item-bg-danger contentEmpty").text("下方內容不可為空");
                                    $("#insertDialog").find("#"+i).before(msg);
                                }
                            }
                            isEmptyInput = true;
                            // console.log(i, content);
                        }
                        
                    });

                    // console.log(sendObj);
                    // return;
                    
                    if(!isEmptyInput){
                        sendObj.user_id = userID;
                        sendObj.sys_code_id = sys_code;
                        sendObj.type = saveVer;
                        if(modifyObj != undefined){
                            sendObj.uid = modifyObj.uid;
                        }
                        saveData(sendObj, modifyItem);
                        if(modifyObj == undefined){
                            $("#total-content").find(".data-empty").remove();
                        }
                    }
                    // console.log(sendObj);
                }
            }
            
        ]
    });

}

// 儲存
function saveData(sendObj, modifyItem){
    // console.log(sendObj);
    // return;
    $.blockUI();
    var method;
    var type;
    if(sendObj.uid != undefined){
        method = "setTemplateUpdate";
        type = "POST";
    }else{
        method = "setTemplateInsert";
        type = "POST";
    }
    var sendData ={
        api: dispatchAPI+method,
        data: sendObj,
    };
    // return;
    $.ajax({
        url: wrsUrl,
        data: sendData,
        type: type,
        dataType: "JSON",
        success: function(rs){
            // console.log(rs);
            // return;
            if(rs.status){
                getUidData(rs.uid, function(pageStyle, data){
                    var pageStyleObj = $.parseHTML(pageStyle);
                    var putBefore = true;
                    $(pageStyleObj).addClass("dataContent");
                    var putArea = $("#totalContent").find(".dataContent").eq(0);
                    if(!putArea.length){
                        putArea = $("#totalContent");
                        putBefore = false;
                    }
                    if(modifyItem != undefined){
                        putArea = null;
                        pageStyleObj = modifyItem;
                    }
                    putDataOption(putArea, pageStyleObj, data, putBefore);
                    if(putArea != null){
                        $(putArea).find(".dataContent").last().removeClass("list-items-bottom");
                    }
                    $.unblockUI();
                });
                $("#insertDialog").bsDialog("close");

            }else{
                msgDialog(rs.Message || rs.errMsg);
            }
        }
    });
}

// 取得單筆資料
function getUidData(uid, callback){
    var sendData = {
        api: dispatchAPI+"getTtmplateList",
        data:{
            sys_code_id: sys_code,
            user_id: userID,
            list_id: listID,
            uid: uid
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.status && rs.data != null){
            // 畫面設定值
            var option = {styleKind:"dispatch-sample",style:"list"};
            // 取得畫面樣式
            getStyle(option,function(pageStyle){
                callback(pageStyle, rs.data[0]);
            });
        }else{
            getData(listID);
        }
    });
}

function deleteData(content, removeArea){
    // console.log(content);
    // return;
    var sendData = {
        api: dispatchAPI+"deleteTemplate",
        data:{
            uidList: content.uid
        }
    };
    $.ajax({
        url: wrsUrl,
        type: "DELETE",
        data: sendData,
        success: function(rs){
            var rs = $.parseJSON(rs);
            if(!rs.status){
                msgDialog(rs.errMsg || rs.Message);
            }else{
                msgDialog("「"+content.subject+"」刪除成功");
                $(removeArea).remove();
                if( $("#totalContent").find(".dataContent").length){
                    $("#totalContent").find(".dataContent").last().removeClass("list-items-bottom");
                }else{
                     putEmptyInfo($("#totalContent"));
                }
            }
            
        }
    });
}

// 類別
function getSampleListData(putArea, sampleCategoryID, setOption){
    var sendObj = {
        api: typeAPI + "getDocTypeList",
        data: {
            code_id: sys_code
        }
    };

    var str = "未有類別";
    // 取類別列表
    if(sampleCategoryID != undefined && sampleCategoryID != null){
        sendObj.data.fid = sampleCategoryID;
        putArea.empty();
        str = "未有類型";
    }

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            $.each(rs.data, function(i, v){
                selectOptionPut(putArea, v.uid, v.name);
            });
            if(setOption != undefined){
                if(setOption.sampleTypeID != undefined){
                    // 選單預設值
                    putArea.val(setOption.sampleTypeID);
                }
                if(setOption.sampleCategoryID != undefined){
                    // 選單預設值
                    putArea.val(setOption.sampleCategoryID);
                }
            }
            // console.log(sampleCategoryID, sampleTypeID);
            putArea.change();
        }else{
            selectOptionPut(putArea, "", str);
        }
    });
}


// 錯誤訊息
function errorDialog(msg){
    $("#errorDialog").remove();
    $("<div>").prop("id","errorDialog").appendTo("body");

    $("#errorDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        title: "錯誤",
        start:function(){

            var msgDiv = $("<div>").html(msg);
            $("#errorDialog").find(".modal-body").append(msgDiv);
        },
        button:[{
            text: "關閉",
            className: "btn-danger",
            click: function(){
                $("#errorDialog").bsDialog("close");
            }
        }
        ]
    });
}