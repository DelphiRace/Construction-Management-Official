var sys_code = userLoginInfo.sc;
$(function(){
    getData();
}); 

// 取得資料
function getData(){
    data = { sys_code:sys_code };
    var sendData = {
        api: customersAPI+"GetData_CustomersData",
        threeModal: true,
        data: data
    }
    // ＡＰＩ呼叫
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        if(rs.status){
            putDataToPage(rs.data);
            $(".modify-btn").unbind("click").click(function(){
                $.blockUI();
                saveBtn(rs.data.uid);
            });
        }else{
            msgDialog(rs.msg||"無法取得資料",true,function(){
                getData();
            });
            $(".modify-btn").unbind("click").click(function(){
                msgDialog(rs.msg||"無法取得資料");
                getData();
            });
        }
        // console.log(rs);
    }).fail(function(){
        // 放入空的
        msgDialog("無法取得資料",true,function(){
            getData();
        });
    });
}

// 放資料
function putDataToPage(data){
    var cus = $("#cus_content").find(".list-items");
    // 第一格是名字
    var nameArea = cus.eq(0).find("input:text");

    // 第二格是電話
    var phoneArea = cus.eq(1).find("input:text");

    // 第一格是名字
    var addressArea = cus.eq(2).find("input:text");
    // 傳真
    var faxArea = cus.eq(3).find("input:text");

    // 第二格是電話
    var org_numbersArea = cus.eq(4).find("input:text");
    // 第一格是名字
    var principal_nameArea = cus.eq(5).find("input:text");

    // 第二格是電話
    var principal_phoneArea = cus.eq(6).find("input:text");
    // 第二格是電話
    var principal_mailArea = cus.eq(7).find("input:text");
    
    
    nameArea.val(data.name);
    phoneArea.val(data.phone);
    addressArea.val(data.address);
    faxArea.val(data.fax);
    org_numbersArea.val(data["org_numbers"]);
    principal_nameArea.val(data["principal_name"]);
    principal_phoneArea.val(data["principal_phone"]);
    principal_mailArea.val(data["principal_mail"]);
    
}

function saveBtn(uid){
    var userInputOption = {
        without: ["org_numbers","principal_name","principal_phone","principal_mail","fax"],
        emptyCall: function(){
            $.unblockUI();
        },
        success: function(sendObj){
            sendObj.uid = uid;
            saveData(sendObj);
        }
    }
    checkInputEmpty($("#cus_content"),userInputOption);

}

// 儲存
function saveData(data){
    var sendData = {
        api:customersAPI + "modify",
        threeModal: true,
        data:data
    };
    
    $.post(wrsUrl, sendData,function(rs){
        // console.log(rs);
        rs = $.parseJSON(rs);
        if(rs.status){
            msgDialog("修改成功", false);
        }else{
            msgDialog(rs.msg);
        }
        $.unblockUI();

    });

}