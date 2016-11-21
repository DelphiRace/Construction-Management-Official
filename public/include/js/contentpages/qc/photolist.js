//設定載入的照片數量
var sLimitOrigin = 0;
var eLimitOrigin = 3;
var sLimit = sLimitOrigin;
var eLimit = eLimitOrigin;
var dynamicQuantity = 2;
var isLoadFinisg = false;
var waypoint;
$(function() {  
  loader("title","content-loading-img-in");
  $.getJSON(configObject.QCGetData+"?type=title", function( data ) {
   //console.log(data['name']);
   $('#title').html(data['name']);
  });
  //日期選單
  $.getJSON(configObject.QCGetData,{type:"getDateList",ptype:2}, function( data ) {
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
    $("#d_select").val(firstVal);
    setView(firstVal);
  });
  //日期選單改變時，變換事件
  $("#d_select").change(function(){
    sLimit = sLimitOrigin;
    eLimit = eLimitOrigin;
    isLoadFinisg = false;
    setView($(this).val(),false);
  });
});  

function loadWaypoints(){
  if(typeof waypoint == "undefined"){
    waypoint = new Waypoint({
      element: document.getElementById('thisBottom'),
      handler: function(direction) {
        //console.log('Waypoint triggered in ' + direction + ' direction')
        if(!isLoadFinisg && direction == "down"){
          sLimit = eLimit;
          eLimit = eLimit + dynamicQuantity;
          setView($("#d_select").val());
        }
      },
      offset: 'bottom-in-view'
    });
  }else{
    Waypoint.refreshAll();
  }
}

function setView(d_list,notEmpty){

  itemFade("imgLoader",true);
  if(typeof notEmpty == "undefined"){
    notEmpty = true;
  }
  var contentStyles;
  //先取得樣式，然後開始塞資料
  $.get("pages/style/qc/list_content_style.html",function(rs){
    contentStyles = rs;
  }).done(function() {
    //取得照片內容
    $.getJSON(configObject.QCGetData,{type:"qc_checklist",sLimit:sLimit,eLimit:eLimit,datel:d_list}, function( data ) {
      //console.log(data);
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
          if(v.imgs != null && v.imgs != undefined){
            $.each(v.imgs, function(imgIndex, imgContent){
              var tmpContent = tmpContentStyle.replace("@@orderform@@",setNumber(v.uid));
              tmpContent = tmpContent.replace("@@qcDate@@",v.datec);
              tmpContent = tmpContent.replace("@@material@@",v.ma_name);
              tmpContent = tmpContent.replace("@@qmaterial@@",v.count);
              tmpContent = tmpContent.replace("@@place@@",v.place);
              if(v.remark.length == 0 || v.remark == null){
                v.remark = "-";
              }
              tmpContent = tmpContent.replace("@@remark@@",v.remark);
              
              tmpContent = tmpContent.replace("@@imgSrc@@",imgContent);
              // }else{
              //   tmpContent = tmpContent.replace("@@imgSrc@@","");
              // }
              $("#photolist").append(tmpContent);
            });
            
          }
          
        });
        itemFade("imgLoader",false);
        loadWaypoints();
      }else{
        if(sLimit == 0){
          $("#photolist").empty().html("無資料");
        }
        isLoadFinisg = true;
        itemFade("imgLoader",false);
      }
    });
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