var testData = [];
var sys_code = userLoginInfo.sysCode;
var orgTreeChart;
$(function(){
    getOrgData();
});

function getOrgData(){
    loader($("#orgChart"));
    var sendData = {
        api: "AssOrg/GetData_AssOrg",
        threeModal:true,
        data:{
            sys_code: sys_code,
        }
    }; 

    $.getJSON(wrsUrl,sendData,function(rs){

        // console.log(rs);
        $("#orgChart").empty();
        //有資料
        if(rs.Status){
            $.each(rs.Data, function(index, content){
                createTreeData(content.uid,content.name,content.faid, content.officeid);
            });
            createTree();
        }else{ //沒有資料
            addDialog("",0);
        }
		// console.log(rs);
	});
}

// 創建組織樹狀圖
function createTree(){
    orgTreeChart = $('#orgChart').orgChart({
        data: testData,
        showControls: true,
        allowEdit: false,
        newNodeText:"部門科室",
        withoutRoot: true,
        otherNodeBtnText: '職稱',
        otherNodeBtnClass: 'fa-briefcase',
        otherNodeBtn: true,
        onAddNode: function(node){  
            var parentID = node.data.id;
            addDialog(orgTreeChart, parentID);
        },
        onDeleteNode: function(node){
            deleteDialog(node)
            // deleteNode(node.data.id);
            // orgTreeChart.deleteNode(node.data.id); 
        },
        onClickNode: function(node){
            // log('Clicked node '+node.data.id);
            // jobRankTreeDialog(orgTreeChart, node.data);
            // console.log(node.data);
        },
        onOtherNode: function(node){
            jobRankTreeDialog(orgTreeChart, node.data);
        }
    });
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

// 新增
function addDialog(orgTreeChart, parentID){
    $("#addDialog").remove();

    var addDialog = $("<div>").prop("id","addDialog");

    $("<div>").addClass("contents").appendTo(addDialog);
    addDialog.appendTo("body");

    var headerCloseBtn = true;

    if(orgTreeChart == ""){
        headerCloseBtn = false;
        $("#orgChart").empty();
    }
    var sendObj = {
        api: "AssTypeOffice/GetData_AssTypeOffice",
        threeModal:true,
        data:{
            sys_code: sys_code,
        }
    };
    $.getJSON(wrsUrl, sendObj).done(function(rs){
        // console.log(rs);
        var isEmpty = true;
        var tmpDataArr = [];
        if(rs.Status){
            tmpDataArr = $.grep(rs.Data,function(v, i){
                if(v.faid != "0"){
                    return v;
                }
            });
            
            if(tmpDataArr.length){
                isEmpty = false;
            }
        }

        $("#addDialog").bsDialog({
            autoShow:true,
            headerCloseBtn: headerCloseBtn,
            title: "部門科室選單",
            // showFooterBtn:false,
            button:[
                {
                    text: "新增部門科室",
                    className: "btn-info",
                    click: function(){
                        insertOrgUnitDialog(orgTreeChart,parentID);
                    }
                }
            ],
            start: function(){
                loader( $("#addDialog").find(".contents") );
                $("#addDialog").find(".contents").empty();
                createOtgList(parentID, orgTreeChart, tmpDataArr, isEmpty);
            },
        });

    });
}

// 新增部門科室
function insertOrgUnitDialog(orgTreeChart,parentID){   
    var title = "新增部門科室";
    var saveBtn = "新增";
    
    $("#insertOrgUnitDialog").remove();
    var insertOrgUnitDialog = $("<div>").prop("id","insertOrgUnitDialog");
    insertOrgUnitDialog.appendTo("body");

    $("#insertOrgUnitDialog").bsDialog({
        title:title,
        autoShow: true,
        start: function(){
          var option = {styleKind:"input",style:"text-help-only"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).removeClass("row").addClass("contents");
            $(insertPageObj).find(".control-label").text("名稱");
            $(insertPageObj).find("input:text").prop("id","name").addClass("userInput");
            
            $("#insertOrgUnitDialog").find(".modal-body").html(insertPageObj);
          });
        },
        button:[
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var option = {
                        success: function(sendObj){
                            createUnit(true, 0, sendObj.name, sys_code, function(rs){

                                if(rs.Status){
                                    $("#insertOrgUnitDialog").bsDialog('close');
                                    // 取該筆部門科室資料
                                    var sendData = {
                                        api: "AssTypeOffice/GetData_AssTypeOffice",
                                        threeModal: true,
                                        data:{
                                            iUid: rs.Data,
                                            sys_code: sys_code
                                        }
                                    }

                                    // ＡＰＩ呼叫
                                    getPageListData(sendData, function(orgUnitObj){
                                        if(orgUnitObj.Status){

                                            if($("#addDialog").find(".data-empty").length){
                                                $("#addDialog").find(".data-empty").remove();
                                            }else{
                                                // 先加回底線
                                                $("#addDialog").find(".dataContents").last().addClass("list-items-bottom");
                                            }

                                            // 新增回列表
                                            var option = {styleKind:"list",style:"1grid-add"};
                                            // 取得選單樣式
                                            getStyle(option,function(insertPage){
                                                // 轉物件
                                                var insertPageObj = $.parseHTML(insertPage);
                                                $(insertPageObj).addClass("dataContents newData").removeClass("list-items-bottom");
                                                $(insertPageObj).find(".list-items").eq(0).html(orgUnitObj.Data[0].name);
                                                // 新增按鈕事件
                                                $(insertPageObj).find(".fa-plus-square-o").click(function(){
                                                    // 創建組織資料與節點
                                                    creatOrgData(orgTreeChart, orgUnitObj.Data[0], parentID);
                                                   // console.log();
                                                });
                                                $(insertPageObj).appendTo( $("#addDialog").find(".modal-body").find(".contents") );
                                                
                                            });
                                        }else{
                                            $.blockUI();
                                            $("#addDialog").bsDialog("close");
                                            setTimeout(function(){
                                                $.unblockUI();
                                                addDialog(orgTreeChart, parentID);
                                            },800);
                                            // 
                                        }
                                    });

                                    
                                }else{
                                    msgDialog(rs.msg || "無法新增，請重新整理後再嘗試");
                                }
                            });
                        }
                    };
                    checkInputEmpty('insertOrgUnitDialog',option);
                    
                    
                }
            },
            
        ]
    });

}

// 職級樹狀列表
function jobRankTreeDialog(orgTreeChart, nodeData){
    // console.log(nodeData);
    $("#jobRankTreeDialog").remove();

    var jobRankTreeDialog = $("<div>").prop("id","jobRankTreeDialog");

    $("<div>").addClass("contents").appendTo(jobRankTreeDialog);
    jobRankTreeDialog.appendTo("body");

    var headerCloseBtn = true;

    if(orgTreeChart == ""){
        headerCloseBtn = false;
        $("#orgChart").empty();
    }

    $("#jobRankTreeDialog").bsDialog({
        autoShow:true,
        headerCloseBtn: headerCloseBtn,
        title: nodeData.name + " 職稱架構圖",
        modalClass: "bsDialogWindow",
        start: function(){
            $("#jobRankTreeDialog").find(".contents").addClass("modal-items");
            loader( $("#jobRankTreeDialog").find(".contents") );
            getJobRank( $("#jobRankTreeDialog").find(".contents"), nodeData.listID, nodeData.id );
        },
        showFooterBtn:false,
    });
}

function createOtgList(parentID, orgTreeChart,data,isEmpty){

    if(isEmpty == undefined){
        isEmpty = false;
    }

    if(!isEmpty){
        var option = {styleKind:"list",style:"1grid-add"};
        // 取得選單樣式
        getStyle(option,function(insertPage){

            $.each(data, function(index, content){
                // 轉物件
                var insertPageObj = $.parseHTML(insertPage);
                $(insertPageObj).addClass("dataContents");
                $(insertPageObj).find(".list-items").eq(0).html(content.name);
                // 新增按鈕事件
                $(insertPageObj).find(".fa-plus-square-o").click(function(){
                    // 創建組織資料與節點
                    creatOrgData(orgTreeChart, content, parentID);
                   // console.log();
                });
                $(insertPageObj).appendTo( $("#addDialog").find(".modal-body").find(".contents") );
                

                // $("#addDialog").bsDialog("show");
            });
            // 找最後一項去除底線
            $("#addDialog").find(".dataContents").last().removeClass("list-items-bottom");

        });
    }else{
        var option = {styleKind:"system",style:"data-empty"};
        // 取得選單樣式
        getStyle(option,function(emptyStyle){
            $("#addDialog").find(".modal-body").find(".contents").html(emptyStyle);
        });
    }
}

function creatOrgData(orgTreeChart,contentObj,parentID){
    var sendObj = {
      "officeid": contentObj.uid,
      "faid": parentID,
      "sys_code": sys_code,
    };

    var sendData = {
        api: "AssOrg/Insert_AssOrg",
        threeModal:true,
        data:sendObj
    }; 

    $.post(wrsUrl,sendData,function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            userLoginInfo.haveOrgs = true;
            if(orgTreeChart != ""){
                // 新增
                // newNode : parentId,name,childID
                orgTreeChart.newNode( parentID, contentObj.name, rs.Data, contentObj.uid );
            }else{
                // ROOT
                createTreeData(rs.Data, contentObj.name, parentID, contentObj.uid);
                createTree();
            }
            // 關閉
            $("#addDialog").bsDialog("close");

        }
    });
}

// 創建組織樹的資訊
function createTreeData(ID,Name,parentID,officeID){
    // console.log(ID,Name,parentID);
    var treeObj = {
        id: ID,
        name: Name,
        parent: parentID,
        listID: officeID
    };
    testData.push(treeObj);
}

function deleteNode(uid){

    var sendData = {
        api: "AssOrg/Delete_AssOrg",
        threeModal:true,
        data:{
            iUid: uid
        }
    }; 
    $.ajax({
        url: wrsUrl,
        type: "DELETE",
        data: sendData,
        success: function(rs){
            // console.log(rs);
            rs = $.parseJSON(rs);
            if(rs.Status){
                orgTreeChart.deleteNode(uid);
            }else{
                msgDialog(rs.msg||"刪除失敗");
            }
        }
    });
}

// 錯誤提示
function errorDialog(msg, closeCallBack){
    if($("#errorDialog").length){
        $("#errorDialog").remove();
        $("body").find(".modal-backdrop.fade.in").last().remove();
    }
    $("<div>").prop("id","errorDialog").appendTo("body");

    $("#errorDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        title: "錯誤",
        start:function(){

            var msgDiv = $("<div>").html(msg);
            $("#errorDialog").find(".modal-body").append(msgDiv);
        },
        button:[{
            text: "關閉",
            className: "btn-danger",
            click: function(){
                $("#errorDialog").bsDialog("close");
                if(closeCallBack != undefined){
                    closeCallBack();
                }
            }
        }
        ]
    });
}

// 刪除提示
function deleteDialog(node){
    if($("#deleteDialog").length){
        $("#deleteDialog").remove();
        $("body").find(".modal-backdrop.fade.in").last().remove();
    }
    $("<div>").prop("id","deleteDialog").appendTo("body");

    $("#deleteDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        title: "刪除",
        start:function(){
            var str = "確定刪除「"+node.data.name+"」？";
            var msgDiv = $("<div>").html(str);
            $("#deleteDialog").find(".modal-body").append(msgDiv);
        },
        button:[
            {
                text: "取消",
                // className: "btn-danger",
                click: function(){
                    $("#deleteDialog").bsDialog("close");
                }
            },
            {
                text: "確定",
                className: "btn-danger",
                click: function(){
                    deleteNode(node.data.id);
                    // orgTreeChart.deleteNode(node.data.id); 
                    $("#deleteDialog").bsDialog("close");
                }
            }
        ]
    });
}
