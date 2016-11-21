var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;

$(function(){
    getOUData();
});

// 取得資料
function getOUData(uid){
    var sendData = {
        api: "AssTypeOffice/GetData_AssTypeOffice",
        threeModal: true,
        data:{
            sys_code: sys_code
        }
    }
    if(uid != undefined){
        sendData.data.iUid = uid;
    }
    // ＡＰＩ呼叫
    getPageListData(sendData, function(rs){
        if(rs.Status){
            if(uid == null){
                putDataToPage(rs.Data);
            }else{
                // insertDialog(uid,name);
            }
        }else{
            // 放入空的
            putDataEmptyInfo($("#grid"));
        }
        // console.log(rs);
    });
    // .fail(function(){
    //     // 放入空的
    //     putDataEmptyInfo($("#grid"));
    // });
}

function putDataEmptyInfo(putArea){
    // 畫面設定值
    var option = {styleKind:"system",style:"data-empty"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        // 相關設定
        putArea.append(pageStyle);

        putArea.find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}

// 放資料
function putDataToPage(data, onlyData, resultDAta){
    if(typeof onlyData == "undefined"){
        onlyData = false;
    }
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"list",style:"1grid-modify"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        if(!onlyData){
            $.each(data,function(index,content){
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).addClass("dataContent");
                var firstItem = $(pageStyleObj).find(".list-items").eq(0);
                firstItem.html(content.name);
                // 修改
                $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                    insertDialog(content.uid, content.name, firstItem);
                });

                if(content.faid == 0){
                    $(pageStyleObj).find(".fa-trash-o").remove();
                }
                
                // 刪除
                $(pageStyleObj).find(".fa-trash-o").click(function(){
                    var removeItem = $(this).parents(".list-items").parent();
                    var deleteOption = {
                        sureCall: function(){
                            deleteData(content.uid, removeItem, content.name);
                        },
                        sureText: "確認",
                        sureClass: "btn-danger",
                        title: "刪除確認"
                    }
                    chooseDialog("若此部門科室資料已被使用於組織架構資料，刪除也會一併刪除組織架構內的資料<br/>是否要刪除「"+content.name+"」？", deleteOption);
                });

                $(pageStyleObj).appendTo($("#grid"));
            });
        }else{
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");
            var firstItem = $(pageStyleObj).find(".list-items").eq(0);
            firstItem.html(data.name);

            // 修改
            $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                insertDialog(resultDAta.Data, data.name, firstItem);
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
function insertDialog(uid, name, modifyItem){
    if(name == undefined){
        name = "";
    }
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(uid != undefined){
        title = "修改組織單位";
        saveBtn = "修改";
    }else{
        title = "新增組織單位";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title:title,
        autoShow: true,
        start: function(){
          var option = {styleKind:"input",style:"text-help-only"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).removeClass("row").addClass("contents");
            $(insertPageObj).find(".control-label").text("名稱");
            $(insertPageObj).find("input:text").val(name);
            
            if(uid != undefined){
                $("<input>").attr("type","hidden").prop("id","uid").val(uid).appendTo(insertPageObj);
            }
            $("#insertDialog").find(".modal-body").html(insertPageObj);
            $("body").find(".modal-backdrop")
            // getQCTableTypeList("tableTypeTab","tableType",true);

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
                    if(uid == undefined){
                        $("#grid").find(".data-empty").remove();
                    }
                    saveData(modifyItem);
                    $("#insertDialog").bsDialog("close");
                }
            },
            
        ]
    });

}

// 儲存
function saveData(modifyItem){
    // console.log(modifyItem);
    var name = $("#insertDialog").find("input:text").val(), 
    uid = $("#insertDialog").find("#uid").val();
    uid = (uid) ? parseInt(uid): 0;
    var isNew = true;
    var method = "Insert_AssTypeOffice";
    // console.log(sendData);
    // return;
    if(uid != 0){
        method = "Update_AssTypeOffice";
        isNew = false;
        
    }

    createUnit(isNew, uid, name, sys_code, function(rs){
        if(rs.Status){
            // 新增
            if(uid == 0){
                var data = {
                    uid: rs.Data,
                    name: name,
                    sys_code: sys_code
                }
                userLoginInfo.haveOrgUnit = true;

                putDataToPage(data,true, rs);

                if(!userLoginInfo.haveOrgs){
                    var option = {
                        closeCall: function(){
                            var msg = "您仍可透過選單 -「設定」>「組織」>「組織架構」前往設定";
                            msgDialog(msg);
                        },
                        sureCall: function(){
                            loadPage("org-tree/tree","pagescontent");
                        },
                        sureText: "前往「組織架構」設定",
                        closeText: "關閉",
                        sureClass: "btn-success",
                        title: "提示訊息"
                    };
                    var msg = "您尚未透過「組織架構」設置過任何組織<br/>";
                    msg += "是否要前往「設定」>「組織」>「組織架構」設定？<br/>";
                    chooseDialog(msg, option);
                }
            }else{
                modifyItem.html(name);
            }
        }else{
            msgDialog(rs.msg || "無法新增/修改，請重新整理後再嘗試");
        }
    });
}

// 刪除
function deleteData(uid, removeItem, name){
    var sendData = {
        api: "AssTypeOffice/Delete_AssTypeOffice",
        threeModal: true,
        data:{
            uid: uid
        }
    };
    $.ajax({
        url:wrsUrl,
        type:"DELETE",
        data:sendData,
        dataType: "JSON",
        success: function(rs){
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
        }
    });
}

// 當無法刪除時，提供說明
function couldNotDeleteDialog(name){
    $("#couldNotDeleteDialog").remove();
    $("<div>").prop("id","couldNotDeleteDialog").appendTo("body");

    $("#couldNotDeleteDialog").bsDialog({
    start: function(){
        var string = name+" 已被使用為組織上層，故無法刪除";
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