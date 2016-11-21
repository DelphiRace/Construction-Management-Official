
$(function() {  
  loader("title","content-loading-img-in");
  $.getJSON(configObject.QCGetData+"?type=title", function( data ) {
   //console.log(data['name']);
   $('#title').html(data['name']);
  });
  //日期選單
  $.getJSON(configObject.QCGetData,{type:"getDateList",ptype:1}, function( data ) {
    var dSelectObject = '<option value=0>請選擇</option>';
    $("#d_select").empty();
    // console.log(data);
    var firstVal = "0";
    if(data.status){
      $.each(data, function( i, val ) {
        if(i==0){
          firstVal = val['datef'];
        }
       dSelectObject += '<option value='+val['datef']+'>'+val['datef']+'</option>';
      });
    }
    $(dSelectObject).appendTo("#d_select");
    $("#d_select").val(firstVal);
    setView(firstVal);
  });
  //日期選單改變時，變換事件
  $("#d_select").change(function(){
    setView($(this).val());
  });
});  
function setView(d_list){
  var sLimit = 0;
  var eLimit = 1;
  itemFade("imgLoader",true);
  //先取得樣式，然後開始塞資料
    $.getJSON(configObject.QCGetData,{type:"qc_checklist",sLimit:sLimit,eLimit:eLimit,datel:d_list}, function( data ) {
      
      if(data.status){
        $.post(configObject.qcPhotoListStyle,data,function(rs){
          rs = $.parseJSON(rs);
          $("#photolist").empty().html(rs.photoList);
          itemFade("imgLoader",false);
        });
        

      }else{
        $("#photolist").empty().html("無資料");
        itemFade("imgLoader",false);
      }
      
      //console.log(rs);
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
