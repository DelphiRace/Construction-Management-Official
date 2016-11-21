// 取得編輯內容
function getQCTableModifyContent(uid){
  var selectTableObj = getUserInput("selectTableItem");
  
  if(uid != "null"){
    $("#modifyDialog").find(".qc-table-content").show();
    // 放入標題
    // var tableTitle = $("#titleID :selected").text();

    $("#modifyDialog").find("#table-totalContent").empty();
    $.getJSON(QCAPI + "GetEmptyCheckList", {titleID:uid}, function(rs){
      // console.log(rs);
      // return;
      if(rs.Status){

        var tableDataObj = processTableData(rs.Data.MyContent);
        $("#modifyDialog").find("#qc_table_title_modify").html(rs.Data.MyHead.Title.Name).parents(".form-group").hide();

        // 取得最外匡的樣式
        thisBorderStyle(function(pageBorder){
          // 取得內匡的樣式
          getListStyle(function(pageList){
            //放入
            $.each(tableDataObj, function(index,content){
              var pageBorderObj = $.parseHTML(pageBorder);
              // console.log(content);
              // $(pageBorderObj).find(".item-title").val(content.name);
              $(pageBorderObj).find(".aplyQCItemSelect").prop("checked",true);
              QCItemCheckSelect($(pageBorderObj).find(".aplyQCItemSelect"));
              $(pageBorderObj).find(".qcItemSelect").val(content.uid);

              $.each(content.child,function(childIndex,childContent){
                var pageListObj = $.parseHTML(pageList);
                $(pageListObj).addClass("qcDetialItem");
                $(pageListObj).find(".item-list-title").prop("id",childContent.DI_uid).val(childContent.DI_Name);
                $(pageListObj).find(".standard-value").prop("id",childContent.SV_uid).val(childContent.SV_Name);
                // standard-value
                // console.log(childIndex,childContent)
                $(pageListObj).appendTo( $(pageBorderObj).find(".item-list") );
              });
              $(pageBorderObj).appendTo($("#modifyDialog").find("#table-totalContent"));
            });
            $("#table-totalContent").find(".qcTableItem").last().removeClass("list-items-bottom");
            // 放入結束
          });
          // 內匡樣式結束

        });
        // 外匡樣式結束

      }
    });
  }
}

// 修改Dialog
function openModifyDialog(uid, name){
  $("#insertDialog").remove();
  $("#myModal").remove();
  // console.log(uid);
  // return;
  $("#modifyDialog").remove();
  var modifyDialog = $("<div>").prop("id","modifyDialog");
  modifyDialog.appendTo("body");
  
  $("#modifyDialog").bsDialog({
    title: "修改 "+name+" 自檢表",
    modalClass:"bsDialogWindow",
    start: function(){
      var option = {styleKind:"qc_table",style:"table_insert_style"};

      getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);
        insertPageObj = $("<div>").html(insertPageObj);
        $(insertPageObj).find(".insertItem").remove();
        $(insertPageObj).find("#titleID").val(uid);
        // console.log(insertPageObj);
        $("#modifyDialog").find(".modal-body").html(insertPageObj);
        $("#modifyDialog").bsDialog("show");
        // getQCTableTypeList("tableTypeTab","tableType",true);
        // console.log(uid);
        getQCTableModifyContent(uid);
      });
    },
    button:[
      {
        text:"儲存",
        className: "btn-success",
        click: function(){
          saveModifyQCTable();
        }
      },
      {
        text: "取消",
        className: "btn-default-font-color",
        click: function(){
          $("#modifyDialog").bsDialog("close");
        }
      },
    ]
  });
}

//修改
function saveModifyQCTable(){
  var selectTableObj = getUserInput("selectTableItem");
  // console.log(selectTableObj);

  var tableTitle,
    TitleUid,
    MyContent=[];
  TitleUid = $("#modifyDialog").find("#titleID").val();
  

  $("#modifyDialog").find("#table-totalContent").find(".qcTableItem").each(function(){
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
      checkListID:TitleUid,
      cnt:MyContent
    };
  // console.log(sendObj);
  // return;
    // return;
  $.post(QCAPI + "UpdateEmptyCheckList",sendObj,function(){
    $("#modifyDialog").bsDialog("close");
    getQCTableTypeList("totalTableTypeTab","totalTableType");
  });
  // console.log(sendObj);
}
