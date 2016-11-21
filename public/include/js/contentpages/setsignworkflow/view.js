// 查看流程
function signworkViewDialog(modifyObj){
    $("#signworkViewDialog").remove();
    
    var thisContent = $("<div>").prop("id","signworkViewDialog").addClass("").css("width","100%");
    
    thisContent.appendTo("body");
    var btnText = "新增";
    if(modifyObj != undefined){
        btnText = "修改";
    }
    $("#signworkViewDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        modalClass: "bsDialogWindow",
        title: "「"+modifyObj.name + "」-簽核流程預覽",
        start:function(){
            // getOrgData();
            // 畫面設定值
            var option = {styleKind:"setsignworkflow",style:"view"};
            // 取得畫面樣式
            getStyle(option,function(pageStyle){
                var pageStyleObj = $.parseHTML(pageStyle);
                var flowStyle = $(pageStyleObj).find(".modal-items").html();
                
                $.each(modifyObj.layer, function(index, content){
                    var putArea = $(pageStyleObj).find(".panel-default").find(".panel-body");
                    putArea.find(".empty").remove();
                    $.each(content, function(layerIndex,layerID){
                        // console.log(layerID);
                        orgContentPutList(putArea,layerID, modifyObj.layerName[index][layerIndex],false );
                    });
                    
                });
                
                $(pageStyleObj).appendTo($("#signworkViewDialog").find(".modal-body"));
            });
        },
        button:[
        {
            text: "關閉",
            click: function(){
                $("#signworkViewDialog").bsDialog("close");
                
                // console.log(data);
            }
        }
        ]
    });
}