$(function(){
  $("#identity").val(userLoginInfo.userID);
  $.get(configObject.MaterialGetData+"?type=application", function( rs ) {
    data=JSON.parse(rs);
    // console.log(configObject.MaterialGetData+"?type=application");
    su_supply=data.su_supply;
    el_materiel=data.el_materiel;
    addoption("inp_prjuid",el_materiel);
    addoption("inp_supply",su_supply);
  });
  setView();
  // $.getJSON(configObject.getAcInfo,{},function(rs){
  //   $("#identity").val(userLoginInfo.userID);
  // });
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
  $.getJSON(configObject.getCompanyInfo,{suid:suid}, function( rs ) {
      if(rs.status){
        var data = rs.infoList;
        info='';
        i=0;
        // console.log(data);
        //對應索引字串
        var objectStr = {
          company:"公司名稱",
          uniform_numbers:"統一編號",
          pic:"負責人",
          address:"地址",
          contact:"聯絡人",
          contact_mobile:"聯絡人手機",
          contact_home_phone:"聯絡人住家市話",
          contact_company_phone:"公司市話",
          contact_company_phone_ext:"公司市話分機",
          contact_mail:"聯絡人email"
        };
        $.each(data, function (contentIndex, v) {
          if(v!=null){
            i++;
            if(i % 3==1){
              info+="<tr width='100%'>";
            }
            info+="<td width='30%'>"+objectStr[contentIndex]+"："+v+"</td>";
            if(i % 3==0){
              info+="</tr>";
            }
          }
        });
        $("#info").empty().append(info);
        itemFade("userSelectInfo",true);
      } 
  });
}

//初始化內容或者更新頁面內容
function setView(){
  //品項更改時
  $("#inp_prjuid").change(function() {
    var nowVal = $(this).val();
    if(nowVal != "0"){
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
        $("#inp_supply").prop('disabled', true);
        //傳入品項與廠商取得詳細資訊
        getlcount(muid,suid);
      }
    }
  });

  //廠商更改時
  $("#inp_supply").change(function() {
    var nowVal = $(this).val();
    if(nowVal != "0"){
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
        $("#inp_prjuid").prop('disabled',true);
        //傳入品項與廠商取得詳細資訊
        getlcount(muid,suid);
      }
    }
  });

  //數量修改時自動計算剩餘數量
  $("#inp_quantity").change(function(){
    var  sum;
    sum=$("#hid_lcount").val()-$(this).val();
    sum=Math.round(sum*100);
    sum=sum/100;
    $("#inp_lcount").html(sum);
  });
  //初始日期
  $("#inp_date").datepicker({
      dateFormat: 'yy-mm-dd',
      showOn: "button", 
      buttonText: '<i class="fa fa-calendar mouse-pointer"></i>',
      onSelect: function(){
        $("#inp_date_show").html($(this).val());
      }
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
    $("#inp_lcount").html(lcount);
    $("#hid_lcount").val(lcount);
    $("#prj_mid").val(r['prjid']);
  });
}

//清除搜尋資訊
function applyClear(){
  $("#inp_prjuid,#inp_supply,#hid_lcount").prop('disabled',false).val("0");
  $("#inp_lcount").html(0);
  $("#inp_quantity,#inp_date,#inp_place,#inp_mplace").val("");
}

//點選月曆按鈕
function clickCalendar(object){
  $(object).parent().find(".ui-datepicker-trigger").click();
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
        //socket.emit('chatMsg', {'msg':'材料申請通知','uid':uuid,'name':userName});
        alert('新增成功！');
        applyClear();
        getContent("list","getlisthtml","tbList");
      },
      error: function(e){
        alert('儲存失敗！');
      }
    });
  }
}

function listReset(){
  $("#apply_material").toggle("blind",500);
  applyClear();
}