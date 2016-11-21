// 變數
var processAreaStatus = true;
var fileType = "selectToOpenFile";
var filesArr = [];
var docType;
var docTag;
var mydate = new Date();
var myMilliseconds = mydate.getTime();
var prj_uid = 1;
var sys_code = userLoginInfo.sysCode;
var userID = userLoginInfo.userID;

$(function(){ 
	// selectCategory();
	getTabData();

	plusItemEvent();
	$(".deleteItem").click(function(){
		$(this).parent().parent().remove();
	});
	$(".selectList").click(function(){
		selectList();
	});
//editSet();
});

// 點選新增按鈕
function plusItemEvent(){
	$("#plusItem").unbind("click");
	if(fileType != "selectNoToOpenFile"){
		$("#plusItem").click(function(){
			openFile();
		});
	}else{
		$("#plusItem").click(function(){
			openFileList();
		});
	}
}
// TAB 取大類別API
function getTabData(){
 	var sendObj = {
    api: DocTypeApi+"GetDocTypeList",
 	  data:{}
 	};
  getPageListData(sendObj, function(rs){
		if(rs.Status){
			$("#tab-menu").empty();
			var firstObj;
      if(rs.Data != null){
  			$.each(rs.Data, function(Key , Val){
  				var tabObj = $("<li>").prop("role","presentation");
  				var categoryObj = $("<a>").prop("href","#").prop("id","category"+Val.uid);
  				
  				$(categoryObj).click(function(){
  					getDocList(Val.Uid, Val.edit);
  					docType = Val.Uid;
  					$("#fileContentList").empty();
  				});
  				if(Key==0){
  					firstObj = $(categoryObj);
  				}
  				$(categoryObj).appendTo(tabObj);
  				$(tabObj).appendTo("#tab-menu");
  				$(categoryObj).text(Val.Name);
  			});
  			tabCtrl("tab-menu");
  			firstObj.click();
      }else{
        putEmptyInfo( $("#fileContentList") );
      }
		}else{
      putEmptyInfo( $("#fileContentList") );
    }
	});
}

// 取放資料API
function getDocList(uid, edit){
  $("#fileContentList").empty();
	var sendObj = {
    api : DocApi+"GetDocList",
    data:{
      sysCodeId:sys_code,
      docTypeId: uid
    }
  };
  $.getJSON(wrsUrl,sendObj,function(rs){
    // console.log(rs);
    if(rs.Status){
      // 替換樣式
      // if(edit){
      // 	var style = "3grid-modify";
      // }
      // else{
      // 	var style = "3grid-content"
      // }
      var option = {styleKind:"file-mana",style:"list"};
      getStyle(option,function(pageStyle){
        // var categoryListObj = $("<div>").addClass("contents");
        $.each(rs.Data, function(Key , Val){
          var StyleObj = $.parseHTML(pageStyle);
          var fileType = getFileType(Val.DocName);
          var fileTypeIcon = $("<i>").addClass("fa "+fileType);
          var dateStr = Val.CreateDate.split(" ");

          var titleClick = $("<div>").addClass("send-btn mouse-pointer").text(Val.DocName);
          titleClick.click(function(){
            downloadFile(Val.DocId, Val.DocName);
          });
          $(StyleObj).find(".list-items").eq(0).append(fileTypeIcon);//第二欄
          $(StyleObj).find(".list-items").eq(1).append(titleClick);//第一欄
          $(StyleObj).find(".list-items").eq(2).text(Val.CreateUserName);//第三欄
          $(StyleObj).find(".list-items").eq(3).text(dateStr[0]);//第三欄

          // 更新版本
          $(StyleObj).find(".glyphicon-open-file").click(function(){
            ReUploadFile(Val.Uid);
          });
          // 更改黨名
          $(StyleObj).find(".fa-pencil-square-o").css("line-height",0).click(function(){
            modifyRename(Val.Uid, Val.DocName, $(StyleObj).find(".list-items").eq(0) );
          });
          // 下載檔案
          $(StyleObj).find(".fa-cloud-download").click(function(){
            downloadFile(Val.DocId, Val.DocName);
          });

          // $(StyleObj).find(".fa-trash-o").remove();
          $(StyleObj).appendTo($("#fileContentList"));
          // $(StyleObj).appendTo(categoryListObj);
        });
        $("#fileContentList").find(".list-items-bottom").last().removeClass("list-items-bottom");	
      });	
    }else{
      var categoryListObj = $("<div>").addClass("contents");
      $(categoryListObj).appendTo($("#fileContentList"));
      putEmptyInfo($(categoryListObj));
    } 
  });

}

//小類別API
function selectCategory(pageStyleObj,contentObj){
	var sendObj = {
   		api : DocApi+"GetDocTypeList",
   		data:{
   			prj_uid:prj_uid,
   			typeid:docType
   		}
    };
    $(pageStyleObj).empty();
    $.getJSON(wrsUrl,sendObj,function(rs){
        if(rs.status && rs.data != null){
            $.each(rs.data,function(key,value){
                selectOptionPut($(pageStyleObj).find("#SmallcategoryID"),value["uid"],value["name"]);
            });
            if(contentObj!=undefined){
                $(pageStyleObj).find("#SmallcategoryID").val(contentObj.SmallcategoryID);
            }
        }else{
          selectOptionPut($(pageStyleObj).find("#SmallcategoryID"),"","無資料");

        }

        
    });
}

// 單純更新檔案名稱
function renewFileName(docUid, fileName, modifyObj){
  var sendObj = {
    api: DocApi+"UpdateDocument",
    data: {
      Uid: docUid,
      DocName: fileName,
      TypeId: docType,
      UserId: userID
    }
  }
  $.ajax({
    url: wrsUrl,
    type: "PUT",
    data: sendObj,
    dataType: "JSON",
    success: function(rs){
      var isError = true;
      if(rs.Status){
        isError = false;
        modifyObj.text(fileName);
      }
      msgDialog(rs.Data, isError);
    },
    error: function(rs){
      msgDialog(rs.Data, isError);
    }
  });
}

// 檔案下載
function downloadFile(docID, fileName){
  var sendObj = {
    uid: docID,
    // uid: 4101,
    fileName: fileName
  };
  $.fileDownloader(fileDonwloadUrl, sendObj);
}

// get file Type 
function getFileType(fileName){
  var fileType = (/[.]/.exec(fileName)) ? /[^.]+$/.exec(fileName) : undefined;
  fileType = fileType.toString().toLowerCase();
  var fileTypeStr = "";
  switch(fileType){
    case "bmp":
    case "jpeg":
    case "jpg":
    case "png":
    fileTypeStr = "fa-file-image-o";
    break;

    case "zip":
    case "dmg":
    case "rar":
    case "tar":
    case "bz2":
    case "gz":
    fileTypeStr = "fa-file-archive-o";
    break;

    case "pdf":
    fileTypeStr = "fa-file-pdf-o";
    break;

    case "xlsx":
    case "xls":
    case "csv":
    fileTypeStr = "fa-file-excel-o";
    break;

    case "doc":
    case "docx":
    fileTypeStr = "fa-file-word-o";
    break;

    case "text":
    case "txt":
    fileTypeStr = "fa-file-text";
    break;

    default:
    fileTypeStr = "fa-file-o";
    break;
  }
  return fileTypeStr;
}