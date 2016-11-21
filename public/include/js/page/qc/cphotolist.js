
$(window).scroll(function() { 
                
    if($(document).height() - $(window).height() - $(document).scrollTop() < 10) { 
        
        if(!imagesLoading) { 
            appendToMasonry(); 
        } 
        
    } 
    
});
$(function() {  

  $.get(configObject.QCGetData+"?type=title", function( data ) {
      data=JSON.parse(data);
      // console.log(data['name']);
      $('#title').html(data['name']);
  });
  setView(0); 
  $.get(configObject.QCGetData+"?type=getDateList&ptype=2", function( data ) {
    $("#d_select").empty().append('<option val=0>請選擇</option>');
    // console.log(data);
    data=JSON.parse(data);
    $.each(data, function( i, val ) {

        $("#d_select").append('<option val='+val['datef']+'>'+val['datef']+'</option>');
    })
  });

  $("#d_select").change(function(){
    setView($(this).val());
  });
});  
$( document ).ajaxStart(function() {
  $("#photolist").empty();
  $("#dialog").dialog({
              modal: true,
              height: 150,
              width: 200,
              zIndex: 999,
              resizable: false,
              title: "Please wait..."
      });
});
$( document ).ajaxStop(function() {
  setTimeout(function(){$( "#dialog" ).dialog("close");},500);
  
});


     

function setView(d_list){
   
  $.get(configObject.QCGetData+"?type=qc_checklist_c&datel="+d_list, function( data ) {
      data=JSON.parse(data);
      // 丟資料toCM回傳html內容
      $.ajax({
        url: "/qc/getcphotolisthtml",
       type: "POST",
       data: {data:data,apurl:apurl},
       async:false,
       success: function(rs){
        setTimeout(function(){ 
          $("#photolist").append(rs);
          $("#d_title").empty().append(data['date']);
         }, 500);
        
        
       },
       error: function(e){
       console.log(e);
            alert('儲存失敗！');
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