var jobTreeChart;
var jobData = [];
function getJobRank( putArea, orgID, id ){
    // console.log(orgID);
	jobTreeChart = null;
	jobData = [];

    var sendData = {
        api: "AssPosition/GetData_AssPosition",
        threeModal:true,
        data:{
            sys_code: sys_code,
            iOfid: orgID,
            iOrgid: id 
        }
    }; 

    $.getJSON(wrsUrl,sendData,function(rs){
	    putArea.empty();
	    // console.log(rs);
	    if(rs.Status){
	    	// 顯示職務架構圖
            $.each(rs.Data,function(index, content){
                createJobTreeData( content.uid, content.name, content.faid );
            });
	    	createJobRankTree(putArea,orgID, id);
	        // createOtgList(parentID, jobTreeChart, rs.Data,false);
	    }else{ // 空的代表還未新增
	    	// 顯示新增ROOT按鈕
	    	var btn = $("<i>").addClass("fa fa-plus-square-o fa-2x send-btn mouse-pointer");
	    	btn.click(function(){
	    		addJobRank(putArea, orgID, id, jobTreeChart);
	    	});
	    	$("<div>").addClass("text-center").append(btn).appendTo(putArea);
	    }
	});
}

function addJobRank(putArea, orgID, dataOrgID, jobTreeChart, parentID){
	if(parentID == undefined){
		parentID = 0;
	}
	$("#addJobRank").remove();

    var addJobRank = $("<div>").prop("id","addJobRank");

    $("<div>").addClass("contents").appendTo(addJobRank);
    addJobRank.appendTo("body");

    $("#addJobRank").bsDialog({
        autoShow:true,
        title: "職稱選單",
        start: function(){
            loader( $("#addJobRank").find(".contents") );
            // 取得職務資料
            // $.getJSON(ctrlAdminAPI + "GetData_AssTypePosition",{}).done(function(rs){
            var sendData = {
                api: "AssTypePosition/GetData_AssTypePosition",
                threeModal:true,
                data:{
                    sys_code: sys_code,
                }
            }; 

            $.getJSON(wrsUrl,sendData,function(rs){
                $("#addJobRank").find(".contents").empty();
                // console.log(rs);
                if(rs.Status){
                    createJobList(putArea, parentID, jobTreeChart, rs.Data, orgID, dataOrgID, false);
                }else{
                    var option = {styleKind:"system",style:"data-empty"};
                    // 取得選單樣式
                    getStyle(option,function(emptyStyle){
                        $("#addJobRank").find(".modal-body").find(".contents").html(emptyStyle);
                    });
                }
            });
        },
        showFooterBtn:true,
        button:[
            {
                text: "新增職稱",
                className: "btn-info",
                click: function(){
                    insertJobDialog(putArea, orgID, dataOrgID, jobTreeChart, parentID);
                }
            }
        ]
    });
}

// 創建選擇職務列表
function createJobList(putArea, parentID, jobTreeChart, data, orgID, dataOrgID, isEmpty){
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
                    // console.log(jobTreeChart, content, parentID);
                    creatJobData(putArea, jobTreeChart, content, parentID, orgID, dataOrgID);
                   // console.log();
                });
                $(insertPageObj).appendTo( $("#addJobRank").find(".modal-body").find(".contents") );
            });
            // 找最後一項去除底線
            $("#addJobRank").find(".dataContents").last()
            .removeClass("list-items-bottom");
        });
    }else{
        var option = {styleKind:"system",style:"data-empty"};
        // 取得選單樣式
        getStyle(option,function(emptyStyle){
            $("#addJobRank").find(".modal-body").find(".contents").html(emptyStyle);
        });
    }
}

// 創建組織樹狀圖
function createJobRankTree(putArea, orgID, dataOrgID){
    jobTreeChart = putArea.orgChart({
        data: jobData,
        rootNodesDelete:true,
        showControls: true,
        allowEdit: false,
        newNodeText:"職稱架構",
        otherNodeBtnForRoot: true,
        otherNodeBtnText: '人員',
        otherNodeBtnClass: 'fa-users',
        otherNodeBtn: true,
        onAddNode: function(node){
            var parentID = node.data.id;
            // addJobRank(putArea, orgID, jobTreeChart, parentID)
            addJobRank(putArea, orgID, dataOrgID,jobTreeChart, parentID);
        },
        onDeleteNode: function(node){
            jobDeleteNode(node.data, putArea, orgID);
        },
        onClickNode: function(node){
            // log('Clicked node '+node.data.id);
            // jobRankTreeDialog(jobTreeChart, node.data);
            // console.log(node);
        },
        onOtherNode: function(node){
            // 取得所有人員
            getAllUserForSys(dataOrgID, node.data.id, node.data.name);
        }
    });
}

// 創建職務資料
function creatJobData(putArea, jobTreeChart, contentObj, parentID, orgID, dataOrgID){
    var sendObj = {
      "psid": contentObj.uid,
      "ofid": orgID,
      "faid": parentID,
      "orgid": dataOrgID,
      // "suid": 1
      "sys_code": sys_code
    };

    var sendData = {
        api: "AssPosition/Insert_AssPosition",
        threeModal:true,
        data: sendObj
    }; 

    $.post(wrsUrl,sendData,function(rs){
        var rs = $.parseJSON(rs);
        if(rs.Status){
            if(jobTreeChart != null){
                // 新增
                // newNode : parentId,name,childID
                jobTreeChart.newNode( parentID, contentObj.name, rs.Data );
            }else{
                // ROOT
                createJobTreeData(rs.Data, contentObj.name, parentID);
                createJobRankTree(putArea, orgID, dataOrgID);
            }
            // 關閉
            $("#addJobRank").bsDialog("close");
        }
        // 測試用
        // if(jobTreeChart != null){
        //     // 新增
        //     // newNode : parentId,name,childID
        //     jobTreeChart.newNode( parentID, contentObj.name, 2 );
        // }else{
        //     // ROOT
        //     createJobTreeData(1, contentObj.name, parentID);
        //     createJobRankTree(putArea, orgID);
        // }
        // $("#addJobRank").bsDialog("close");
    });
}

// 創建組織樹的資訊
function createJobTreeData(ID, Name,parentID){

    // console.log(ID,Name,parentID);
    var treeObj = {
        id: ID,
        name: Name,
        parent: parentID
    };
    jobData.push(treeObj);
}
// 刪除
function jobDeleteNode(data, putArea, orgID){
    var sendData = {
        api: "AssPosition/Delete_AssPosition",
        threeModal:true,
        data: {
            iUid: data.id
        }
    }; 
    $.ajax({
        url: wrsUrl,
        type: "DELETE",
        data: sendData,
        dataType: "json",
        success: function(rs){
            // console.log(rs);
            if(!rs.Status){
                errorDialog("此職務已被使用，無法刪除");
            }else{
                if(data.parent == 0){
                    getJobRank( putArea, orgID );
                }else{
                    jobTreeChart.deleteNode(data.id); 
                }
            }
        }
    });
}

// 取得所有人員
function getAllUserForSys(orgID, posID, posName){
    $.blockUI();
    var sendData = {
        api: "AssUser/GetData_AssUser",
        threeModal: true,
        data:{
            sys_code: sys_code,
            withOutSuspend: true
        }
    }
    $.getJSON(wrsUrl, sendData, function(rs){
        if(rs.Status){
            var thisOrgAndPosArr = [];
            $.each(rs.Data, function(i, userObj){
                if(userObj.orgid == orgID && userObj.posid == posID){
                    thisOrgAndPosArr.push(userObj.uid);
                }
            });
            allUserDialog(orgID, posID, rs.Data, thisOrgAndPosArr, posName);
        }else{
            msgDialog("無法取得人員列表，請重新整理後再嘗試");
        }
        $.unblockUI();
    });    
}

// 人員列表dialog
function allUserDialog(orgID, posID, userList, selectData, posName){
    $("#allUserDialog").remove();
    var allUserDialog = $("<div>").prop("id","allUserDialog");
    allUserDialog.appendTo("body");

    var selectUserList = allUserDialog.bsDialogSelect({
        autoShow:true,
        showFooterBtn:true,
        // modalClass: "bsDialogWindow",
        title: "人員列表",
        data: userList,
        selectData: selectData,
        textTag: "name",
        valeTag: "uid",
        onlySelect: false,
        button:[
            {
                text: "設定為「"+posName+"」",
                className: "btn-success",
                click: function(){
                    var selectUser = selectUserList.getValue();
                    if(selectUser){
                        var userNameList = selectUserList.getText();

                        var option = {
                            sureCall: function(){
                                var oldSelect = "";
                                if(selectData.length){
                                    oldSelect = selectData.join(",");
                                }
                                saveSettionUser(selectUser, oldSelect, orgID, posID);
                            },
                            title: "確認設置"
                        };
                        var msg = "您確定將「"+userNameList+"」設定為「"+posName+"」？";
                        chooseDialog(msg, option);
                        
                    }else{
                        msgDialog("尚未選擇人員");
                    }
                    
                }
            }
        ]
    });
}
// 紀錄使用者列表
function saveSettionUser(selectUser, oldSelect, orgid, posid){
    $.blockUI();
    var sendObj = {
        api: "AssUser/Update_AssUserOrgAndPos",
        data: {
            uidList: selectUser,
            orgid: orgid,
            posid: posid,
            oldSelect: oldSelect
        },
        threeModal: true
    }

    $.post(wrsUrl, sendObj, function(rs){
        rs = $.parseJSON(rs);
        if(rs.Status){
            msgDialog("設置成功", false);
            $("#allUserDialog").bsDialogSelect('close');
        }else{
            msgDialog(rs.msg||"設置失敗，請重新整理後再嘗試");
        }
        $.unblockUI();
    });

}

// 新增職稱
function insertJobDialog(putArea, orgID, dataOrgID, jobTreeChart, parentID){
    var title = "新增職稱";
    var saveBtn = "新增";
    
    $("#insertJobDialog").remove();
    var insertJobDialog = $("<div>").prop("id","insertJobDialog");
    insertJobDialog.appendTo("body");

    $("#insertJobDialog").bsDialog({
        title:title,
        autoShow: true,
        start: function(){
          var option = {styleKind:"org-job",style:"insert"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);
            
            $(insertPageObj).removeClass("row").addClass("contents");
            var nameArea = $(insertPageObj).find("#name");

            $(insertPageObj).find("#referencePositionBtn").click(function(){
                var isClick = $(this).prop("class").search("fa-check-square-o");
                if(isClick == -1){
                    $(this).removeClass("fa-square-o").addClass("fa-check-square-o");
                }else{
                    $(this).removeClass("fa-check-square-o").addClass("fa-square-o");
                }
            });
            
            $("#insertJobDialog").find(".modal-body").html(insertPageObj);
          });
        },
        button:[
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var option = {
                        success: function(sendObj){
                            sendObj.sys_code = sys_code;
                            createJob(sendObj, function(rs){
                                if(rs.Status){
                                    $("#insertJobDialog").bsDialog('close');
                                    // 取該筆職稱資料
                                    var sendData = {
                                        api: "AssTypePosition/GetData_AssTypePosition",
                                        threeModal: true,
                                        data:{
                                            iUid: rs.Data,
                                            sys_code: sys_code
                                        }
                                    }

                                    // ＡＰＩ呼叫
                                    getPageListData(sendData, function(orgJobObj){
                                        if(orgJobObj.Status){

                                            if($("#addJobRank").find(".data-empty").length){
                                                $("#addJobRank").find(".data-empty").remove();
                                            }else{
                                                // 先加回底線
                                                $("#addJobRank").find(".dataContents").last().addClass("list-items-bottom");
                                            }

                                            // 新增回列表
                                            var option = {styleKind:"list",style:"1grid-add"};
                                            // 取得選單樣式
                                            getStyle(option,function(insertPage){
                                                // 轉物件
                                                var insertPageObj = $.parseHTML(insertPage);
                                                $(insertPageObj).addClass("dataContents newData").removeClass("list-items-bottom");
                                                $(insertPageObj).find(".list-items").eq(0).html(orgJobObj.Data[0].name);
                                                // 新增按鈕事件
                                                $(insertPageObj).find(".fa-plus-square-o").click(function(){
                                                   creatJobData(putArea, jobTreeChart, orgJobObj.Data[0], parentID, orgID, dataOrgID);
                                                });
                                                $(insertPageObj).appendTo( $("#addJobRank").find(".modal-body").find(".contents") );
                                                
                                            });
                                        }else{
                                            $.blockUI();
                                            $("#insertJobDialog").bsDialog("close");
                                            setTimeout(function(){
                                                $.unblockUI();
                                                addJobRank(putArea, orgID, dataOrgID, jobTreeChart, parentID);
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
                    checkInputEmpty('insertJobDialog',option);
                }
            },
            
        ]
    });

}