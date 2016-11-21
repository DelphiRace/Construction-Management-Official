// 更改檔名Dialog
function fileRename(filename,inputObj, docUid, isReVersion){
	if(isReVersion == undefined){
		isReVersion = false;
	}
	var btnText = "新增";
	if(isReVersion){
		btnText = "更新";
	}
	$("body").find("#addDialog").remove();
    $("<div>").prop("id","addDialog").appendTo("body");
    $("#addDialog").bsDialog({
        title:"選擇檔案",
        headerCloseBtn: false,
        start: function(){
        	$("#addDialog").find($("#FileName")).text(filename);
            var option = {styleKind:"file-mana",style:"in-mo"};
                // 取得畫面樣式
            getStyle(option,function(pageStyle){
                //自訂要的欄位
                var inputObject={
                    unit1:{
                        Name:"更改名稱",
                    }
                };
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).find("#FileRename").val(filename);
                $(pageStyleObj).find("#FileName").text(filename)
                $(pageStyleObj).appendTo($("#addDialog").find(".modal-body"));
                $(pageStyleObj).find($("#selectFile")).click(function(){
                	openFileUpload();
                });
                $(pageStyleObj).find(".list-items").eq(2).remove();
                // selectCategory(pageStyleObj);
            });
        },
        button:[
         	{	
	          	text: "取消",
	            className: "btn-default-font-color",
	            click: function(){
	              $("#addDialog").bsDialog("close");
	              $("#renameCheckDialog").bsDialog("close");
	            }
          	},
          	{
	          	text: btnText,
	            className: "btn-success",
	            click: function(){
	            	filename = $("#addDialog").find("#FileRename").val();
	            	docTag =  $("#addDialog").find("#SmallcategoryID").val();
	            	sendFile( inputObj, filename, docUid );
	                getDocList(docType);
	                $("#addDialog").bsDialog("close");
	              	$("#renameCheckDialog").bsDialog("close");
	          	}
          	},
        ]
    });
}
// 上傳佇列
function uploadList(){
	$(".process-area").toggle();
	if(processAreaStatus){
		processAreaStatus = false;
		$(".file-name").removeClass("content-display-none");
		$(".upload-text").removeClass("content-display-none");
	}else{
		processAreaStatus = true;
		$(".file-name").addClass("content-display-none");
		$(".upload-text").addClass("content-display-none");
	}
}
// 關閉上傳佇列
function closeUpLoadList(){
	$("#closePage").toggle();
}
// 選擇檔案
function openFile(){
 	var input = '<input type="file" name="file">';
	var inputObj = $.parseHTML(input);
	$(inputObj).hide()
	.click()
	.change(function(){
		var filename = $(this).val().split('\\').pop();
		fileRename(filename, inputObj);
  	});
 	$("#uploadListSet").hide();
}

//ReUploadFile
function ReUploadFile(docUid){
 	var input = '<input type="file" name="file">';
	var inputObj = $.parseHTML(input);
	$(inputObj).hide()
	.click()
	.change(function(){
		var filename = $(this).val().split('\\').pop();
		fileRename(filename,inputObj, docUid, true);
  	});
 	$("#uploadListSet").hide();
}

//上傳的API
function sendFile(inputObj, filename, docUid){
	$("#closePage").show();
	var option = {styleKind:"file-mana",style:"uploadfile_list"};
  	getStyle(option, function(pageStyle){
   		
	   	var pageStyleObj = $.parseHTML(pageStyle);
	  	$(inputObj).appendTo( $(pageStyleObj).find("form")) ;
	   	$(pageStyleObj).find(".list-item").eq(0).text(filename);
	   	$(pageStyleObj).appendTo(".process-area");

	   	var method = "InsertFile";
	   	if(docUid != undefined){
	   		method = "UpdateFile";
	   	}

	   	var sendObj = {
	   		api: DocApi + method,
		    data:{
				  TypeId: docTag,
				  UserId: userID,
				  DocName: filename,
				  Uid: docUid
		   	}
		};
	   	var options = {
		    url: wrsAPI + "uploaderAPI",
		    type:"POST",
		    data: sendObj,
		    dataType:"JSON",
	    	beforeSend: function(xhr) {
	    		var isCancel = false;
	    		// 顯示在上傳佇列中
				$(pageStyleObj).find(".uploadBtn").unbind("click").click(function(){
					if (!isCancel){
						xhr.abort();
						$(pageStyleObj).find("form").ajaxFormUnbind();
			      		$(pageStyleObj).find(".bar").width("0%");
			      		$(pageStyleObj).find(".progress").hide();
			           	$(pageStyleObj).find(".uploadStatus").text("取消");
			           	$(this).removeClass("fa-times").addClass("fa-repeat");
			           	removeFileArr($(pageStyleObj));
			           	isCancel=true;
						titleBar($(pageStyleObj),filename,percentVal,true);
					}else
					{
						$(pageStyleObj).find(".bar").width("0%");
						$(pageStyleObj).find(".progress").show();
			           	$(pageStyleObj).find(".uploadStatus").text("上傳中");
			           	$(this).removeClass("fa-repeat").addClass("fa-times");
			           	$(pageStyleObj).find("form").ajaxSubmit(options);
			           	isCancel=false;
					}
				});
				var dateArr=[];
				dateArr.push($(pageStyleObj));
				dateArr.push(myMilliseconds);
				filesArr.push(dateArr);
				var percentVal = '0%';
				$(pageStyleObj).find(".bar").width(percentVal);
    		},
		   	uploadProgress: function(event, position, total, percentComplete) {
		       var percentVal = percentComplete + '%';
		       $(pageStyleObj).find(".bar").width(percentVal);
		       titleBar($(pageStyleObj),filename,percentVal,myMilliseconds);

		   	},
		   	success: function(rs) {
		   		if(rs.Status == undefined || !rs.Status){
		   			msgDialog(rs.Message);
		   		}else{
		   			msgDialog(rs.Data, false);

		   		}
				var percentVal = '100%';
				// $(pageStyleObj).find(".percent").text(percentVal);
				$(pageStyleObj).find(".bar").width(percentVal);
				$(pageStyleObj).find(".uploadStatus").text("完成");
				$(pageStyleObj).find(".fa-times").remove();
				$(pageStyleObj).find(".progress-bar-info").removeClass("progress-bar-info");
				$(pageStyleObj).find(".progress-bar").addClass("progress-bar-success");
				removeFileArr($(pageStyleObj));
				titleBar( $(pageStyleObj), filename, percentVal, myMilliseconds, true );
		   	},
		};
   	$(pageStyleObj).find("form").ajaxSubmit(options); 
  	// uploadProcess( $(pageStyleObj) );

  }); 
}
// 上傳佇列設定
function uploadProcess(uploadListObj){
   	var sendObj = {api:"waDataBase/api/Doc/SetDocFileInsert",data:{}}
	$(uploadListObj).find("form").prop("action",wrsAPI+"uploaderAPI").ajaxForm({
        data:sendObj,  
        dataType:"JSON",
    	beforeSend: function() {
	        var percentVal = '0%';
	        $(pageStyleObj).find(".percent").text(percentVal);
	       
   	 	},
    	uploadProgress: function(event, position, total, percentComplete) {
        	var percentVal = percentComplete + '%';
        	$(pageStyleObj).find(".percent").text(percentVal);
        	$(pageStyleObj).find(".bar").width(percentVal);
    	},
    	success: function(rs) {
        	var percentVal = '100%';
        	$(pageStyleObj).find(".percent").text(percentVal);
        	$(pageStyleObj).find(".bar").width(percentVal);
    	},
	});
}
// 詢問是否更改檔名Dialog
function renameCheck(filename,inputObj){
	$("body").find("#renameCheckDialog").remove();
    $("<div>").prop("id","renameCheckDialog").appendTo("body");
    $("#renameCheckDialog").bsDialog({
        start: function(){
            var string = "目前的檔案名稱： "+filename+" ，是否更改檔名?";
            

            $("#renameCheckDialog").find(".modal-body").html(string);
        },
        button:[
          	{
	          	text: "不更改",
	            className: "btn-default-font-color",
	            click: function(){
	            	sendFile(inputObj,filename);
	              	$("#renameCheckDialog").bsDialog("close");
	            }
          	},
          	{
	          	text:"更改",
	            className: "btn-success",
	            click: function(){
	            	fileRename(filename,inputObj); 
	          	} 
          	},
        ]
    });
}
// 選擇檔案 配合 詢問是否更改檔名Dialog
function openFileUpload(){
	
 	var input = '<input type="file" name="file">';
	var inputObj = $.parseHTML(input);
	$(inputObj).hide()
	.click()
	.change(function(){
		var filename = $(this).val().split('\\').pop();
		if(!$("#addDialog").find($("#FileRename")).val().length)
		{
			$("#addDialog").find($("#FileRename")).val(filename);
		}
		$("#addDialog").find($("#FileName")).text(filename);
  	});
 	$("#uploadListSet").hide();
}

function getUploadFileStyle(uploadObj){
	$(uploadObj).prop("id","").appendTo(".process-area");
}

function openFileList(){
	//$("#outputFile").click();
	//editSet();
	$("#uploadListSet").toggle();
}

function selectList(){
	$("#outputFile").click();
}

function removeFileArr(pageStyleObj){
 	filesArr = $.grep(filesArr,function(content,index){
        return content!=pageStyleObj;
    });
}
// titleBar
function titleBar(pageStyleObj,fileName,processVal,myMilliseconds,success){
	if(processAreaStatus){
		return;
	}else if(success) {
		console.log("T");
		$("#uploadTitleBar").find(".file-name").empty();
		$("#uploadTitleBar").find(".upload-text").empty();
	}
	var index = $.grep(filesArr,function(content,index){
		if(content[1]==myMilliseconds){
			return index ;
		}
    });
	if(index!=0){
		return;
	}else
	{
		$("#uploadTitleBar").find(".file-name").text(fileName);
		$("#uploadTitleBar").find(".upload-text").text(processVal);

	}
	

}
//(修改)更改檔名Dialog
function modifyRename(docUid,filename,modifyObj){
	$("body").find("#modifyDialog").remove();
    $("<div>").prop("id","modifyDialog").appendTo("body");
    $("#modifyDialog").bsDialog({
        title:"修改檔案",
        headerCloseBtn:false,
        start: function(){
        	$("#modifyDialog").find($("#FileName")).text(filename);
            var option = {styleKind:"file-mana",style:"in-mo"};
                // 取得畫面樣式
            getStyle(option,function(pageStyle){
                //自訂要的欄位
                var inputObject={
                    unit1:{
                        Name:"更改名稱",
                    }
                };
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).find("#FileRename").val(filename);
                $(pageStyleObj).find("#FileName").text(filename);
                $(pageStyleObj).find(".list-items").eq(1).remove();
                $(pageStyleObj).find(".list-items").eq(1).remove();
                $(pageStyleObj).appendTo($("#modifyDialog").find(".modal-body"));
                

                // $(pageStyleObj).find($("#selectFile")).click(function(){
                // 	openFileUpload();
                // });
                // selectCategory(pageStyleObj);
            });
        },
        button:[
         	{	
	          	text: "取消",
	            className: "btn-default-font-color",
	            click: function(){
	              $("#modifyDialog").bsDialog("close");
	              // $("#renameCheckDialog").bsDialog("close");
	            }
          	},
          	{
	          	text:"修改",
	            className: "btn-success",
	            click: function(){
	            	fileName = $("#modifyDialog").find("#FileRename").val();
	            	renewFileName(docUid, fileName, modifyObj);
	                // getDocList(docType);
	                $("#modifyDialog").bsDialog("close");
	              // $("#renameCheckDialog").bsDialog("close");
	          	}
          	},
        ]
    });
}
