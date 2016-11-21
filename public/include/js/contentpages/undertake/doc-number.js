// 文號樣式設置
function docNumberSettingDialog(){
    $("#docNumberSettingDialog").remove();
    var docNumberSettingDialog = $("<div>").prop("id","docNumberSettingDialog");
    docNumberSettingDialog.appendTo("body");
    
    $.blockUI();

    docNumberSettingDialog.bsDialog({
        title: "擬文文號樣式設置",
        autoShow: true,
        start: docNumberViewStart(docNumberSettingDialog),
        button:[
            {
                text: "儲存",
                className: "btn-success",
                click: function(){
                    var type = docNumberSettingDialog.find(".docNumberStyle").index( docNumberSettingDialog.find(".fa-dot-circle-o") );
                    var sendObj = {
                        type: type,
                        sys_code: sys_code
                    }
                    saveDocNumberSetting(sendObj, docNumberSettingDialog);
                }
            }
        ],
        // showFooterBtn: false
    });

   
}

// 字號管理開啟的動作要做的事情
function docNumberViewStart(docNumberSettingDialog){
    var option = {styleKind:"received-issued",style:"doc-number-setting"};
    getStyle(option,function(listPage){
        var listPageObj = $.parseHTML(listPage);

        var sendData = {
            api: docNumberAPI + "GetData_DocNumber",
            threeModal:true,
            data:{
                sys_code: sys_code
            }
        };

        $.getJSON(wrsUrl, sendData).done(function(rs){
            // 有設定樣式
            if(rs.Status){
                var docNumberType = parseInt(rs.Type);
                $(listPageObj).find(".docNumberStyle").eq(docNumberType).addClass("fa-dot-circle-o").removeClass("fa-circle-o");
                putDocNumberExample( docNumberType, $(listPageObj));
            }else{
                // 沒有樣式
                $(listPageObj).find(".docNumberStyle").eq(2).addClass("fa-dot-circle-o").removeClass("fa-circle-o");
                putDocNumberExample(2, $(listPageObj));
            }
            $(listPageObj).appendTo(docNumberSettingDialog.find(".modal-body"));
            $.unblockUI();
        });

        setDocNumberBtnAction($(listPageObj));
        
    });
        
    
}

// 儲存
function saveDocNumberSetting(sendObj, docNumberSettingDialog){
    method= "Update_DocNumber";
    var sendData = {
        api: docNumberAPI + method,
        threeModal: true,
        data:sendObj
    }

    $.post(wrsUrl, sendData, function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            
            docNumberSettingDialog.bsDialog("close");
        }else{
            msgDialog(rs.msg);
        }
    });
}

function putDocNumberExample(type, putArea){
    var str = "00001";
    var d = new Date();
    switch(type){
        // 年+流水號
        case 1:
            str = (d.getFullYear() - 1911).toString() + str;
        break;
        // 年月日+流水號
        case 2:
            str = (d.getFullYear() - 1911).toString() + (d.getMonth()+1).toString() + (d.getDate()).toString() + str;
        break;
    }
    putArea.find("#docNumberExampleArea").text(str);
}

function setDocNumberBtnAction(itemObj){
    itemObj.find(".docNumberStyle").each(function(){
        $(this).click(function(){
            var docNumberType = itemObj.find(".docNumberStyle").index($(this));
            itemObj.find(".docNumberStyle").removeClass("fa-circle-o fa-dot-circle-o").addClass("fa-circle-o");
            $(this).addClass("fa-dot-circle-o").removeClass("fa-circle-o");
            putDocNumberExample(docNumberType, itemObj);
        });
    });
}