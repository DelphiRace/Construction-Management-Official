$(function(){
  //建立選單
  $.ajax({
    url: configObject.ReceiptGetData,
    type: "POST",
    data: { type: "supplyList" },
    dataType: "JSON",
    async: false,
    success:
      function(rs){
        if(rs.status){
          var supplyOption = createSelection(rs.data,"supply");
          //console.log(supplySelection);
          $("#supplySelection").append(supplyOption);
        }else{
          alert(rs.msg);
        }
      },
    error:
      function(e){
        console.log(e);
      }
  });

  //顯示表頭
  $.ajax({
    url: configObject.ReceiptGetData,
    type: "POST",
    data: { type: "companyTitle" },
    dataType: "JSON",
    async: false,
    success:
      function(rs){
        if(rs.status){
          $("#company_name").text(rs.data[0].val);
        }else{
          console.log(rs.msg);
        }
      },
    error:
      function(e){
        console.log(e);
      }
  });

  //顯示相關資料
  $("#supply").change(function(){
    // console.log($(this).val());
    //清除舊資料
    clearView();

    //塞入新資料
    if($(this).val()!=0){
      $.ajax({
        url: configObject.ReceiptGetData,
        type: "POST",
        data: { type: "detial", suid: $(this).val() },
        dataType: "JSON",
        success:
          function(rs){
            // console.log(rs.data);
            if(rs.status){
              //呈現資料
              setView(rs.data);    
            }else{
              console.log(rs.msg);
              clearView();
            }
          },
        error:
          function(e){
            console.log(e);
          }
      });
    }else{
      clearView();
      $("#receipt").hide();
      $("#option").css("visibility","hidden");
    }
  });

  //設定付款日期
  $("#date_pay").datepicker({
    dateFormat: 'yy/mm/dd'
  });
  var $date = new Date();
  var dateString = $date.getFullYear() + "/" + 
                   ($date.getMonth()<9?("0"+($date.getMonth()+1)):($date.getMonth()+1)) + "/" + 
                   ($date.getDate()<10?("0"+($date.getDate())):($date.getDate()));
  $("#date_pay").val(dateString);

});

function createSelection($dataArr,$id){
    var $Selection = $("<select/>").attr("id",$id);
    $("<option/>").attr("value", 0)
                  .text("-請選擇-")
                  .appendTo($Selection);
    $.each($dataArr,function(i,v){
      //console.log(i,v);
      $("<option/>").attr("value", v.uid)
                    .text(v.name)
                    .appendTo($Selection);
    });

    return $Selection;
}

function setView($dataArr){
  //console.log($dataArr);
  if(!$.isEmptyObject($dataArr.supplyInfo) && !$.isEmptyObject($dataArr.dateRange[0]) && !$.isEmptyObject($dataArr.price[0])){
    //廠商資料  
    setSupplyInfo($dataArr.supplyInfo);

    //付款資料
    setPaymentData($dataArr.dateRange[0], $dataArr.price[0]);

    //顯示資訊
    $("#receipt").show();
    $("#option").css("visibility","visible");
  }else{
    //清除資料
    clearView();

    //隱藏表格
    $("#receipt").hide();
    $("#option").css("visibility","hidden");
    alert("無資料");
  }
}

function getAddress($dataArr){
  //console.log($dataArr);
  $.each($dataArr,function(i,v){
    if(typeof(v)!="string"){
      $dataArr[i]="";
    }
  });
  //console.log($dataArr);
  return $dataArr.zip + $dataArr.city + $dataArr.area +
         $dataArr.vil + $dataArr.verge + $dataArr.road + $dataArr.addr;
}

function clearView(){
  //廠商
  $("#su_name").text("");
  $("#owner").text("");
  $("#zip").text("");
  $("#city").text("");
  $("#area").text("");
  $("#vil").text("");
  $("#verge").text("");
  $("#road").text("");
  $("#addr").text("");
  $("#tel_o").text("");
  $("#mobile").text("");
  $("#prjid_su").text("");

  //付款資料
  $("#dates").text("");
  $("#datee").text("");
  $("#price").text(""); 
}

function setSupplyInfo($dataArr){
  if(!$.isEmptyObject($dataArr)){
    $.each($dataArr[0],function(i,v){
      if(typeof(v)=="string"){
        $("#"+i).text(v);
      }
    });
  }
  $("#prjid_su").val($dataArr[0].prjid_su);
}

function setPaymentData($dateRange, $price){
  $.each($dateRange,function(i,v){
    if(typeof(v)=="string"){
      $("#"+i).text(v);
    }else{
      $("#"+i).text("");
    }
  });
  $.each($price,function(i,v){
    if(typeof(v)=="string"){
      $("#"+i).text(parsePrice(v));
    }else{
      $("#"+i).text("");
    }
  });
}



function showDetial(){
  //取消點擊
  // $("#detialList").attr('disabled','disabled');

  $.ajax({
      url: configObject.ReceiptGetData,
      type: "POST",
      data: { type: "detialList", suid: $("#supply").val() },
      dataType: "JSON",
      async: false,
      success:
        function(rs){
          if(rs.status){
            // console.log(rs);
            // if(!$.isEmptyObject(rs.data)){
            //     var nowP_modelid = rs.data[0].p_modelid;
            //     var countQty = 0, price = rs.data[0].price;
            //     $.each(rs.data,function(i,v){
            //       //console.log(i,v);
            //       if(nowP_modelid = v.p_modelid){
            //         countQty += parseFloat(v.qty);
            //       }else{
            //         countQty = parseFloat(v.qty);
            //       }

            //       // //總計欄位
            //       // if( nowP_modelid != v.p_modelid ){
            //       //   var countTr1 = $("<tr/>").attr("name","newTr");
            //       //   var countTr2 = $("<tr/>").attr("name","newTr");
            //       //   $("<td/>").text("單價").appendTo(countTr1);
            //       //   $("<td/>").text(price).appendTo(countTr1);
            //       //   $("<td/>").text("小計").appendTo(countTr1);
            //       //   $("<td/>").text(formatPrice(countQty,2)).appendTo(countTr1);
            //       //   $("<td/>").text("合計").appendTo(countTr2);
            //       //   $("<td/>").attr("colspan","3").text(parsePrice(countQty*price)).appendTo(countTr2);
            //       //   countTr1.appendTo($("#detial_list"));
            //       //   countTr2.appendTo($("#detial_list"));
            //       // }
            //       //基本欄位
            //       var $tr = $("<tr/>").attr("name","newTr");
            //       if(rs.typeid == 0){
            //         $("<td/>").text(v.n1+" "+v.n2+" "+v.n3+" "+v.n4).appendTo($tr);
            //       }else if(rs.typeid == 1){
            //         $("<td/>").text(v.name).appendTo($tr);
            //       }
            //       $("<td/>").text(v.unit1).appendTo($tr);
            //       $("<td/>").css("text-align","right").text(v.qty+" ").appendTo($tr);
            //       $("<td/>").text(v.sdate).appendTo($tr);                  
            //       $tr.appendTo($("#detial_list"));

            //       // price = v.price;
            //     });
            //     var countTr1 = $("<tr/>").attr("name","newTr");
            //     var countTr2 = $("<tr/>").attr("name","newTr");
            //     $("<td/>").text("單價: "+price).appendTo(countTr1);
            //     // $("<td/>").text(price).appendTo(countTr1);
            //     $("<td/>").text("小計").appendTo(countTr1);
            //     $("<td/>").text(formatNumber(countQty,2)).appendTo(countTr1);
            //     $("<td/>").text("合計").appendTo(countTr2);
            //     $("<td/>").attr("colspan","2").text(parsePrice(countQty*price)).appendTo(countTr2);
            //     countTr1.appendTo($("#detial_list"));  
            //     countTr2.appendTo($("#detial_list"));  
            //   }
            if(!$.isEmptyObject(rs.data)){
              var $countQty = 0;
              if(rs.typeid!=0){
                var $price = parseFloat(rs.data[0].p_price);
              }else{
                var $price = parseFloat(rs.data[0].price);
              }
              var $now_p_modelid = rs.data[0].p_modelid;
              
              //各筆資料欄位
              $.each(rs.data,function(i,v){
                var $tr = $("<tr/>").attr("name","newTr");
                if(rs.typeid == 0){
                  $("<td/>").attr("colspan","2").text(v.n1+" "+v.n2+" "+v.n3+" "+v.n4).appendTo($tr);
                }else if(rs.typeid == 1){
                  $("<td/>").attr("colspan","2").text(v.name).appendTo($tr);
                }
                $("<td/>").text(v.unit1).appendTo($tr);
                $("<td/>").css("text-align","right").text(v.qty).appendTo($tr);
                $("<td/>").text(v.sdate).appendTo($tr);                  
                $tr.appendTo($("#detial_list"));

                $countQty += parseFloat(v.qty);
              });

              //總計欄位
              var countTr1 = $("<tr/>").attr("name","newTr");
              var countTr2 = $("<tr/>").attr("name","newTr");
              $("<td/>").text("單價").appendTo(countTr1);
              $("<td/>").css("text-align","right").text($price+"元").appendTo(countTr1);
              $("<td/>").text("小計").appendTo(countTr1);
              $("<td/>").css("text-align","right").text(formatNumber($countQty,2)).appendTo(countTr1);
              $("<td/>").attr("colspan","2").text("合計").appendTo(countTr2);
              $("<td/>").css("text-align","right").attr("colspan","3").text(parsePrice($countQty*$price)+"元").appendTo(countTr2);
              countTr1.appendTo($("#detial_list"));  
              countTr2.appendTo($("#detial_list"));  

            }
          }else{
            var $tr = $("<tr/>").attr("name","newTr").appendTo("#detial_list");
            $("<td/>").attr("colspan","4")
                      .css("text-align","center")
                      .text("無資料")
                      .appendTo($tr);
            console.log("msg",rs.msg);
          }
        },
      error:
        function(e){
          console.log(e);
        }
    });
 
    $("#list").dialog({
    draggable: false,
    modal: true,
    width: $(window).width()*0.3,
    height: $(window).height()*0.4,
    position: { my: "center", at: "center", of: window },
    beforeClose: function(e,ui){
        //移除資料
        $("tr[name=newTr]").remove();
        //恢復點擊
        $("#detialList").removeAttr('disabled');
      }
  });
}

function checkSubmit(){
  var $dates, $datee, $amount, $prjid_su, $suid;
  $dates = $("#dates").text();
  $datee = $("#datee").text();
  $amount = $("#price").text();
  $amount = $amount.replace(",","");
  $prjid_su = $("#prjid_su").val();
  $suid = $("#supply").val();
  $date_pay = $("#date_pay").val();
  // console.log("dates:",$dates,"datee:",$datee,"amount:",$amount,"prjid_su:",$prjid_su,"suid:",$suid,"date_pay:",$date_pay);

  $.ajax({
    url: configObject.ReceiptInsertData,
    type: "POST",
    data: { 
            dates: $dates, 
            datee: $datee,
            amount: $amount,
            prjid_su: $prjid_su,
            suid: $suid,
            date_pay: $date_pay
          },
    dataType: "JSON",
    async: false,
    success:
      function(rs){
        location.reload();
        // console.log(rs);
     },
    error:
      function(e){
        console.log(e);
      }
  });
}

function parsePrice($price){
  $price = String(Math.round($price));
  var str = $price;
  for(var i=1, j=0; i<=Math.floor($price.length/3); i++,j++){
    str = str.substr(0,str.length-3*i-j) + "," + str.substr(str.length-3*i-j, str.length);
  }
  if($price.length%3==0){
    str = str.substr(1,str.length);
  }

  //str = formatNumber(str,2);

  return str;
}

function formatNumber($num,$pos){
  var $size = Math.pow(10, $pos);
  return Math.round($num * $size) / $size; 
}