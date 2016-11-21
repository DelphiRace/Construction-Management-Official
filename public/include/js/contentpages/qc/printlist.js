//設定載入的照片數量
var sLimitOrigin = 0;
var eLimitOrigin = 3;
var sLimit = sLimitOrigin;
var eLimit = eLimitOrigin;
var dynamicQuantity = 2;
var isLoadFinisg = false;
var waypoint;
var tmpTotal = 0;
var printTitleContentStyle;
var contentStyles;
var nowPutContent=0;
var maxPutContent=3;
var tmpTotalContent;
var thisPrintTitle;
var nowSelecDate;

//進度條
var progressbar = $( "#progressbar" ),
progressLabel = $( ".progress-label" );
$(function() {  

  $.get("pages/style/qc/printlist_content_title_style.html",function(rs){
    printTitleContentStyle = rs;
  }).done();

  //先取得樣式，然後開始塞資料
  $.get("pages/style/qc/printlist_content_style.html",function(rs){
    contentStyles = rs;
  }).done();

  $.getJSON(configObject.QCGetData+"?type=title", function( data ) {
   //console.log(data['name']);
   thisPrintTitle = data['name'];
  }).done();
  //日期選單
  $.getJSON(configObject.QCGetData,{type:"getDateList",ptype:1}, function( data ) {
    var dSelectObject = '<option value=0>無資料</option>';
    $("#d_select").empty();
    // console.log(data);
    var firstVal = "0";
    if(data.status){
      dSelectObject = "";
      $.each(data, function( i, val ) {
        if(i!="status"){
          if(i==0){
            firstVal = val['datef'];
          }
          dSelectObject += '<option value='+val['datef']+'>'+val['datef']+'</option>';
        }
      });
    }
    $(dSelectObject).appendTo("#d_select");
    nowSelecDate = firstVal;
    $("#d_select").val(nowSelecDate);
    getPrintPhotoCount(nowSelecDate);
    //console.log(total);
  }).done();
  //日期選單改變時，變換事件
  $("#d_select").change(function(){
    sLimit = sLimitOrigin;
    eLimit = eLimitOrigin;
    isLoadFinisg = false;
    tmpTotal = 0;
    setView($(this).val(),false);
    $(".select_date").html(firstVal);
  });

  progressbar.progressbar({
    value: false,
    change: function() {
      progressLabel.text( progressbar.progressbar( "value" ) + "%" );
    },
    complete: function() {
      progressLabel.text( "Complete!" );
    }
  });
  $("#div_print").hide();
  

  //setTimeout( progress, 2000 );
});  

function progress(nowVal,Total) {
  var percentage = (nowVal/Total)*100;
  //console.log(percentage);
  //var val = progressbar.progressbar( "value" ) || 0;
  var val = percentage;
  progressbar.progressbar( "value", percentage );
}

//取得總照片數量
function getPrintPhotoCount(date){
  var total = 0;
  $.getJSON(configObject.photocount,{datel:date},function(rs){
    total = parseInt(rs.count);
    //console.log(rs);
  }).done(function(){
    if(total == 0){
      $("#photolist").empty().html("無資料");
      itemFade("progressbar",false);
    }else{
      setView(date,true,total);
    }
    //console.log(total);
  });
}

function setView(d_list,notEmpty,total){
  // var printTitleContentStyle;
  // var contentStyles;
  // var nowPutContent=0;
  // var maxPutContent=3;
  // var tmpTotalContent;

  itemFade("progressbar",true);
  if(typeof notEmpty == "undefined"){
    notEmpty = true;
  }

  //先判斷是不是重新放置
  if(nowPutContent == 0){//是，將Title格式放入暫存
    tmpTotalContent = $.parseHTML(printTitleContentStyle);
  } 
  
  //取得照片內容
  $.getJSON(configObject.QCGetData,{type:"qc_checklist",sLimit:sLimit,eLimit:eLimit,datel:d_list}, function( data ) {
    //如果狀態是正常的，開始處理資料
    if(data.status){
      //console.log(data);
      var tmpContentStyle = contentStyles;
      var tmpObj = data.checklist;
      if(!notEmpty){
        $("#photolist").empty();
      }
      //開始處理
      $.each(tmpObj,function(i,v){
        if(nowPutContent == maxPutContent){//若以達到飽和，則放入
          $(tmpTotalContent).appendTo("#div_print");
          //再放入新的
          tmpTotalContent = $.parseHTML(printTitleContentStyle);
          nowPutContent = 0;
        }
        var tmpContent = tmpContentStyle.replace("@@orderform@@",setNumber(v.uid));
        tmpContent = tmpContent.replace("@@qcDate@@",v.datec);
        tmpContent = tmpContent.replace("@@material@@",v.ma_name);
        tmpContent = tmpContent.replace("@@qmaterial@@",v.count);
        tmpContent = tmpContent.replace("@@place@@",v.place);
        if(v.remark.length == 0 || v.remark == null){
          v.remark = "-";
        }
        tmpContent = tmpContent.replace("@@remark@@",v.remark);
        if(v.imgs != null){
          tmpContent = tmpContent.replace("@@imgSrc@@",v.imgs.img0);
        }else{
          tmpContent = tmpContent.replace("@@imgSrc@@","");
        }
        $(tmpTotalContent).find("#photolist").append(tmpContent);
        //累積已放入的數量
        nowPutContent++;
      });
      
      tmpTotal += dynamicQuantity;
      progress(tmpTotal,total);
      //loadWaypoints();
    }else{
      //全部Load完後，把未達最大放入數量的一併放入畫面中
      $(tmpTotalContent).appendTo("#div_print");
      //將現有的放入數量歸0
      nowPutContent = 0;
      isLoadFinisg = true;
    }
  }).done(function(){
    if(!isLoadFinisg){
      sLimit = eLimit;
      eLimit = eLimit+dynamicQuantity;
      setView(d_list,notEmpty,total);
    }else{
      $(".title").html(thisPrintTitle);
      $(".select_date").html(nowSelecDate);
      itemFade("progressbar",false);
      itemFade("div_print",true);
    }
  }); 

}

function print(){
    $("#div_print").printArea();
}

function save(){
    var Today=new Date();
　  tdate=Today.getFullYear().toString() + (Today.getMonth()+1)+ Today.getDate().toString() ;
    window.open('/logbook/savepdffile?url='+location.host+'/qc/photolist&name=photolist'+tdate);
    // window.close();
    // console.log('/logbook/savepdffile?url='+location.host+'/logbook');
}

//預覽列印
function viewprint(){
  loadPage("qc/printlist","pagescontent");

}

//預覽列印取消
function printCancel(){
  loadPage("qc/photolist","pagescontent");
}

//設定訂單編號
function setNumber(no){
  var max = 6;
  var tmpStr = "AA";
  no = no+"";
  var noLeng = max-no.length
  for(var i = 0; i < noLeng; i++){
    tmpStr += "0";
  }
  tmpStr += no;
  return tmpStr;
}