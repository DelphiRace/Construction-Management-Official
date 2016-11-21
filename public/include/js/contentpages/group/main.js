$(function(){
    getOUData();
});

// 取得資料
function getOUData(uid){
    loader($("#grid"));
    if(uid != undefined){
        data = { iUid : uid };
    }else{
        data = {};
    }
    var sendData = {
        api: ctrlAuthorityAPI+"GetData_AssTypeGroup",
        data: data
    }
    getPageListData(sendData, function(rs){
    // ＡＰＩ呼叫
        // console.log(rs);
        $("#grid").empty();
        if(rs.Status){
            if(uid == null){
                putDataToPage(rs.Data);
            }else{
                // insertDialog(uid,name);
            }
        }else{
            // 放入空的
            putEmptyInfo($("#grid"));
        }
        // console.log(rs);
    });
    // .fail(function(){
    //     // 放入空的
    //     putEmptyInfo($("#grid"));
    // });
}

// 放資料
function putDataToPage(data, onlyData){
    if(typeof onlyData == "undefined"){
        onlyData = false;
    }
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"list",style:"2grid-modify"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        if(!onlyData){
            $.each(data,function(index,content){
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).addClass("dataContent");
                // 名稱
                $(pageStyleObj).find(".list-items").eq(0).html(content.name);
                // 附屬說明
                $(pageStyleObj).find(".list-items").eq(1).html(content.remark);
                // console.log(content);
                // 修改
                $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                    insertDialog(content.uid, content, $(this));
                });

                // 刪除
                $(pageStyleObj).find(".fa-trash-o").click(function(){
                    deleteData(content.uid, $(this).parents(".list-items").parent(), content.name);
                });

                $(pageStyleObj).appendTo($("#grid"));

            });
        }else{
            // console.log(data);
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");
            
            $(pageStyleObj).find(".list-items").eq(0).html(data.name);
            $(pageStyleObj).find(".list-items").eq(1).html(data.remark);

            // 修改
            $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                insertDialog(data.uid, data, $(this));
            });

            // 刪除
            $(pageStyleObj).find(".fa-trash-o").click(function(){
                deleteData(data.uid, $(this).parents(".list-items").parent(), data.name);
            });

            if($("#grid").find("div").length){
                $("#grid").find(".dataContent").eq(-1).addClass("list-items-bottom").after(pageStyleObj);
            }else{
                $(pageStyleObj).removeClass("list-items-bottom").appendTo("#grid");
            }
        }
        $("#grid").find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}

// 新增&修改Dialog
function insertDialog(uid, modifyItem, clickObject){
    // console.log(modifyItem);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(uid != undefined){
        title = "修改群組類別";
        saveBtn = "修改";
    }else{
        title = "新增群組類別";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title:title,
        start: function(){
          var option = {styleKind:"input",style:"text-help-2kind"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            // 第一格是名字
            $(insertPageObj).find(".list-items").eq(0).find(".control-label").text("群組名稱");
            var nameArea = $(insertPageObj).find(".list-items").eq(0).find("input:text").addClass("userInput").prop("id","name");

            // 第二格是備註
            $(insertPageObj).find(".list-items").eq(1).find(".control-label").text("備註");
            var remarkArea = $(insertPageObj).find(".list-items").eq(1).find("input:text").addClass("userInput").prop("id","remark");
            
            if(modifyItem != undefined){
                nameArea.val(modifyItem.name);
                remarkArea.val(modifyItem.remark);
            }

            // 放入
            $(insertPageObj).appendTo( $("#insertDialog").find(".modal-body") );

          });
        },
        button:[
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var data = getUserInput("insertDialog");
                    if(uid != undefined){
                        data.uid = uid;
                         // console.log(data);
                    }
                   
                    saveData(data,clickObject);
                    $("#insertDialog").bsDialog("close");
                }
            },
            {
                text: "取消",
                className: "btn-default-font-color",
                click: function(){
                    $("#insertDialog").bsDialog("close");
                }
            },
        ]
    });

}

// 儲存
function saveData(data,clickObject){
    var processAPI = "Insert_AssTypeGroup";
    if(data.uid != undefined){
        processAPI = "Update_AssTypeGroup";
        clickObject.parents(".dataContent").find(".list-items").eq(0).text(data.name);
        clickObject.parents(".dataContent").find(".list-items").eq(1).text(data.remark);
        clickObject.unbind("click").click(function(){
            insertDialog(data.uid, data, $(this));
        });
    }
    var sendData = {
        api:ctrlAuthorityAPI + processAPI,
        data:data
    };
    // console.log(data);
    $.post(wrsUrl, sendData,function(rs){
        rs = $.parseJSON(rs);
        // 新增
        if(data.uid == undefined){
            data.uid = rs.Data;
            putDataToPage(data, true);
        }
    });
    // $.post(configObject.WebAPI+"/v201604/ASS/api/ctrlAuthority/Insert_AssTypeGroup", data,function(rs){
    //     console.log(rs);
    // });
}

// 刪除
function deleteData(uid, removeItem, name){
    var sendData = {
        apiMethod: ctrlAuthorityDelAPI + "Delete_AssTypeGroup",
        deleteObj:{
            iUid: uid
        }
    };
    // return;
    $.post(configObject.deleteAPI,sendData,function(rs){
        // console.log(rs);
        rs = $.parseJSON(rs);
        if(rs.Status){
            removeItem.remove();
            if(!$("#grid").find(".dataContent").length){
                var option = {styleKind:"system",style:"data-empty"};
                getStyle(option,function(pageStyle){
                    $("#grid").html(pageStyle);
                });
            }else{
                $("#grid").find(".dataContent").last().removeClass("list-items-bottom");

            }

        }else{
            // 無法刪除
            couldNotDeleteDialog(name);
        }
    });
}

// 當無法刪除時，提供說明
function couldNotDeleteDialog(name){
    $("#couldNotDeleteDialog").remove();
    $("<div>").prop("id","couldNotDeleteDialog").appendTo("body");

    $("#couldNotDeleteDialog").bsDialog({
    start: function(){
        var string = name+" 已被使用，故無法刪除";
        $("#couldNotDeleteDialog").find(".modal-body").html(string);
    },
    button:[
        {
            text: "關閉",
            className: "btn-danger",
            click: function(){
                $("#couldNotDeleteDialog").bsDialog("close");
            }
        }
    ]
    });

}