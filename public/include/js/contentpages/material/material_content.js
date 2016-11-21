$(function(){
  //初始頁面
   setView();
});
var purchaseImg = {};
var nowPhoto = 1;
//初始化內容或者更新頁面內容
function setView(){
  //getContent("list","getlisthtml","tbList");
  $("#tbList").empty();
  var data;
  $.getJSON(configObject.MaterialGetData,{type:"list"}, function( rs ) {
    data = rs;
  }).done(function(){
    // console.log(Object.size(data));
    $.get("pages/style/material/list_content.html",function(pages){
      var title = $.parseHTML(pages);
      title = $(title).find(".list_title");
      $(title).appendTo("#tbList");
      //console.log($(totalPages));
      if(Object.size(data)){
        var countNO = 1;
        $.each(data,function(i,v){
          var content = $.parseHTML(pages);
          content = $(content).find(".list_content");
          $(content).find(".numbers").html(countNO);
          $(content).find(".uid").html("AA0000"+v.uid);
          $(content).find(".ma_name").html(v.ma_name);
          $(content).find(".count").html(v.count);
          $(content).find(".datep").html(v.datep);
          $(content).find(".ofstatus").html(v.ofstatus);
          $(content).find(".viewInfos").click(function(){
            showinfo(v.uid);
            return false;
          });
          countNO++;
          $(content).appendTo("#tbList");
        });
      }
    });
  });
}

//說明:呼叫api取得資料,丟入cmaction回傳html內容使用的function
//傳入： apTpye:getdata內switch的type 若有參數則在apType直接增加 如： page&uid=1
//      cmAction:處理資料的Action 
//      setDiv:html回傳後要放入的div
function getContent(apType,cmAction,setDiv){
  $.getJSON(configObject.MaterialGetData+"?type="+apType, function( rs ) {
     console.log(rs);
    $.ajax({
      url: "/material/"+cmAction,
      type: "POST",
      data: {data:rs},
      async:false,
      success: function(rs){

        $("#"+setDiv).empty().append(rs);
      }
    });
  });
}

//確認按鈕
function infocheck(){
  $.ajax({
    url: configObject.MaterialModify,
    type: "POST",
    data: {type: "chkorder", id:$("#inp_uid").val()},
    async:false,
    success: function(rs){
      alert('送出訂單！');
      //成功會寄出email
      var thisListUID = $("#inp_uid").val();
      sendemail(thisListUID);
      showinfo(thisListUID);
      setView();
    },
    error: function(e){
      alert('儲存失敗！');
    }
  });
  //成功後刷新頁面
  
}

//寄出email給廠商 
//傳入 uid:申請id 
function sendemail(uid){
  $.get(configObject.MaterialGetData+"?type=chkinfo&uid="+uid, function( data ) {
    $.ajax({
      url: "/material/sendemail",
      type: "POST",
      data: {data:JSON.parse(data)},
      async:false,
    });
  });
}

//進場按鈕
function infoin(){
  //設定參數
  var arr = [];
  arr.push({ type: 1, dataid: $("#inp_uid").val(),date:$("#inp_date").val() });
  $.ajax({
    url: configObject.MaterialModify,
    type: "POST",
    data: {type:"chkin",
      id:$("#inp_uid").val(),
      count:$("#inp_count").val(),
      quid:$("#inp_quid").val()
    },
    async:false,
    success: function(rs){
      //進場後傳入qc
      send_qclist(arr);
      alert('確認進場!');
      showinfo($("#inp_uid").val());
      //成功後刷新頁面
      setView();
    },
    error: function(e){
      alert('儲存失敗！');
    }
  });
  
}

//傳入qc列表
//arr 可多筆
function send_qclist(arr){
  $.ajax({
    url: configObject.QCInsert,
    type: "POST",
    data: {type:"qc_checklist",arr:arr},
    async:false,
  });
}

//查看按鈕
function showinfo(uid){
  //傳入uid 將html 塞入dialog div內
  loader("dialog","content-loading-img-in");
  var data;
  $.getJSON(configObject.MaterialGetData,{type:"chkinfo",uid:uid}, function( datas ) {
    data = datas;
  }).done(function(){
    $.get("pages/style/material/list_info.html",function(rs){
      var content = $.parseHTML(rs);
      if(data.check){
        if(data.datein){
            $(content).find("#btn_in,#btn_check").remove();
        }else{      
            $(content).find("#btn_check,#btn_purchase").remove();
        }
      }else{
        $(content).find("#btn_in,#btn_purchase").remove();
      }
      $.each(data,function(i,v){
        $(content).find("#inp_"+i).val(v);
        $(content).find("#"+i).html(v);
      });
      if(!data.imgfile){
        if(!data.datein){
          $(content).find("#purchaseInfo_content").html("暫無資料");
        }else{
          //放入申請提醒
          $(content).find("#withUserInputCount").html(data.count);
          
          //啟動相機
          $(content).find("#startCamera").click(function(){
            purchaseImg["canvas"+nowPhoto] = null;
            cameraPlay('video');
            $("#makePhoto").show();
            $(this).hide();
            //取得樣式
            $.get("pages/style/material/purchase_style.html",function(pages){
              var content = $.parseHTML(pages);
              $(content).prop("id","purchase"+nowPhoto).find(".canvas").prop("id","canvas"+nowPhoto);
              $(content).find("#purchase_count").keyup(function(){
                toShowInputCount();
              });
              $(content).appendTo("#uploadGroups");
            });
          });
          //開始拍照與新增到列表中
          $(content).find("#makePhoto").click(function(){
            $("#startCamera").show();
            $(this).hide();
            camera2photo("canvas"+nowPhoto,'video');
            $("#video").show();
            $("#canvas"+nowPhoto).show();  
            purchaseImg["canvas"+nowPhoto] = getCameraPhoto("canvas"+nowPhoto);
            nowPhoto++;
            //console.log(purchaseImg);
          });
        }
      }else{
        //清空，準備放入照片列表
        $(content).find("#purchaseInfo_content").empty();
        //取得照片資料
        var imgData;
        $.getJSON(configObject.getPurchaseImg,{uid:data.uid},function(rs){
          //console.log(rs);
          imgData = rs;
        }).done(function(){
          //取得樣式
            $.get("pages/style/material/purchase_content_style.html",function(pages){
              //放入
              if(imgData.status){
                $.each(imgData.imgMemo,function(i,v){
                  var content = $.parseHTML(pages);
                  $(content).find("img").prop("src",imgData.imgs["img"+i]);
                  $(content).find("#purchase_number").html(v.purchase_number);
                  $(content).find("#purchase_count").html(v.purchase_count);
                  $(content).appendTo("#purchaseInfo_content");
                });
              }
            });
        });
      }
      //清空
      $("#dialog").empty();
      $(content).appendTo("#dialog")
      .find(".list_tabs li a").click(function(){
        var contentID = $(this).prop("id") + "_content";
        $(content).find(".list_tabs li").removeClass("active");
        $(this).parent().addClass("active");
        $(content).find(".tab_content").hide();
        $(content).find("#"+contentID).show();
        return false;
      });

    });
  });
  //顯示dialog
  //$('#dialog').css({display:'inline'});
  $("#dialog").dialog({
      title: '資料',
      bgiframe: true,
      height: 460,
      width: '80%',
      modal: true,
      draggable: true,
      resizable: false,
      overlay:{opacity: 0.7, background: "#FF8899" },
      position:{ my: "top+50", at: "top+50", of: window }
  });
  purchaseImg = {};
  nowPhoto = 1;
}

function showApplyList(){
  $("#apply_material").toggle("blind",500);
}

function purchaseUpload(){
  var uid = $("#inp_uid").val();
  var photoCount = 0;
  var option = {uid:$("#inp_uid").val(),img_txt:""};
  var tmpObject = {};
  var allInput = true;
  $("#uploadGroups").find(".userInput").each(function(){
    if($(this).val() == ""){
      allInput = false;
      $(this).addClass("item-bg-danger");
    }else{
      $(this).removeClass("item-bg-danger");
    }
  });
  if(!allInput){
    alert("尚有數值未填寫");
  }else{
    $.each(purchaseImg,function(i,v){
      if(v){
        option.img_txt += v + "[||]";
        tmpObject[photoCount] = getUserInput( "purchase"+ i.replace("canvas","") );
        photoCount++;
      }
    });
    if(photoCount == 0){
      alert("請至少拍一張進貨單後上傳");
    }else{
      option.img_txt = option.img_txt.substr("0",option.img_txt.length-4);
      option.purchaseContent = tmpObject;
      var userID;
      //取得使用者資訊
      $.getJSON(configObject.getAcInfo,{},function(rs){
        userID = rs.uuid;
      }).done(function(){
        option.uuid = userID;
        //console.log(option);
        $.post(configObject.makePurchaseImg,option,function(result){
          var thisResult = $.parseJSON(result);
          if(thisResult.status){
           setView();
           showinfo(uid);
          }
        });
      });
      
    }
  }
  //console.log(uid);
}

function delPurchase(object){
  var thisObject = $(object).parent().parent().find(".canvas").prop("id");
  $(object).parent().parent().remove();
  delete purchaseImg[thisObject];
  toShowInputCount();
  //console.log(purchaseImg);
}

function toShowInputCount(){
  var count = 0;
  $("#uploadGroups").find(".userInput").each(function(){
    if($(this).prop("id") == "purchase_count"){
      count += parseFloat( $(this).val() );
      console.log($(this).val());
    }
  });
  var theLast = parseFloat($("#inp_count").val()) - count;
  $("#dialog").find("#withUserInputCount").html(theLast);
}