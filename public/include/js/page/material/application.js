$(function(){
  $.get(configObject.MaterialGetData+"?type=application", function( rs ) {
    data=JSON.parse(rs);
    // console.log(configObject.MaterialGetData+"?type=application");
    su_supply=data.su_supply;
    el_materiel=data.el_materiel;
    addoption("inp_prjuid",el_materiel);
    addoption("inp_supply",su_supply);
  });
  setView();
});


//加入option 選項 
//傳入 object:selectid
//    data:回傳ap資料陣列格式英文 uid:1,name:名字
function addoption(object,data){
  $("#"+object).empty();
  $("#"+object).append("<option value=0>請選擇</option>")
  $.each(data, function (index, d) {
    $("#"+object).append("<option value='"+this.uid+"'>"+this.name+"</option>");
  })
}

//選項連動
//傳入 aptype:要取得資料的aptype
//    inp:selectid
function changoption(aptype,inpid){
  $.get(configObject.MaterialGetData+"?type="+aptype, function( rs ) {
    data=JSON.parse(rs);
    addoption(inpid,data);
  });
}

//取得廠商資訊
function getsuinfo(suid){
  $.get(configObject.MaterialGetData+"?type=getsuinfo&suid="+suid, function( rs ) {
    data=JSON.parse(rs);
    info='';
    i=0;
    // console.log(data);
    $.each(data, function (index, d) {
      if(d!=null){
        i++;
        if(i % 3==1){
          info+="<tr width='100%'>";
        }
        info+="<td width='30%'>"+index+"："+d+"</td>";
        if(i % 3==0){
          info+="</tr>";
        }
      }
      })
    $("#info").empty().append(info);
  });
}

//初始化內容或者更新頁面內容
function setView(){
  //品項更改時
  $("#inp_prjuid").change(function() {
    //取得材料id
    var muid=$(this).val();
    //取得廠商id
    var suid=$("#inp_supply").val();
    if(suid==0){
      //當廠商無資料時 呼叫AP 取得有此品項的廠商列表
       changoption("getsupply&muid="+muid,"inp_supply");
    }else{
      //廠商有資料時
      //鎖定品項
      $("#inp_supply").prop('disabled', 'disabled');
      //傳入品項與廠商取得詳細資訊
      getlcount(muid,suid);
    }
  });

  //廠商更改時
  $("#inp_supply").change(function() {
    //取得品項id
    var muid=$("#inp_prjuid").val();
    //取得廠商id
    var suid=$(this).val();

    //傳入廠商id 取得廠商資訊
    getsuinfo(suid);
    if(muid==0){
      //當品項無在資料時,傳入廠商id回傳品項列表
      changoption("getmaterial&suid="+suid,"inp_prjuid");
    }else{
      //品項有資料時
      //鎖定廠商
      $("#inp_prjuid").prop('disabled', 'disabled');
      //傳入品項與廠商取得詳細資訊
      getlcount(muid,suid);
    }
  });

  //數量修改時自動計算剩餘數量
  $("#inp_quantity").change(function(){
    var  sum;
    sum=$("#hid_lcount").val()-$(this).val();
    sum=Math.round(sum*100);
    sum=sum/100;
    $("#inp_lcount").val(sum);
  });
  //初始日期
  $("#inp_date").datepicker({
      dateFormat: 'yy-mm-dd'
  });

}

//傳入品項id與廠商id 回傳數量資訊
function getlcount(muid,suid)
{

  $.get(configObject.MaterialGetData+"?type=lcount&suid="+suid+"&muid="+muid, function( r ) {
    r=JSON.parse(r);
    // console.log(r);
    lcount=Math.round(r['lcount']*100);
    lcount=lcount/100;
    $("#inp_lcount").val(lcount);
    $("#hid_lcount").val(lcount);
    $("#prj_mid").val(r['prjid']);
  });
}

//清除搜尋資訊
function clear(){
   location.reload();
}

//按下送出後
function chkinp(){

  var chk=true;
  var d='';
  d += 'type=el_petition&';

  //輸入input class都為cls_inp 當按下送出後檢查是否有值
  $( ".cls_inp" ).each(function( index ) {
    if($(this).val()==0 || $(this).val()==''){
      chk=false;
    }else{
      d += $(this).prop('id')+'='+$(this).val()+'&';
    }
  });

  d = d.substring(0,d.length-1);

  if(!chk){
    //資料缺少顯示資訊
    alert('資料不完整！');
  }else{
    //資料完整傳入新增ap
    $.ajax({
      url: configObject.MaterialInsert,
      type: "POST",
      data: d,
      async:       false,
      success: function(rs){
        //成功送出socket
        // console.log(rs);
        socket.emit('chatMsg', {'msg':'材料申請通知','uid':uuid,'name':userName});
        alert('新增成功！');
        clear();
      },
      error: function(e){
        alert('儲存失敗！');
      }
    });
  }
}