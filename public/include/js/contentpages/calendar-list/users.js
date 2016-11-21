// 使用者列表
function addUserListData(infoPutArea, valuePutArea, selectData,contractors){
    if(contractors == undefined){
        contractors = false;
    }
    var sendObj = {
        api: "AssUser/GetData_OrgAssUser",
        threeModal: true,
        data:{
            sys_code: sys_code,
            userID: userID,
            contractors:contractors
        }
    }
    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Data){
            userAddDialog(rs.Data ,infoPutArea, valuePutArea, selectData);
        }else{
            msgDialog("無法取得使用者列表");
        }
    });
}

// 新增使用者
function userAddDialog(data, infoPutArea, valuePutArea, selectData){
    $("#userListDialog").remove();
    var userListDialog = $("<div>").prop("id","userListDialog");
    userListDialog.appendTo("body");
    var userListDialog = $("#userListDialog").bsDialogSelect({
        autoShow:true,
        showFooterBtn:true,
        headerCloseBtn:false,
        // modalClass: "bsDialogWindow",
        title: "選擇使用者",
        data: data,
        selectData: selectData,
        textTag: "name",
        valeTag: "uid",
        button:[
            {
                text: "取消",
                // className: "btn-success",
                click: function(){
                
                    $("#userListDialog").bsDialog("close");
                    
                }
            },
            {
                text: "確定",
                className: "btn-success",
                click: function(){
                    var userIDList = userListDialog.getValue();
                    var userIDListText = userListDialog.getText();
                    $(valuePutArea).val(userIDList);
                    
                    $("#userListDialog").bsDialog("close");
                    if(userIDList){

                        $(infoPutArea).text(userIDListText);
                        $(infoPutArea).removeClass("item-bg-danger");
                        // $(infoPutArea).text(userIDListText);
                        // $(valuePutArea).val(userIDList);
                        // $("#userListDialog").bsDialog("close");
                    }else{
                        $(infoPutArea).empty().text("-");
                    }
                    // else{
                    //     msgDialog("尚未選擇使用者"); 
                    // }
                }
            }
        ]
    });
}