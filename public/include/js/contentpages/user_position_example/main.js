$(function(){
    getOUData();
});
var meunData;
var treeView;
// 取得資料
function getOUData(uid){
    getMenuData();
    loader($("#grid"));
    if(uid != undefined){
        data = { iUid : uid };
    }else{
        data = {};
    }
    var sendData = {
        api: ctrlAuthorityAPI+"GetData_AssBaseGroupMenu",
        data: data
    }
    
    // ＡＰＩ呼叫
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        // console.log(rs);
        $("#grid").empty();
        if(rs.Status){
            putDataToPage(rs.Data);
        }else{
            // 放入空的
            putEmptyInfo($("#grid"));
        }
        // console.log(rs);
    }).fail(function(){
        // 放入空的
        putEmptyInfo($("#grid"));
    });
}

function getMenuData(){
    var sendData = {
        api: ctrlAuthorityAPI+"GetData_AssTypeGroup",
        data: {}
    }
    
    // ＡＰＩ呼叫
    $.getJSON( wrsAPI + "menuAPI/userMenuPositionList" ).done(function(rs){
        console.log(rs);
        if(rs.status){

            var options = {
                idName: "uid",
                title: "memo"
            }

            meunData = processTreeDataOnly(rs.data,options);

            treeView = $("#treeArea").treeView({
                data: meunData[0],
                expansion: false,
                expansionLevel: 1
            });
            // console.log(meunData);
        }
    });
}

function test(){
    console.log(treeView.selected());
}

// 放資料
function putDataToPage(data, onlyData){
    if(typeof onlyData == "undefined"){
        onlyData = false;
    }
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"list",style:"3grid-modify"};
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
                // 附屬說明
                $(pageStyleObj).find(".list-items").eq(2).html(content.gpname);
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
            $(pageStyleObj).find(".list-items").eq(2).html(data.gpname);

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
        title = "修改群組範本類別";
        saveBtn = "修改";
    }else{
        title = "新增群組範本類別";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title:title,
        start: function(){
          var option = {styleKind:"group_example",style:"group_example_insert"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            // 第一格是名字
            $(insertPageObj).find(".list-items").eq(0).find(".control-label").text("範本名稱");
            var nameArea = $(insertPageObj).find(".list-items").eq(0).find("input:text").addClass("userInput").prop("id","name");

            // 第二格是備註
            $(insertPageObj).find(".list-items").eq(1).find(".control-label").text("範本備註");
            var remarkArea = $(insertPageObj).find(".list-items").eq(1).find("input:text").addClass("userInput").prop("id","remark");
            
            // 第三格是
            $(insertPageObj).find(".list-items").eq(2).find(".control-label").text("使用類別");
            var selectArea = $(insertPageObj).find(".list-items").eq(2).find("select");

            if(groupData != undefined){
                $.each(groupData, function(index, content){
                    selectOptionPut( selectArea, content.uid, content.name);
                });
            }

            if(modifyItem != undefined){
                nameArea.val(modifyItem.name);
                remarkArea.val(modifyItem.remark);
                selectArea.val(modifyItem.groupid);
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
                    data.gpname = $("#insertDialog").find("#groupid :selected").text();
                    var isNull = false;
                    $.each(data,function(i,v){
                        if($.trim(v) == ""){
                            isNull = true;
                        }
                    });
                    if(!isNull){
                        saveData(data,clickObject);
                        $("#insertDialog").bsDialog("close");
                    }
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

    var processAPI = "Insert_AssBaseGroup";

    if(data.uid != undefined){

        processAPI = "Update_AssBaseGroup";

        clickObject.parents(".dataContent").find(".list-items").eq(0).text(data.name);
        clickObject.parents(".dataContent").find(".list-items").eq(1).text(data.remark);
        clickObject.parents(".dataContent").find(".list-items").eq(2).text(data.gpname);
        clickObject.unbind("click").click(function(){
            insertDialog(data.uid, data, $(this));
        });

    }

    var sendData = {
        api:ctrlAuthorityAPI + processAPI,
        data:data
    };
    // console.log(data);
    // console.log(sendData);
    $.post(wrsUrl, sendData,function(rs){
        rs = $.parseJSON(rs);
        console.log(rs);
        // 新增
        if(data.uid == undefined){
            data.uid = rs.Data;
            putDataToPage(data, true);
        }
    });

}

// 刪除
function deleteData(uid, removeItem, name){
    var sendData = {
        apiMethod: ctrlAuthorityDelAPI + "Delete_AssBaseGroup",
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