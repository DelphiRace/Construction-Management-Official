$(function(){
  //初始頁面
   setView();
});

//初始化內容或者更新頁面內容
function setView(object){
  getContent("list","getlisthtml","tbList");
}

//說明:呼叫api取得資料,丟入cmaction回傳html內容使用的function
//傳入： apTpye:getdata內switch的type 若有參數則在apType直接增加 如： page&uid=1
//      cmAction:處理資料的Action 
//      setDiv:html回傳後要放入的div
function getContent(apType,cmAction,setDiv){
  $.get(configObject.MaterialGetData+"?type="+apType, function( rs ) {

    $.ajax({
      url: "/material/"+cmAction,
      type: "POST",
      data: {data:JSON.parse(rs)},
      async:false,
      success: function(rs){
        $("#"+setDiv).empty().append(rs);
      }
    });
  });
}


//確認按鈕
function infocheck(){
  //參數設定
  d= 'type=chkorder&id=';
  d+=$("#inp_uid").val();

  $.ajax({
    url: configObject.MaterialModify,
    type: "POST",
    data: d,
    async:false,
    success: function(rs){
      alert('送出訂單！');
      //成功會寄出email
      sendemail($("#inp_uid").val());
      $("#btn_check").hide();
      $("#btn_in").show();
    },
    error: function(e){
      alert('儲存失敗！');
    }
  });
  //成功後刷新頁面
  setView();
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
  d= 'type=chkin&id='+$("#inp_uid").val();
  d+='&count='+$("#inp_count").val();
  d+='&quid='+$("#inp_quid").val();
  var arr = [];
  arr.push({ type: 1, dataid: $("#inp_uid").val(),date:$("#inp_date").val() });
  $.ajax({
    url: configObject.MaterialModify,
    type: "POST",
    data: d,
    async:false,
    success: function(rs){
      //進場後傳入qc
      send_qclist(arr);
      alert('確認進場!');
      $("#btn_in").hide();
    },
    error: function(e){
      alert('儲存失敗！');
    }
  });
  //成功後刷新頁面
  setView();
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
  getContent("chkinfo&uid="+uid,"chkinfo","dialog");
  //顯示dialog
  $('#dialog').css({display:'inline'});
  $("#dialog").dialog({
      title: '資料',
      bgiframe: true,
      height: 300,
      width: '80%',
      modal: true,
      draggable: true,
      resizable: false,
      overlay:{opacity: 0.7, background: "#FF8899" },

  });
}