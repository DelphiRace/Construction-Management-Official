
$(function(){
  getQCTableTypeList();
});

var QCAPI = configObject.WebAPI + "/QC/waCheckList/api/CheckList/";

// 取得標題相關
function getQCTableTitleList(){
  $("#titleID").empty();
  selectOptionPut("titleID","null","請選擇自檢表");
  var typeId = $("#tableType").val();
  $.getJSON(QCAPI + "GetEmptyList",{typeId:typeId},function(rs){
    console.log(rs);

    if(rs.Status){
      
      // var optionStr = '';
      $.each(rs.Data,function(index,content){
        selectOptionPut("titleID",content.Uid,content.Name);
        
      });
    }
  });
}

function getQCTableTypeList(){
  
  selectOptionPut("tableType","null","請選擇自檢表類別");
  $.getJSON(QCAPI + "GetCheckListType",function(rs){
    // console.log(rs);

    if(rs.Status){
      
      // var optionStr = '';
      $.each(rs.Data,function(index,content){
        selectOptionPut("tableType",content.Uid,content.Name);
        
      });
      selectOptionPut("titleID","null","請選擇自檢表");
      $("#tableType").unbind("change").change(function(){
        if($(this).val() != "null"){
          getQCTableTitleList();
        }
      });
     
    }
  });
}

// 頁面樣式
function getBorderStyle(callback){
  $.get("pages/style/qc_table/item_borderContent_style.html").done(function(data){
    // manipulation to get required data
    // var d = data;
    var tmpData = $.parseHTML(data);
    qcItemSelectContent(function(itemSelectContent){
      $("<option>").val("null").text("請選擇項目").appendTo($(tmpData).find(".qcItemSelect"));
      $.each(itemSelectContent.Data,function(i,content){
        $("<option>").val(content.Uid).text(content.Name).appendTo( $(tmpData).find(".qcItemSelect") );
      });
      data = $(tmpData)[0].outerHTML;
      // console.log(data);
      callback(data);
    });

  });
}

// 頁面列表樣式
function getListStyle(callback){
  // console.log(tableDataObj);
  $.get("pages/style/qc_table/item_list_style.html").done(function(pageList){
    callback(pageList);
  });
}

//項目選項
function qcItemSelectContent(callback){
  $.getJSON(QCAPI + "GetItem").done(function(data){
    callback(data);
  });
}

// 取得標題內容
// GET /api/CheckList/GetTemplate
function getQCTableTitleContent(){
  var selectTableObj = getUserInput("selectTableItem");
  
  if(selectTableObj.titleID != "null"){
    $(".qc-table-content").show();
    // 放入標題
    var tableTitle = $("#titleID :selected").text();
    $("#qc_table_title").html(tableTitle);

    $("#table-totalContent").empty();
    $.getJSON(QCAPI + "GetEmptyCheckList", {titleID:selectTableObj.titleID}, function(rs){

      if(rs.Status){

        var tableDataObj = processTableData(rs.Data.MyContent);
        // 取得最外匡的樣式
        getBorderStyle(function(pageBorder){
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
              $(pageBorderObj).appendTo("#table-totalContent");
            });
            // 放入結束
          });
          // 內匡樣式結束

        });
        // 外匡樣式結束

      }
    });
  }
}

function addContent(){
  // 取得最外匡的樣式
  getBorderStyle(function(pageBorder){
    var pageBorderObj = $.parseHTML(pageBorder);
    $(pageBorderObj).appendTo("#table-totalContent");
  });
  // 外匡樣式結束
}

function addListContent(object){
  var object = object.parent().parent().find(".item-list");
  // 取得內匡的樣式
    getListStyle(function(pageList){
      var pageListObj = $.parseHTML(pageList);
      $(pageListObj).appendTo(object);
    });
  // console.log(object);
}

function removeItem(object){
  object.parent().parent().remove();
}

//新增與修改
function saveQCTable(){
  var selectTableObj = getUserInput("selectTableItem");

  var tableTitle,
    TitleUid,
    MyContent=[];
  TitleUid = $("#titleID").val();
  

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
    console.log(MyContent);

  var sendObj = {
      checkListID:TitleUid,
      cnt:MyContent
    };
  $.post(QCAPI + "UpdateEmptyCheckList",sendObj);
  // console.log(sendObj);
}


// 套用項目範本
function QCItemCheckSelect(object){
  var checked = object.prop("checked");

  object = object.parent().parent().parent().parent();
  if(checked){
    object.find(".item-title").hide();
    object.find(".qcItemSelect").show();
  }else{
    object.find(".item-title").show();
    object.find(".qcItemSelect").hide();
    object.find(".qcItemSelect").val("null");
    object.find(".item-list").find(".qcDetialItem").remove();
  }
  // console.log(checked);
}

function QCItemSelect(object){
  var itemID = object.val();
  object = object.parent().parent();
  object.find(".item-list").find(".qcDetialItem").remove();
  if(itemID != "null"){
    putQCItemSelect( object.parent(), itemID );
  }
}

//放入套用項目範本
function putQCItemSelect(object,itemID){
  $.getJSON(QCAPI + "GetDetialItem",{itemID:itemID}).done(function(DIItem){
    // console.log(DIItem);
    // 取得內匡的樣式
    getListStyle(function(pageList){

        $.each(DIItem.Data,function(childIndex,childContent){
          var pageListObj = $.parseHTML(pageList);
          $(pageListObj).find(".item-list-title").prop("id",childContent.Uid).val(childContent.Name).prop("readonly",true);
          // $(pageListObj).find(".standard-value").prop("id",childContent.SV_uid).val(childContent.SV_Name);
          $(pageListObj).find(".standard-value").prop("readonly",true);
          // standard-value
          // console.log(childIndex,childContent)
          $(pageListObj).appendTo( object.find(".item-list") );
        });
      // 放入結束
    });
  });
}

function processTableData(data){
  var obj = {};
  $.each( data, function(index,content){
    if(typeof obj["uid_" + content.Item.Uid] == "undefined"){
      obj["uid_" + content.Item.Uid] = {};
      obj["uid_" + content.Item.Uid].uid = content.Item.Uid;
      obj["uid_" + content.Item.Uid].name = content.Item.Name;
      obj["uid_" + content.Item.Uid].child = [];
    }
      // console.log(content.DetialItem);
      var tmpObj = {
        DI_uid: content.DetialItem.Uid,
        DI_Name: content.DetialItem.Name,
        SV_uid: content.StdVal.Uid,
        SV_Name: content.StdVal.Name
      };
    obj["uid_" + content.Item.Uid]["child"].push(tmpObj);
    
    // console.log(content);
    
  });
  return obj;
  // console.log(obj);
}