$(function(){
    getOUData();
});
var groupData;
var groupExampleData;
var treeView;
var groupPositionData;
var positonData;
var suid = 1;
var listPostionData = {};
// 取得資料
function getOUData(uid){
    $.blockUI({
        message: "Loading..."
    });
    getGroupData();
    getPositionList();
    getGroupExampleData();

    loader($("#grid"));
    if(uid != undefined){
        // data = { iUid : uid, iSuid: suid };
        data = { iUid : uid, iSu_Id: suid };
    }else{
        // data = {iSuid: suid};
        data = {iSu_Id: suid};
    }
    var sendData = {
        // api: ctrlAuthorityAPI+"GetData_AssGroup",
        api: ctrlAuthorityAPI+"GetData_AssGroupAuthority",
        data: data
    }
    getPageListData(sendData, function(rs){
    // ＡＰＩ呼叫
        // console.log(rs);
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
        // console.log(rs);
        if(rs.Status){
            groupData = rs.Data;
        }
    });
}

function getGroupExampleData(){
    var sendData = {
        api: ctrlAuthorityAPI+"BPS_GetData_AssBaseGroupAuthority",
        data: {}
    }
    
    // ＡＰＩ呼叫
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        // console.log(rs);
        if(rs.Status){
            var data = {};
            var position = {};
            $.each(rs.Data,function(i,v){
                if(v.stAssBaseGroup != null){
                    data[v.stAssBaseGroup.uid] = v.stAssBaseGroup;
                    if(v.stAssBaseGroupMenu.length){
                        var positionStr = "";
                        $.each(v.stAssBaseGroupMenu, function(pIndex,pContent){
                            positionStr += pContent.mid + ",";
                        });
                        if(positionStr.length){
                            positionStr = positionStr.substring(0,positionStr.length-1);
                        }
                        position[v.stAssBaseGroup.uid] = positionStr;
                    }
                }
            });
            // console.log(data,position);
            groupExampleData = data;
            groupPositionData = position;
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
                // console.log(content.stAssGroup);
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).addClass("dataContent");

                // 名稱
                $(pageStyleObj).find(".list-items").eq(0).html(content.stAssGroup.name);

                // 附屬說明
                $(pageStyleObj).find(".list-items").eq(1).html(content.stAssGroup.remark);

                // 附屬說明
                $(pageStyleObj).find(".list-items").eq(2).html(content.stAssGroup.gpname);
                
                // 修改
                $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                    insertDialog(content.stAssGroup.uid, content, $(this));
                });

                // 刪除
                $(pageStyleObj).find(".fa-trash-o").click(function(){
                    deleteData(content.stAssGroup.uid, $(this).parents(".list-items").parent(), content.name);
                });

                $(pageStyleObj).appendTo($("#grid"));
                if(content.stAssGroupMenu != null){
                    var positionStr = "";
                    $.each(content.stAssGroupMenu, function(iPositionIndex, vPositionContent){
                        positionStr += vPositionContent.uid + ",";
                    });
                    positionStr = positionStr.substring(0, positionStr.length - 1);
                    listPostionData[content.stAssGroup.uid] = positionStr;
                } 
            });
        }else{
            // console.log(data);
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");
            
            $(pageStyleObj).find(".list-items").eq(0).html(data.stAssGroup.name);
            $(pageStyleObj).find(".list-items").eq(1).html(data.stAssGroup.remark);
            $(pageStyleObj).find(".list-items").eq(2).html(data.stAssGroup.gpname);

            // 修改
            $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                insertDialog(data.stAssGroup.uid, data, $(this));
            });

            // 刪除
            $(pageStyleObj).find(".fa-trash-o").click(function(){
                deleteData(data.stAssGroup.uid, $(this).parents(".list-items").parent(), data.stAssGroup.name);
            });

            if($("#grid").find("div").length){
                $("#grid").find(".dataContent").eq(-1).addClass("list-items-bottom").after(pageStyleObj);
            }else{
                $(pageStyleObj).removeClass("list-items-bottom").appendTo("#grid");
            }
            if(data.positionStr != null){
                listPostionData[data.stAssGroup.uid] = data.positionStr;
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
        title = "修改公司群組類別";
        saveBtn = "修改";
    }else{
        title = "新增公司群組類別";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: title,
        start: function(){
          var option = {styleKind:"org_group",style:"org_group_insert"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            // 第一格是名字
            $(insertPageObj).find(".list-items").eq(0).find(".control-label").text("群組名稱");
            var nameArea = $(insertPageObj).find(".list-items").eq(0).find("input:text").addClass("userInput").prop("id","name");

            // 第二格是備註
            $(insertPageObj).find(".list-items").eq(1).find(".control-label").text("群組備註");
            var remarkArea = $(insertPageObj).find(".list-items").eq(1).find("input:text").addClass("userInput").prop("id","remark");
            
            // 第三格是群組類別
            $(insertPageObj).find(".list-items").eq(2).find(".control-label").text("使用類別");
            var selectArea = $(insertPageObj).find(".list-items").eq(2).find("select");
            if(modifyItem == null){
                // 第四格是範本
                $(insertPageObj).find(".list-items").eq(3).find(".control-label").text("使用範本");
                var selectExampleArea = $(insertPageObj).find(".list-items").eq(3).find("select");
                if(groupExampleData != undefined){
                    $.each(groupExampleData, function(index, content){
                        selectOptionPut( selectExampleArea, content.uid, content.name);
                    });
                    selectExampleArea.change(function(){
                        var value = $(this).val();
                        if(value){
                            treeView.reload({selectedData:groupPositionData[value]});
                        }else{
                            treeView.reload();
                        }
                    });
                }
            }else{
                $(insertPageObj).find(".list-items").eq(3).remove();
            }
            if(groupData != undefined){
                $.each(groupData, function(index, content){
                    selectOptionPut( selectArea, content.uid, content.name);
                });
            }

            

            if(modifyItem != undefined){
                nameArea.val(modifyItem.stAssGroup.name);
                remarkArea.val(modifyItem.stAssGroup.remark);
                if(groupData != undefined){
                    selectArea.val(modifyItem.stAssGroup.groupid);
                }
            }

            // 放入
            $(insertPageObj).appendTo( $("#insertDialog").find(".modal-body") );
            var treeArea = $('<div>').prop("id","treeArea");
            treeArea.appendTo( $("#insertDialog").find(".modal-body") );
            
            treeView = $(treeArea).treeView({
                data: positonData,
                checkbox:true,
                selectedRturnDataIndex:"bpsID",
                // selectedData: "1,2,3,4,5,6"
            });
            if(modifyItem != null){
                // console.log(listPostionData[modifyItem.stAssGroup.uid] );
                if(listPostionData[modifyItem.stAssGroup.uid] != undefined){
                    treeView.reload({selectedData:listPostionData[modifyItem.stAssGroup.uid]});
                }
            }
          });
        },
        button:[
            {
                text: "取消",
                className: "btn-default-font-color",
                click: function(){
                    $("#insertDialog").bsDialog("close");
                }
            },
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var data = getUserInput("insertDialog");
                    if(uid != undefined){
                        data.uid = uid;
                        // console.log(data);
                    }
                    if(data.groupid){
                        data.gpname = $("#insertDialog").find("#groupid :selected").text();
                    }
                    // 廠商ID暫時設定1
                    data.suid = suid;
                    var isNull = false;
                    $.each(data,function(i,v){
                        if($.trim(v) == "" && i != "groupid"){
                            isNull = true;
                        }
                    });
                    // console.log(data);
                    var positionStr = treeView.selected();
                    var positonArr = [];
                    if(positionStr != null){
                        var tmpArr = positionStr.split(",");
                        $.each(tmpArr, function(i, v){
                            var tmpObject = {};
                            tmpObject.mid = v;
                            if(uid != undefined){
                                tmpObject.gid = uid;
                            }
                            positonArr.push(tmpObject);
                        });
                    }
                    var tmpData = {
                        stAssGroup: data,
                        stAssGroupMenu: positonArr,
                        // positionStr: positionStr
                    }
                    data = tmpData;
                    listPostionData[uid] = positionStr;
                    // console.log(listPostionData);
                    // console.log(data);
                    // return;
                    if(!isNull){
                        saveData(data,positionStr,clickObject);
                        $("#insertDialog").bsDialog("close");
                    }
                }
            },
            
        ]
    });

}

// 儲存
function saveData(data, positionStr, clickObject){
    // console.log(data);
    var processAPI = "Insert_AssGroupAuthority";
    // return;
    if(data.stAssGroup.uid != undefined){
        processAPI = "Update_AssGroupAuthority";

        clickObject.parents(".dataContent").find(".list-items").eq(0).text(data.stAssGroup.name);
        clickObject.parents(".dataContent").find(".list-items").eq(1).text(data.stAssGroup.remark);
        clickObject.parents(".dataContent").find(".list-items").eq(2).text(data.stAssGroup.gpname);
        clickObject.unbind("click").click(function(){
            insertDialog(data.stAssGroup.uid, data, $(this));
        });
    }
    
    var sendData = {
        api:ctrlAuthorityAPI + processAPI,
        data:data
    };
    console.log(data);
    // console.log(sendData);
    console.log(JSON.stringify(data));

    $.post(wrsUrl, sendData,function(rs){
        rs = $.parseJSON(rs);
        console.log(rs);
        // 新增
        if(data.stAssGroup.uid == undefined){
            data.stAssGroup.uid = rs.Data;
            data.positionStr = positionStr;
            putDataToPage(data, true);
        }
    });

}

// 刪除
function deleteData(uid, removeItem, name){
    var sendData = {
        apiMethod: ctrlAuthorityDelAPI + "Delete_AssGroup",
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