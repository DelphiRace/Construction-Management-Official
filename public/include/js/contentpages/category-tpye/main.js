var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;
// 新增類型若為1: 類別，2:類型
var insertType = 1;

$(function(){
    tabContentCtrl($("#totalTab"));
    getData(insertType);
    $("#totalTab").find("#type").click(function(){
        insertType = 1;
        getData(insertType);
    });
    $("#totalTab").find("#category").click(function(){
        insertType = 2;
        getData(insertType);
    });
    $("#typeSelect").change(function(){
        var selectVal = $(this).val();
        getData(insertType, selectVal, false);
    });
    // 類別重整鈕
    $("#typeRefresh").click(function(){
        pageCategoryList();
    });
    
});


function getData(insertType, typeID, selectRefresh){
    if(selectRefresh == undefined){
        selectRefresh = true;
    }
    $("#totalContent").find(".dataContent").remove();
    $("#totalContent").find(".data-empty").remove();

    var sendData = {
        api: typeAPI+"getDocTypeList",
        data:{
            code_id: sys_code,
        }
    };
    if(insertType == 2){
        if(typeID != undefined){
            sendData.data.fid = typeID;
        }else{
            sendData.data.fid = -1;
        }
        $("#category-help,.categoryPage").show();
        if(selectRefresh){
            pageCategoryList();
        }
    }else{
        $("#category-help,.categoryPage").hide();
    }
    
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
    var style = "list";
    // 畫面設定值
    if(insertType == 2){
        style = "category-list";
    }
    var option = {styleKind:"category-tpye",style:style};

    
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

    var categoryString = content.name;
    // 標題
    $(pageStyleObj).find(".list-items").eq(0).html(categoryString);
    

    if(insertType == 2){
        // 類型/類別
        $(pageStyleObj).find(".list-items").eq(1).text(content.fname);
    }

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
    var helpTxt = (insertType == 1) ? "類別":"類型";
    if(modifyObj != undefined){
        title = "修改"+helpTxt;
        saveBtn = "修改";
    }else{
        title = "新增"+helpTxt;
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: title,
        autoShow: true,
        start: function(){
            var style = "type-insert";
            // 畫面設定值
            if(insertType == 2){
                style = "category-insert";
            }
            var option = {styleKind:"category-tpye",style:style};
            getStyle(option,function(insertPage){
            
                var insertPageObj = $.parseHTML(insertPage);
                if(insertType == 2){
                    var putArea = $(insertPageObj).find("#type");
                    if(modifyObj != undefined){
                        var setOption = {
                            sampleTypeID: modifyObj.fid
                        }
                        getSampleListData(putArea, setOption);

                    }else{
                        getSampleListData(putArea);
                    }
                }
                // 修改
                if(modifyObj != undefined){
                    // 事項
                    $(insertPageObj).find("#name").val(modifyObj.name);
                }

                $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));
            
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
                            }
                            isEmptyInput = true;
                            // console.log(i, content);
                        }
                        
                    });
                    

                    if(!isEmptyInput){
                        if(insertType == 1){
                            sendObj.fid = 0;
                        }else{
                            sendObj.fid = sendObj.type;
                        }
                        if(modifyObj != undefined){
                            sendObj.uid = modifyObj.uid;
                        }
                        sendObj.code_id = sys_code;
                        // console.log(sendObj);
                        // return;
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

    var method;
    var type;
    if(sendObj.uid != undefined){
        method = "setDocTypeUpdate";
        type = "POST";
    }else{
        method = "setDocTypeInsert";
        type = "POST";
    }
    var sendData ={
        api: typeAPI+method,
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
                var fid = (sendObj.fid == 0) ? 0 : -1; 
                getUidData(rs.uid, fid, function(pageStyle, data){
                    var pageStyleObj = $.parseHTML(pageStyle);
                    $(pageStyleObj).addClass("dataContent");
                    var putArea = $("#totalContent").find(".dataContent").eq(0);
                    if(!putArea.length){
                        putArea = $("#totalContent");
                    }
                    if(modifyItem != undefined){
                        putArea = null;
                    }
                    putDataOption(putArea, pageStyleObj, data, true);
                    if(putArea != null){
                        $(putArea).find(".dataContent").last().removeClass("list-items-bottom");
                    }
                });
                $("#insertDialog").bsDialog("close");
            }else{
                msgDialog(rs.Message || rs.errMsg);
            }
        }
    });
}

// 點選類別後，更新頁面上方的類型選單
function pageCategoryList(){
    var sendData = {
        api: typeAPI+"getDocTypeList",
        data:{
            code_id: sys_code
        }
    };
    
    $.getJSON(wrsUrl, sendData).done(function(rs){
        var putArea = $("#typeSelect");
        putArea.empty();
        selectOptionPut(putArea, -1, "全部");

        if(rs.status && rs.data != null){
            $.each(rs.data, function(i,v){
                selectOptionPut(putArea, v.uid, v.name);
            });
        }
    });
}

// 取得單筆資料
function getUidData(uid, fid, callback){
    var sendData = {
        api: typeAPI+"getDocTypeList",
        data:{
            code_id: sys_code,
            uid: uid,
            fid: fid
        }
    };

    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.status && rs.data != null){
            var style = "list";
            if(insertType == 2){
                style = "category-list";
            }
            // 畫面設定值
            var option = {styleKind:"category-tpye",style:style};
            // 取得畫面樣式
            getStyle(option,function(pageStyle){
                callback(pageStyle, rs.data[0]);
            });
        }else{
            getData(insertType);
        }
    });
}

function deleteData(content, removeArea){
    // console.log(content);
    // return;
    var sendData = {
        api: typeAPI+"deleteDocTypeDelete",
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
                msgDialog("「"+content.name+"」刪除成功");
                $(removeArea).remove();
                if($("#totalContent").find(".dataContent").length){
                    $("#totalContent").find(".dataContent").last().removeClass("list-items-bottom");
                }else{
                    putEmptyInfo($("#totalContent"));
                }
            }
            
        }
    });
}

// 類別
function getSampleListData(putArea, setOption){
    var sendObj = {
        api: typeAPI + "getDocTypeList",
        data: {
            code_id: sys_code
        }
    };

    var str = "未有類別";

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
            }
        }else{
            selectOptionPut(putArea, "", str);
        }
    });
}
