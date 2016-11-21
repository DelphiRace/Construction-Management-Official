// 取得範本相關
function getQCTemplate(){
  $("#table-template").empty();
  selectOptionPut("table-template","null","請選擇範本");
  var typeId = $("#tableType").val();
  // console.log(typeId);
  $.getJSON(QCAPI + "GetTempTitle",{typeId:typeId},function(rs){
    // console.log(rs);

    if(rs.Status){
      // console.log(rs);
      // var optionStr = '';
      $.each(rs.Data,function(index,content){
        selectOptionPut("table-template",content.Uid,content.Name);
        
      });
    }
  });
}

// 取得總表內容
function getQCTotalTableList(showArea){
  $("#"+showArea).empty();
  // selectOptionPut("titleID","null","請選擇自檢表");
  // $.getJSON(QCAPI + "GetTitle",function(rs){
  var typeId = $("#totalTableType").val();
  $.getJSON(QCAPI + "GetEmptyList",{typeId:typeId},function(rs){
    // console.log(rs);

    if(rs.Status){
      var option = {
        styleKind:"list",
        style:"1grid-modify"
      }
      getStyle(option, function(tableListStyle){

          $.each(rs.Data,function(index,content){
              var tableList = $.parseHTML(tableListStyle);
              $(tableList).addClass("listContent");
              $(tableList).find(".list-items").eq(0).html(content.Name);
              // 編輯按鈕
              $(tableList).find(".fa-pencil-square-o").click(function(){
                  // console.log(content.uid);

                openModifyDialog(content.Uid,content.Name);
              });
              // 刪除按鈕
              $(tableList).find(".fa-trash-o").click(function(){

                var tabAreaObj = $(this).parents(".listContent").parent();
                $(this).parents(".listContent").remove();

                if(!tabAreaObj.find("div").length){
                  putDataEmptyInfo(tabAreaObj);
                }

                var sendData = {
                  apiMethod: QCDeleteAPI+"DeleteEmptyCheckList",
                  deleteObj:{
                    checkListID: content.Uid
                  }
                }
                $.post(configObject.deleteAPI,sendData);
              });
              // selectOptionPut("titleID",content.Uid,content.Name);
              $(tableList).appendTo("#"+showArea);
          });
          // console.log($("#"+showArea).find(".listContent").last());
          $("#"+showArea).find(".listContent").last().removeClass("list-items-bottom");

      }); 
    }else{
      var option = {styleKind:"system", style: "data-empty"}
      getStyle(option,function(emptyPage){
        $("#"+showArea).html(emptyPage);
      });
    }

  });
}

// 取得標題相關內容
function getQCTableTitleList(showArea, API, typeID){
  // console.log(API);
  $("#"+showArea).empty();
  // selectOptionPut("titleID","null","請選擇自檢表");
  // $.getJSON(QCAPI + "GetTitle",function(rs){
  // if(API == "GetEngSingleList"){
  //   API = QCAPI + API;
  //   option = {type:"c"};
  // }else{
  //   API = qcMaterielAPI + API;
  //   option = {};
  // }
  API = QCAPI + API;
  var option = {
    typeId: typeID
  }
  $.getJSON(API,option,function(rs){
    console.log(rs);

    if(rs.Status){
      // console.log("T");
        getTableListStyle(function(tableListStyle){

            $.each(rs.Data,function(index,content){
                var tableList = $.parseHTML(tableListStyle);
                $(tableList).find(".table-name").html(content.name);
                $(tableList).find(".edit-btn").click(function(){
                    content.uid;
                    // console.log(content.uid);
                    openDialog(content.name, content.uid);
                });
                // selectOptionPut("titleID",content.Uid,content.Name);
                $(tableList).appendTo("#"+showArea);
            });
            $("#"+showArea).find(".listContent").last().removeClass("item-border-bottom");

        });
      
    }

  });
}

function getQCTableTypeList(objectID,typeValID,isInsert){
  if(typeof isInsert == "undefined"){
    isInsert = false;
  }
  $("#"+objectID).empty();
  $.getJSON(QCAPI + "GetCheckListType",function(rs){
    // console.log(rs);

    if(rs.Status){
      
      // var optionStr = '';
      $.each(rs.Data,function(index,content){
        // selectOptionPut("tableType",content.Uid,content.Name);
        var liItem = $.parseHTML("<li>");
        var tabBtnItem = $.parseHTML("<a>");
        var tabContentItem = $.parseHTML("<div>");

        $(tabContentItem).addClass("col-xs-12 col-md-12 item-display-n "+objectID+"-tab-content")
        .prop("id",objectID+"-"+content.Uid+"-content");

        if(!isInsert){
           $(tabContentItem).addClass("tab-border");
        }

        $(tabBtnItem).prop("href","#")
        .prop("id",objectID+"-"+content.Uid)
        .html(content.Name).click(function(){
          $("#"+typeValID).val(content.Uid);
           // console.log(isInsert);
          if(isInsert){
            // console.log("T");
            // var API = "GetEngSingleList";
            // if(content.Uid == 1){
            //   API = "getMaterielList";
            // }
            var API = "GetTitle";
            getQCTableTitleList(objectID+"-"+content.Uid+"-content", API, content.Uid);
          }else{
            getQCTotalTableList(objectID+"-"+content.Uid+"-content");
          }
        });

        $(liItem).attr("role","presentation")
        .append(tabBtnItem)
        .appendTo("#"+objectID);

        $("#"+objectID).after(tabContentItem);
        if(index == 0){
          $("#tableType").val(content.Uid);
        }

      });
      //tab事件
      tabCtrl(objectID);
      // 第一個增加選取ＣＬＡＳＳ和點擊
      $("#"+objectID).find("li").first().addClass("active")
      .find("a").click();

      // getQCTableTitleList();

    }
  });
}

// 頁面列表樣式
function getTableListStyle(callback){
  // console.log(tableDataObj);
  $.get("pages/style/qc_table/table_listContent_style.html").done(function(pageList){
    callback(pageList);
  });
}

// 取得最外匡的樣式
function thisBorderStyle(callback){
  var option = {styleKind:"qc_table",style:"item_borderContent_style"};
  getStyle(option, function(data){
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

function addContent(){
  // 取得最外匡的樣式
  thisBorderStyle(function(pageBorder){
    $(".startEmptyData").remove();
    var pageBorderObj = $.parseHTML(pageBorder);
    $(pageBorderObj).appendTo("#table-totalContent");

    $("#table-totalContent").find(".qcTableItem").removeClass("list-items-bottom").addClass("list-items-bottom").last().removeClass("list-items-bottom");

    var pOffset = $(pageBorderObj).offset();
    $("#modifyDialog").scrollTop(pOffset.top);
    $("#myModal").scrollTop(pOffset.top);
  });
  // 外匡樣式結束
}

function addListContent(object){
  // console.log(object.parents(".contents"));

  var object = object.parents(".qcTableItem").find(".item-list");
  // console.log(object);
  // 取得內匡的樣式
    getListStyle(function(pageList){
      var pageListObj = $.parseHTML(pageList);
      $(pageListObj).appendTo(object);
      var pOffset = $(pageListObj).offset();
      $("#modifyDialog").scrollTop(pOffset.top);
      $("#myModal").scrollTop(pOffset.top);
      // console.log($(pageListObj),$(pageListObj).offset());
    });
  // console.log(object);
}

function removeTotalItem(object){
  object.parents(".qcTableItem").remove();
}

function removeItem(object){
  object.parent().parent().parent().remove();
}

//套用範本
function getQCTableTitleContent(){
  var titleID = $("#titleID").val();
  var tableTemplate = $("#table-template").val();

  if(titleID != "null" && tableTemplate != "null"){
    // 放入標題
    var tableTitle = $("#tableTitleName").val();
    $("#qc_table_title").prop("readonly",true).val(tableTitle);

    $("#table-totalContent").empty();
    $.getJSON(QCAPI + "GetTemplate", {tempTitleID:tableTemplate}, function(rs){
      // console.log(rs);
      if(rs.Status){

        var tableDataObj = processTableData(rs.Data);
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
              
              $(pageBorderObj).appendTo("#table-totalContent");

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

// 套用項目範本
function QCItemCheckSelect(object){
  var checked = object.prop("checked");

  object = object.parent().parent().parent().parent();
  // console.log(object);
  if(checked){
    object.find(".item-title").hide();
    object.find(".qcItemSelect").show();
  }else{
    // console.log(checked);
    object.find(".item-title").show();
    object.find(".qcItemSelect").hide();
    object.find(".qcItemSelect").val("null");
    object.find(".item-list").find(".qcDetialItem").remove();
  }
  // console.log(checked);
}

function QCItemSelect(object){
  var itemID = object.val();
  object = object.parents(".qcTableItem");
  object.find(".item-list").find(".qcDetialItem").remove();
  if(itemID != "null"){
    putQCItemSelect( object, itemID );
  }
}

//放入套用項目範本
function putQCItemSelect(object,itemID){
  $.getJSON(QCAPI + "GetDetialItem",{itemID:itemID}).done(function(DIItem){
    // console.log(DIItem);
    // // 取得內匡的樣式
    getListStyle(function(pageList){

        $.each(DIItem.Data,function(childIndex,childContent){
          // console.log(childContent);
          var pageListObj = $.parseHTML(pageList);
          $(pageListObj).addClass("qcDetialItem");
          // $(pageListObj).find(".item-list-title").prop("id",childContent.DetialItem.Uid).val(childContent.DetialItem.Name).prop("readonly",true);
          $(pageListObj).find(".item-list-title").prop("id",childContent.Uid).val(childContent.Name).prop("readonly",true);
          // $(pageListObj).find(".standard-value").prop("id",childContent.SV_uid).val(childContent.SV_Name);
          // $(pageListObj).find(".standard-value").prop("id",childContent.StdVal.Uid).val(childContent.StdVal.Name).prop("readonly",true);
          // $(pageListObj).find(".standard-value").prop("id",childContent.StdVal.Uid);
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

// 項目-縮合功能
function hideContents(object){
  var iconObj = object;
  object = object.parents(".qcTableItem");
  var option = {
    effect: "blind",
    duration: 500,
    complete: function(){
      var status = $(this).css("display");
      var aplyQCItemSelect = object.find(".aplyQCItemSelect").prop("checked");
      if(status == "none"){
        iconObj.removeClass("fa-sort-up").addClass("fa-sort-down");
        var putText = "尚未輸入項目標題";
        if(aplyQCItemSelect){
          putText = object.find(".qcItemSelect option:selected").text();
        }else{
          var tmpPutText = object.find(".item-title").val();
          if(tmpPutText){
            putText = tmpPutText;
          }
        }
        object.find(".titleShow").html(putText);
      }else{
        iconObj.removeClass("fa-sort-down").addClass("fa-sort-up");
        object.find(".titleShow").empty();
      }
    }
  }
  object.find(".media").toggle( option );
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