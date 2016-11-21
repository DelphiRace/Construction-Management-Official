$(function(){
  //初始頁面
    setView();
});

//初始化內容或者更新頁面內容
function setView(){
  $.get(configObject.SupplyGetData+"?type=sulist", function( rs ) {
    arr_data=JSON.parse(rs);
    if(arr_data['status']){
      $("#tb_list .title:last").empty();
      tb=$("#tb_list");
      console.log(arr_data)
      $.each(arr_data['data'],function(index,data){
        html="<tr><td>"+data['name']+"</td>";
        html+="<td>"+data['ename']+"</td>";
        html+="<td>"+data['taxid']+"</td>";
        html+="<td>"+data['owner']+"</td>";
        html+="<td><a href='javascript:showinfo("+data['uid']+");'>[查看]</a></td></tr>";
        tb.append(html);
      });
    }
  });
}

//說明:呼叫api取得資料,丟入cmaction回傳html內容使用的function
//傳入： apTpye:getdata內switch的type 若有參數則在apType直接增加 如： page&uid=1
//      cmAction:處理資料的Action 
//      setDiv:html回傳後要放入的div
function getContent(apType,cmAction,setDiv){
  $.get(configObject.SupplyGetData+"?type="+apType, function( rs ) {

    $.ajax({
      url: "/supply/"+cmAction,
      type: "POST",
      data: {data:JSON.parse(rs)},
      async:false,
      success: function(rs){
        $("#"+setDiv).empty().append(rs);
      }
    });
  });
}
//查看按鈕
function showinfo(uid){
  //傳入uid 將html 塞入dialog div內
  // getContent("getinfohtml","chkinfo","dialog");
      $.ajax({
      url: "/supply/getinfohtml",
      type: "POST",
      async:false,
      success: function(rs){
        $("#dialog").empty().append(rs);
      }
    });
  //顯示dialog
  $('#dialog').css({display:'inline'});
  $("#dialog").dialog({
     dialogClass: 'no-titlebar',
      bgiframe: true,
      height: 300,
      width: '80%',
      modal: true,
      draggable: true,
      resizable: false,
      overlay:{opacity: 0.7, background: "#FF8899" },

  });
   $( "#tabs" ).tabs();

}