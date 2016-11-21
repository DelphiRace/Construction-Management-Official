var SysCode;
$(function(){
  if(location.pathname.search("login.html") == -1){
    if(typeof checkUserLogin != "undefined" && typeof checkKeepItem != "undefined" && typeof firstLoadPage != "undefined" ){
    	checkUserLogin();
    	checkKeepItem();
    }
  }
});

//相關頁面轉換
function redirectPage(result){
  if(result.status){
        // configObject.processLoginUrl 舊版
        $.post(configObject.processLogin, result, function(rs){
          var rs = $.parseJSON(rs);
          if(rs.status){
            location.href = location.origin + "/content.html";
          }else{
            msgDialog(rs.msg);
          }
        });
  }else{
    msgDialog(result.error);
    showLoading(false);
  }
}

function showLoading(turn){
	//開始顯示Loading
	var id = "loading";
	if(turn){
		$("#"+id).remove();
		$('<div id="'+id+'" >')
		.prepend('<div class="ui-widget-overlay" style="z-index:500;">')
		.prepend('<img class="loading-img" src="include/images/loader.svg" style="z-index:600;">')
		.hide()
		.appendTo('body')
		.show("scale", { percent: 100 }, 400);
	}else{
		$("#"+id).hide("scale", { percent: 100 }, 1000,function(){
			$(this).remove();
		});
	}
}

function logoutEven(){
	$.ajax({
		url: configObject.Logout,
		type:"POST",
		async: false,
		success: function(rs){
			//location.href = location.origin;
			location.href = "login.html";
		}
	});
}

function setInputNumberOnly(){
  //只能輸入數字
  $(".inputNumberOnly").keypress(function(event){
    return event.charCode >= 48 && event.charCode <= 57;
  });
}

function getUserInput(objectID){
  var tmpObj = {};
  $("#"+objectID).find(".userInput").each(function(){
    var userInputType = $(this).prop("type");
    if( userInputType != "radio" && userInputType != "checkbox"){
      var id= $(this).prop("id");
      var value = $(this).val();
    }else{
      var id = $(this).prop("name");
      var value = $("[name="+id+"]:checked").val();
      if(value == undefined){
        value = null;
      }
    }
    if(typeof tmpObj[id] == "undefined"){
      tmpObj[id] = value;
    }
  });
  return tmpObj;
}

function itemFade(item,ctr){
  if(ctr){
    if(typeof item == "string"){
      $("#"+item).fadeIn(500);
    }else{
      $(item).fadeIn(500);
    }
  }else{
    if(typeof item == "string"){
      $("#"+item).fadeOut(500);
    }else{
      $(item).fadeOut(500);
    }
  }
}

function sendRequest(sendType,sendUrl,sendData,dataType,responsesType,responsesFunction){
  if(sendUrl.length > 0){
    sendType = sendType.toLowerCase();
    var contentType = null;
    if(dataType == "json"){
      //sendData = JSON.stringify(sendData);
      //contentType = "application/json";
      var headers = { Accept: 'application/json' };
    }
    $.ajax({
       url: sendUrl,
       type: sendType,
       data: sendData,
       headers: headers,
       dataType: responsesType,
       success: function(rs){
          if(typeof responsesFunction != "undefined"){
            window[responsesFunction](rs);
          }
           //console.log(rs);
       }
    });
  }else{
    console.log("sendUrl is Null");
  }
}

//處理WS回傳JSON塞在的XML內容
function processJsonInXml(xmlContent){
  return $.parseJSON($(xmlContent).find("string").text());
}

//iframe設定高
function iframeLoaded(iframeID) {
    var iFrameID = document.getElementById(iframeID);
    if(iFrameID) {
          // here you can make the height, I delete it first, then I make it again
          iFrameID.height = "";
          iFrameID.height = iFrameID.contentWindow.document.body.scrollHeight + "px";
    }   
}

//取得資訊
function porcessData(url, data, async, dataType){
    var result = '';
    if(typeof data === 'undefined'){
        data = {};
    }
    if(typeof async === "undefined"){
    	async = false;
    }
    if(typeof dataType === "undefined"){
    	dataType = "JSON";
    }
    if(typeof beforeFouction === "undefined"){
    	beforeFouction = {};
    }

    $.ajax({
       url: url,
       type: "POST",
       data: data,
       async: async,
       dataType: dataType,
       success: function(rs){
           //console.log(rs);
           if(rs.status){
               result = rs;
           }else{
               console.log(rs.msg);
           }
       }
    });
    return result;
}

//關閉dialog
function closeDialog(itemID){
  $("#"+itemID).dialog('close').remove();
}

//取得物件長度
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

// 選單放入選項
function selectOptionPut(selectID,putVal,putText){
  if(typeof selectID == "string"){
    if(selectID != "" && selectID.search("#") == -1){
      $("<option>").appendTo("#"+selectID).prop("value",putVal).text(putText);
    }
  }else{
    $("<option>").appendTo(selectID).prop("value",putVal).text(putText);
  }
}

function putEmptyInfo(putArea){
    // 畫面設定值
    var option = {styleKind:"system",style:"data-empty"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        // 相關設定
        putArea.append(pageStyle);
        putArea.find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}

// 訊息提示
function msgDialog(msg, isError, closeCallBack){
    // $("body").find(".msgDialog").remove();
    // if($("#msgDialog").length){
    //   return;
    //     // $("body").find(".modal-backdrop.fade.in").last().remove();
    // }
    var title = "訊息";
    if(isError == undefined){
      isError = true;
    }

    if(isError){
      title = "錯誤";
    }

    var msgDialog = $("<div>").addClass("msgDialog").appendTo("body");

    msgDialog.bsDialog({
        autoShow:true,
        showFooterBtn:true,
        title: title,
        start:function(){
            var msgDiv = $("<div>").html(msg);
            msgDialog.find(".modal-body").append(msgDiv);
        },
        button:[{
            text: "關閉",
            className: "btn-danger f-color-white",
            click: function(){
                msgDialog.bsDialog("close");
                if(closeCallBack != undefined){
                    closeCallBack();
                }
            }
        }
        ]
    });
}

// 訊息確認
function chooseDialog(msg, option){
    var defaultOption = {
      closeCall: function(){},
      sureCall: function(){},
      sureText: "確認",
      closeText: "取消",
      sureClass: "btn-success",
      closeClass: "",
      title: "提示訊息"
    };
    option = $.extend({}, defaultOption, option);

    // if($("#msgDialog").length){
        $("#chooseDialog").remove();
        // $("body").find(".modal-backdrop.fade.in").last().remove();
    // }
    $("<div>").prop("id","chooseDialog").appendTo("body");

    $("#chooseDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        title: option.title,
        start:function(){

            var msgDiv = $("<div>").html(msg);
            $("#chooseDialog").find(".modal-body").append(msgDiv);
        },
        button:[
          {
            text: option.closeText,
            className: option.closeClass,
            click: function(){
                $("#chooseDialog").bsDialog("close");
                if(typeof option.closeCall != "undefined"){
                    option.closeCall();
                }
            }
          },
          {
            text: option.sureText,
            className: option.sureClass,
            click: function(){
                $("#chooseDialog").bsDialog("close");
                if(typeof option.sureCall != "undefined"){
                    option.sureCall();
                }
            }
          },
        ]
    });
}

// 檔案下載的部分
jQuery.fileDownloader = function(url, sendObj){
    // Build a form
    var form = $('<form>').attr('action', url).attr('method', 'post').attr("target","_blank");
    // Add the one key/value
    if(sendObj != undefined){
      if(Object.size(sendObj) > 0){

        $.each(sendObj, function(index, value){
          var input = $("<input>").attr('type', 'hidden').attr('name', index).attr('value', value);
          form.append(input);
        });
      }
    }
    form.appendTo("body").submit().remove();

};


// 取得單筆資料
function getOnceData(uid, callback){
  var sendData = {
      api: calendarAPI+"GetToDoItem",
      data:{
          uid: uid,
          userId: userID,
      }
  };

  $.getJSON(wrsUrl, sendData).done(function(rs){
      if(rs.Status){
          // 畫面設定值
          var option = {styleKind:"calendar-list",style:"normal"};
          // 取得畫面樣式
          getStyle(option,function(pageStyle){
              callback(pageStyle, rs.Data);
          });
      }else{
          var area = (calendarType == 1)? "total-content":"systems-content";
          getCalendarData(calendarType,area);

      }
  }); 
}

// 確認輸入沒有空白
function checkInputEmpty(inputArea,option){
  // option
  // {
  //   without: [],
  //   emptyCall: function(element, id){}, //輸入為空的時候呼叫
  //   success: function(userInput){}, // 都沒有空直的時候呼叫
  // }
  var inputObj;
  if(typeof inputArea == "string"){
    inputObj = $("#"+inputArea);
  }else{
    inputObj = inputArea;
  }

  var defaultOption = {
      without:[],
      emptyCall: function(){},
      success: function(){}
    };
  option = $.extend({}, defaultOption, option);

  var isEmpty = false;
  $(inputObj).find(".userInput").each(function(){
    var id = $(this).prop("id");
    if( !$.trim($(this).val()) && $.inArray(id, option.without) == -1){
      isEmpty = true;
      $(this).addClass("item-bg-danger");
      option.emptyCall($(this), id);
    }else{
      $(this).removeClass("item-bg-danger");
    }
  });
  if(!isEmpty){
    var inputAreaID = $(inputObj).prop("id");
    var userInput = getUserInput(inputAreaID);
    option.success(userInput);
  }else{
    msgDialog("尚有未輸入資訊，請確認後再送出");
  }
}

// 取得頁面資料
function getPageListData(sendObj, callBack, dataOpenCallBack){
  $.getJSON(wrsUrl, sendObj).done(function(rs){
      var dataOpenParameter = null;
      if(location.hash != "" && dataOpenCallBack != undefined){
        dataOpenParameter = getHashParameter();
        dataOpenCallBack(dataOpenParameter);
      }
      callBack(rs, dataOpenParameter);
  });   
}

function arrayToObject(array){
    var object = {};
    $.each(array, function(index,content){
      object[index] = content;
    });
    return object;
}

// 日期運算
function dateCalculate(year, momth, day, dadd){
  var date = new Date(year, momth, day);
  date = date.setDate( day + dadd );
  date = new Date(date);

  return date;
}

// 排序

var asc = function(a, b) {
    return $(a).find(".list-items").eq(1).text() > $(b).find(".list-items").eq(1).text() ? 1 : -1;
}

var desc = function(a, b) {
    console.log(agg7777);
    return $(a).find(".list-items").eq(1).text() > $(b).find(".list-items").eq(1).text() ? -1 : 1;
}

var sortByContent = function(putArea,sortBy) {
    if(typeof putArea == "string"){
      var sortEle = $(putArea).find(".dataContent").sort(sortBy);
      $(putArea).find(".dataContent").remove();
      $(putArea).append(sortEle);
    }else{
      var sortEle = putArea.find(".dataContent").sort(sortBy);
      putArea.find(".dataContent").remove();
      putArea.append(sortEle);
    }
    var firstItem = $(putArea).find(".dataContent").first();
    var lastItem = $(putArea).find(".dataContent").last();
    if(firstItem.prop("class").search("list-items-bottom") == -1){
      firstItem.addClass("list-items-bottom");
    }
    if(lastItem.prop("class").search("list-items-bottom") != -1){
      lastItem.removeClass("list-items-bottom");
    }
}
// 取得檔案限制
function getFileLimit(sysCode, callback){
  var sendObj = {
    api:"FileUseSpace/GetData_FileUseSpace",
    threeModal:true,
    data:{
      sysCode:sysCode
    }
  }
  $.getJSON(wrsUrl,sendObj,function(rs){
    callback(rs);
  });
}

// 檔案單位轉換
function serverFileUnitTrans(LastSpace, time, Unit){
  if(time == undefined){
    time = 0;
  }
  if(time == 1){
    Unit = "M";
  }else if(time == 2){
    Unit = "K";
  }else if(time >= 3){
    Unit = "byte";
  }else if(time == 0){
    Unit = "G";
  }
  var tmpArr = {};
  
  if(LastSpace < 1){
    // console.log(LastSpace);
    
    LastSpace = LastSpace * 1000;
    // console.log(LastSpace);
    time++;
    LastSpaceArr = serverFileUnitTrans(LastSpace, time, Unit);
    LastSpace = LastSpaceArr.LastSpace;
    Unit = LastSpaceArr.Unit;
  }
  tmpArr.LastSpace = LastSpace;
  tmpArr.Unit = Unit;
  return tmpArr;
}

function clientFileUnitTrans(useSpace, Unit){

  switch(Unit){
    case "G":
      useSpace = useSpace / 1000 / 1000 / 1000;
    break;
    case "M":
      useSpace = useSpace / 1000 / 1000;
    break;
    case "K":
      useSpace = useSpace / 1000;
    break;
  }
  return useSpace;
}

function blockArea(toBlock, areaID){
  if(typeof area == "string"){
    var area = $("#"+areaID);
  }else if(typeof area == "object"){
    var area = areaID;
  }else{
    area = $("#main-wrapper");
  }
  if(toBlock == undefined){
    toBlock = true;
  }
  if(toBlock){
    area.block({message: null});
  }else{
    area.unblock();
  }
}

// 上傳用
function uploadBlockInfo(){
  $("body").find("#processFileUpload").remove();
  var progressBorder = $("<div>").prop("id","processFileUpload").addClass("processFileUpload");
  progressBorder.appendTo("body");
  $.blockUI({ 
      message: $("#processFileUpload"),
      onUnblock:function(){
          $("#processFileUpload").remove();
      } 
  });
}
