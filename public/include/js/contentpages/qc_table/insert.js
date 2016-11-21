// 新增Dialog
function openInsertDialog(){
  $("#insertDialog").remove();
  var insertDialog = $("<div>").prop("id","insertDialog");
  insertDialog.appendTo("body");
  
  $("#insertDialog").bsDialog({
    title: "新增自檢表",
    start: function(){
      var option = {styleKind:"qc_table",style:"table-insert"};
      getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        $("#insertDialog").find(".modal-body").html(insertPageObj);
        $("#insertDialog").bsDialog("show");
        getQCTableTypeList("tableTypeTab","tableType",true);

      });
    },
    showFooterBtn: false
  });
}

//選擇項目後，開啟的內容
function openDialog(title, uid){
  $("#myModal,#modifyDialog").remove();
  var myModalDialog = $("<div>").prop("id","myModal");
  myModalDialog.appendTo("body");
  
  $("#myModal").bsDialog({
    title: "新增自檢表 - "+title,
    // width: "60%",
    modalClass:"bsDialogWindow",
    start: function(){
      // 外框
    	var option = {styleKind:"qc_table",style:"table_insert_style"};
      	getStyle(option,function(insertPage){
	        var insertPageObj = $.parseHTML(insertPage);
	        // $("#myModal").find(".modal-body").empty();

	        $(insertPageObj).find("#titleID").val(uid);
	        $(insertPageObj).find("#tableTitleName").val(title);
	        var option = {styleKind:"system",style:"data-empty"};
      		getStyle(option,function(emptyPage){
	        	$("<li>").addClass("contents startEmptyData").html(emptyPage).appendTo( $(insertPageObj).find("#table-totalContent") );
	        	// 套用範本事件
	        	$(insertPageObj).find(".templateUse").change(function(){
		          // console.log($(this).prop("checked"));
		          if($(this).prop("checked")){
		          	$(this).parent().find("i").removeClass("fa-square-o").addClass("fa-check-square-o");
		            getQCTableTitleContent();
		          }else{
		          	$(this).parent().find("i").removeClass("fa-check-square-o").addClass("fa-square-o");
		            var emptyDataLi = $("<li>").addClass("contents startEmptyData").html(emptyPage);
		            $(insertPageObj).find("#table-totalContent").html(emptyDataLi);
		            $("#qc_table_title").prop("readonly",false).val("");
		          }
		        });
	    	  });
	        
	        
	        $(insertPageObj).appendTo( $("#myModal").find(".modal-body") );

	        getQCTemplate();
	        $("#myModal").bsDialog("show");
      	});
    },
    button:[
      {
        text: "新增",
        className: "btn-success",
        click: function(){
          saveQCTable();
        }
      },
      {
        text: "取消",
        className: "btn-default-font-color",
        click: function(){
          $("#myModal").bsDialog("close");
        }
      },
    ]
  });
}


//新增
function saveQCTable(){
  var selectTableObj = getUserInput("selectTableItem");
  // var tableType = $("#tableType").val();
  var tableTitle,
    TitleUid,
    MyContent=[];
  var titleID = $("#titleID").val();
  // 放入標題
  var tableTitle = $("#tableTitleName").val();
  var templateUse = $("#templateUse").prop("checked");
  // 使用範本
  if(templateUse){
    tableTitle = tableTitle;
    TitleUid = titleID;
  }else{ // 不使用範本
    tableTitle = $("#qc_table_title").val();
    TitleUid = 0;
  }

  $("#table-totalContent").find(".qcTableItem").each(function(){
    var aplyQCItemChecked = $(this).find(".aplyQCItemSelect").prop("checked");
    if(!aplyQCItemChecked){
      var itemTitle = $(this).find(".item-title").val();
    }else{
      var itemTitle = $(this).find(".qcItemSelect :selected").text();
      var itemtUid = $(this).find(".qcItemSelect").val();
    }


    $(this).find(".item-list li").each(function(){
      var DITitle = $(this).find(".item-list-title").val();
      var standardValue = $(this).find(".standard-value").val();
      var tmpDIUid = $(this).find(".item-list-title").prop("id");
      var tmpDIStdVal = $(this).find(".standard-value").prop("id");
      var DIUid = (tmpDIUid == "" ) ? 0:tmpDIUid;
      var DIStdVal = (tmpDIStdVal == "")? 0:tmpDIStdVal;
      var tmpObj = {
        "Item": {
          "Uid": itemtUid,//大於0就不用帶ＮＡＭＥ
          "Name": itemTitle
        },
        "DetialItem": {
          "Uid": DIUid,
          "Name": DITitle
        },
        "StdVal": {
          "Uid": DIStdVal,
          "Name": standardValue
        }
      };
      MyContent.push(tmpObj);

    });
  });
    // console.log(MyContent);
  var sendObj = {
      MyHead:{
        Project:{
          Uid: 1
        },
        Title:{
          Uid:TitleUid, 
          Name:tableTitle
        },
        Type:{
          Uid: selectTableObj.tableType
        }
      },
      MyContent:MyContent
    };
  if(selectTableObj.tableType != "null"){
    $.post(QCAPI + "SaveEmptyCheckList",sendObj,function(){
        $("#insertDialog").bsDialog("close");
        $("#myModal").bsDialog("close");
        getQCTableTypeList("totalTableTypeTab","totalTableType");
    });
  }
  // console.log(sendObj);
}