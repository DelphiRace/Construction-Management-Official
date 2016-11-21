$(function(){
    getOUData();
});
var groupData;
var treeView;
var positonData;
// 取得資料
function getOUData(uid){
    $.blockUI({
        message: "Loading..."
    });
    getGroupData();
    getPositionList();

    loader($("#grid"));
    if(uid != undefined){
        data = { iUid : uid };
    }else{
        data = {};
    }
    var sendData = {
        // api: ctrlAuthorityAPI+"GetData_AssBaseGroup",
        api: ctrlAuthorityAPI+"BPS_GetData_AssBaseGroupAuthority",
        data: data
    }
    getPageListData(sendData, function(rs){
        $("#grid").empty();
        if(rs.Status){
            putDataToPage(rs.Data);

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

function getGroupData(){
    var sendData = {
        api: ctrlAuthorityAPI+"GetData_AssTypeGroup",
        data: {}
    }
    
    // ＡＰＩ呼叫
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        if(rs.Status){
            groupData = rs.Data;
        }
    });
}

function getPositionList(){
    $.getJSON( wrsAPI + "menuAPI/userMenuPositionList",{"bpsID":true} ).done(function(rs){
        // console.log(rs);
        if(rs.status){
            var options = {
                idName: "uid",
                title: "memo",
            };
            positonData = processTreeDataOnly(rs.data,options);
            positonData = positonData[0];
            $.unblockUI();
        }   
    });
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
                var thisData = content.stAssBaseGroup;
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).addClass("dataContent");
                // 名稱
                $(pageStyleObj).find(".list-items").eq(0).html(thisData.name);
                // 附屬說明
                $(pageStyleObj).find(".list-items").eq(1).html(thisData.remark);
                // 附屬說明
                var gpname = "無所屬類別";
                if(thisData.gpname){
                    gpname = thisData.gpname;
                }
                $(pageStyleObj).find(".list-items").eq(2).html(gpname);
                // console.log(thisData);
                // 修改
                $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                    insertDialog(thisData.uid, content, $(this));
                });

                // 刪除
                $(pageStyleObj).find(".fa-trash-o").click(function(){
                    deleteData(thisData.uid, $(this).parents(".list-items").parent(), thisData.name);
                });

                $(pageStyleObj).appendTo($("#grid"));

            });
        }else{
            // console.log(data);
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");
            
            $(pageStyleObj).find(".list-items").eq(0).html(data.stAssBaseGroup.name);
            $(pageStyleObj).find(".list-items").eq(1).html(data.stAssBaseGroup.remark);
            $(pageStyleObj).find(".list-items").eq(2).html(data.stAssBaseGroup.gpname);

            // 修改
            $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                insertDialog(data.stAssBaseGroup.uid, data, $(this));
            });

            // 刪除
            $(pageStyleObj).find(".fa-trash-o").click(function(){
                deleteData(data.stAssBaseGroup.uid, $(this).parents(".list-items").parent(), data.stAssBaseGroup.name);
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
        title = "修改群組權限模組";
        saveBtn = "修改";
    }else{
        title = "建立群組權限模組";
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

            // 放入
            $(insertPageObj).appendTo( $("#insertDialog").find(".modal-body") );
            
            if(modifyItem != undefined){
                nameArea.val(modifyItem.stAssBaseGroup.name);
                remarkArea.val(modifyItem.stAssBaseGroup.remark);
                selectArea.val(modifyItem.stAssBaseGroup.groupid);
                
            }

            var treeArea = $('<div>').prop("id","treeArea");
            treeArea.appendTo( $("#insertDialog").find(".modal-body") );
            
            treeView = $(treeArea).treeView({
                data: positonData,
                checkbox:true,
                selectedRturnDataIndex:"bpsID",
                // selectedData: "1,2,3,4,5,6"
            });
            
            if(modifyItem != undefined){
                if(modifyItem.stAssBaseGroup.groupid != undefined){
                    var positionStr = "";
                    $.each(modifyItem.stAssBaseGroupMenu, function(pIndex,pValue){
                        positionStr += pValue.mid + ",";
                    });
                    // console.log(positionStr);
                    if(positionStr.length){
                        positionStr = positionStr.substring(0,positionStr.length - 1);
                    }else{
                        positionStr = null;
                    }
                    treeView.reload({
                        selectedData: positionStr
                    });
                }
            }
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
                    var selectedPositon = treeView.selected();
                    // console.log(selectedPositon);
                    var PositonArr = [];
                    if(selectedPositon){
                        var selectedPositonArr = selectedPositon.split(",");
                        
                        $.each(selectedPositonArr,function(i,v){
                            var selectPositonData = {};
                            selectPositonData.mid = v;
                            if(uid != undefined){
                                selectPositonData.bgid = uid;
                            }
                            // console.log(selectPositonData);
                            PositonArr.push(selectPositonData);
                        });
                    }
                    
                    // console.log(PositonArr);
                    // return;
                    if($("#insertDialog").find("#groupid").val() != ""){
                        data.gpname = $("#insertDialog").find("#groupid :selected").text();
                    }else{
                        data.gpname = '無所屬類別';
                    }
                    var isNull = false;
                    $.each(data,function(i,v){
                        if($.trim(v) == "" && i != "groupid"){
                            isNull = true;
                        }
                    });

                    data = {
                      "stAssBaseGroup": data,
                      "stAssBaseGroupMenu": PositonArr
                    }

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

    var processAPI = "BPS_Insert_AssBaseGroupAuthority";

    if(data.stAssBaseGroup.uid != undefined){

        processAPI = "BPS_Update_AssBaseGroupAuthority";

        clickObject.parents(".dataContent").find(".list-items").eq(0).text(data.stAssBaseGroup.name);
        clickObject.parents(".dataContent").find(".list-items").eq(1).text(data.stAssBaseGroup.remark);
        clickObject.parents(".dataContent").find(".list-items").eq(2).text(data.stAssBaseGroup.gpname);
        clickObject.unbind("click").click(function(){
            insertDialog(data.uid, data, $(this));
        });

    }

    var sendData = {
        api:ctrlAuthorityAPI + processAPI,
        data:data
    };
    // console.log(JSON.stringify(data));
    // console.log(sendData);
    $.post(wrsUrl, sendData,function(rs){
        rs = $.parseJSON(rs);
        console.log(rs);
        // 新增
        if(data.stAssBaseGroup.uid == undefined){
            data.stAssBaseGroup.uid = rs.Data;
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