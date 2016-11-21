//動作事件
var sysFrameItem = function ( actionClass, actionType ) {
    this.aClass = actionClass;
    if(typeof actionType == 'undefined'){
        this.actionType = '';
    }
};

sysFrameItem.prototype = {
    aClass: '',
    actionType: '',
    showAction: function () {
        $("."+this.aClass).show();
    },
    hideAction: function () {
        $("."+this.aClass).hide();
    },
    getInputAction: function(){
        var ItemData = {};
        $("."+this.aClass).each(function(i,v){
           ItemData.i = v;
        });
        return ItemData;
    },
    getItemIDAction: function(){
        if(actionType){
            $("."+this.aClass).prop("id").replace(this.actionType+'Act');
        }else{
            console.log('actionType is not set');
        }
    }
};


//$(this),insert/modify/delete/finish, tableID/DivID, ctrlPage/webPage

//新增
function sysFrameInsertBtn(listID, actionUrl, processFunction){
    if(processFunction){
        try{
            $.fn[processFunction]();
        }catch(e){
            console.log(processFunction + "Function Error"+e);
        }
    }
    optionAction(actionUrl, listID, {}, true);
}

//修改
function sysFrameModifyBtn(actionObject, actionUrl, inputClass, contentClass, processFunction){
    if(!contentClass || !inputClass){
        console.log("contentClass or inputClass Error");
        return;
    }
    
    var sfiContent = new sysFrameItem(contentClass);
    var sfiInput = new sysFrameItem(inputClass);
    
    sfiContent.hideAction();
    sfiInput.showAction();
    
    if(processFunction){
        callMethod(processFunction);
    }
    optionAction(actionUrl, '', {}, false);
}

//刪除
function sysFrameDeleteBtn(actionObject, rowID, actionUrl, processFunction){
    var itemID = actionObject.prop("id").replace("dAct","");
    var dataObject = {itemID:itemID}
    
    if(processFunction){
        callMethod(processFunction);
    }
    optionAction(actionUrl, '', dataObject, false);
}

//完成
function sysFrameDeleteBtn(actionObject, inputClass, contentClass, actionUrl, processFunction){
    var itemID = actionObject.prop("id").replace("fAct","");
    var dataObject;
    var sfiContent = new sysFrameItem(contentClass);
    var sfiInput = new sysFrameItem(inputClass);
    
    sfiContent.hideAction();
    sfiInput.showAction();
    dataObject = sfiInput.getInputAction();
    dataObject.itemID = itemID;
    
    if(processFunction){
        callMethod(processFunction);
    }
    
    optionAction(actionUrl, '', dataObject, false);
}


function optionAction(actionUrl, listID, dataObject, appendAction){
    if(actionUrl != ''){
        if(typeof appendAction === 'undefined'){
            appendAction = true;
        }
        $.ajax({
            url: actionUrl,
            type: "POST",
            data: dataObject,
            success: function(rs){
               if(appendAction){
                   $(rs).appendTo("#"+listID);
               }
               console.log(rs);
            },
            error:function(xhr, ajaxOptions, thrownError){
               alert('Error');
            }
        });
    }else{
        console.log('actionUrl is not set');
    }
}

function callMethod(method)
{
    try{
        method();
    }catch(e){
        console.log(processFunction + "Function Error"+e);
    }
}
