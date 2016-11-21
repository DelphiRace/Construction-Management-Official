$(function(){
  getListContent();

});
//影印
function print(){
    $("#div_print").printArea();
}

function getLaborsafetyContent(){
  $.getJSON(configObject.logbookGetData,{type: "laborsafety"}, function( rs ) {    
    // console.log(rs);
    if(rs.dates == null){
      if(rs.fifth == null && rs.seventh == null){
        $("#isnew").val(1);
      }else{
        $("#isnew").val(0);
      }
      try{
        if(rs.fifth.contents != undefined){
          $("#fifth").val(rs.fifth.contents);
        }
        if(rs.seventh.contents != undefined){
          $("#seventh").val(rs.seventh.contents);
        }
      }catch(error){
        // console.log(error);
        if(rs.fifth != null){
          $("#fifth").val(rs.fifth.contents);
        }

        if(rs.seventh != null){
          $("#seventh").val(rs.seventh.contents);
        }

      }
      
    }else{
      $("#loadpageArea").html("主任已確認,資料無法再進行修改");
    }
  });
}

function getSetcontentContent(){
  $.getJSON(configObject.logbookGetData,{type:"setcontent"}, function( rs ) {    
    console.log(rs);
    var option = {
      styleKind: "logbook",
      style: "setcontent"
    }
    // 先取得列表內容樣式
    getPage(option, function(setcontentPageStyle){
      var option = {
        styleKind: "logbook",
        style: "construction"
      }
      getStyle(option,function(constructionStyle){

        var option = {
          styleKind: "logbook",
          style: "materielcount"
        }
        getStyle(option,function(materielcountStyle){
          var option = {
            styleKind: "logbook",
            style: "workcount"
          }
          getStyle(option,function(workcountStyle){
            var setcontentPageStyleObj = $.parseHTML(setcontentPageStyle);
            var d = new Date();
            $.each(rs.weather,function(index,value){
              selectOptionPut($(setcontentPageStyleObj).find("#amw,#pmw"),value.uid, value.name);
            });
            $(setcontentPageStyleObj).find("#div_hid").show();
            var weekArr = ["日","一","二","三","四","五","六"];
              // console.log(content);

            if(rs.content == null){
              var today = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
              $(setcontentPageStyleObj).find("#week").val(weekArr[d.getDay()]);
              $(setcontentPageStyleObj).find("#isnew").val(1);
              
              $(setcontentPageStyleObj).find("#date").text(today);
              
            }else{
              $(setcontentPageStyleObj).find("#isnew").val(0);
              if(rs.content.dates != undefined && rs.content.dates != null){
                $(setcontentPageStyleObj).find("#div_hid").remove();
                $(setcontentPageStyleObj).find("#amw,#pmw").prop("disabled",true);
              }
              $.each(rs.content,function(index,value){
                if(index != "dates"){
                  $(setcontentPageStyleObj).find("#"+index).text(value);
                }
              });
              $(setcontentPageStyleObj).find("#amw").val(rs.content.am_wthid);
              $(setcontentPageStyleObj).find("#pmw").val(rs.content.pm_wthid);
            }

            if(rs.project != null ){
              $.each(rs.project,function(index, value){
                $(setcontentPageStyleObj).find("#"+index).text(value);
              });
              var startDay = new Date(rs.project["start"]);

              var aday = Math.floor( ( d.getTime() - startDay ) / 86400000);
              var sday =parseInt(rs.project["pday"]) - aday + parseInt(rs.project["cday"]);
              if(sday < 0){
                sday = 0;
              }
              $(setcontentPageStyleObj).find("#aday").text(aday);
              $(setcontentPageStyleObj).find("#sday").text(sday);
            }
            if(rs.schedule != null){
              $(setcontentPageStyleObj).find("#price_tbp").text(rs.schedule.price_tbp);
              $(setcontentPageStyleObj).find("#price_twp").text(rs.schedule.price_twp);
            }else{
              $(setcontentPageStyleObj).find("#price_tbp").text(0);
              $(setcontentPageStyleObj).find("#price_twp").text(0);
            }


            if(rs.construction != null){
              $.each(rs.construction,function(index, value){
                var constructionStyleObj = $.parseHTML(constructionStyle);
                $(constructionStyleObj).find("#"+index).text(value);
                // console.log(index, value);
                $(setcontentPageStyleObj).find("#constructionList").after(constructionStyleObj);
              });
            }

            if(rs.materielcount != null){
              $.each(rs.materielcount,function(index, value){
                var materielcountStyleObj = $.parseHTML(materielcountStyle);
                $(materielcountStyleObj).find("#"+index).text(value);
                // console.log(index, value);
                $(setcontentPageStyleObj).find("#materielcountList").after(materielcountStyleObj);
              });
            }

            if(rs.workcount != null){
              $.each(rs.workcount,function(index, value){
                var workcountStyleObj = $.parseHTML(workcountStyle);
                $(workcountStyleObj).find("#"+index).text(value);
                // console.log(index, value);
                $(setcontentPageStyleObj).find("#workcountList").after(workcountStyleObj);
              });
            }
            if(rs.fifth != null){
              $(setcontentPageStyleObj).find("#fourth").text(rs.fifth);
            }
            if(rs.seventh != null){
              $(setcontentPageStyleObj).find("#sixth").text(rs.seventh);
            }


            $("#loadpageArea").empty().html(setcontentPageStyleObj);
            
          });
        });
      });
    });
    // $("#loadpageArea").
  });
}

// getListContent('list','list','div_content','',true);
function getListContent(){
  // console.log("T");
  $.getJSON(configObject.logbookGetData,{type:"list"}, function( rs ) {    
    // console.log(rs);
    var option = {
      styleKind: "logbook",
      style: "list"
    }
    // 先取得列表內容樣式
    getPage(option, function(listPageStyle){
      var option = {
        styleKind: "logbook",
        style: "list"
      }
      getStyle(option,function(listStyle){
        var listPageStyleObj = $.parseHTML(listPageStyle);
        $.each(rs, function(index,content){
          var listStyleObj = $.parseHTML(listStyle);
          $(listStyleObj).addClass("dataContent");
          $(listStyleObj).find(".list-items").eq(0).text(content.no);
          $(listStyleObj).find(".list-items").eq(1).text(content.date);
          $(listStyleObj).find(".fa-file-o").click(function(){
            toreport(content.uid);
          });
          $(listStyleObj).appendTo( $(listPageStyleObj).find("#div_tr") );
          // $("#loadpageArea").find("#div_tr").append(listStyleObj);

        });
        // console.log(listPageStyleObj);
        // div_tr
        $(listPageStyleObj).find(".dataContent").last().removeClass("list-items-bottom");
        $("#loadpageArea").empty().html(listPageStyleObj);
      })
      
    });
    // $("#loadpageArea").
  });
}
// 取得細部資訊
function getReportContent(uid){
  $.getJSON(configObject.logbookGetData,{type:"reportinfo",uid: uid}, function( rs ) {    
    console.log(rs);
    // return;
    var option = {
      styleKind: "logbook",
      style: "report"
    }
    // 先取得列表內容樣式
    getPage(option, function(reportPageStyle){
      var option = {
        styleKind: "logbook",
        style: "construction"
      }
      getStyle(option,function(constructionStyle){

        var option = {
          styleKind: "logbook",
          style: "materielcount"
        }
        getStyle(option,function(materielcountStyle){
          var option = {
            styleKind: "logbook",
            style: "workcount"
          }
          getStyle(option,function(workcountStyle){
            // 表頭資訊
            var reportPageStyleObj = $.parseHTML(reportPageStyle);
            $.each(rs.info,function(index, value){
              // console.log(index, value);
              $(reportPageStyleObj).find("#"+index).html(value);
            });

            $.each(rs.project,function(index, value){
              // console.log(index, value);
              $(reportPageStyleObj).find("#"+index).html(value);
            });

            if(rs.construction != null){
              $.each(rs.construction,function(index, value){
                var constructionStyleObj = $.parseHTML(constructionStyle);
                $(constructionStyleObj).find("#"+index).text(value);
                // console.log(index, value);
                $(reportPageStyleObj).find("#constructionList").after(constructionStyleObj);
              });
            }

            if(rs.materielcount != null){
              $.each(rs.materielcount,function(index, value){
                var materielcountStyleObj = $.parseHTML(materielcountStyle);
                $(materielcountStyleObj).find("#"+index).text(value);
                // console.log(index, value);
                $(reportPageStyleObj).find("#materielcountList").after(materielcountStyleObj);
              });
            }

            if(rs.workcount != null){
              $.each(rs.workcount,function(index, value){
                var workcountStyleObj = $.parseHTML(workcountStyle);
                $(workcountStyleObj).find("#"+index).text(value);
                // console.log(index, value);
                $(reportPageStyleObj).find("#workcountList").after(workcountStyleObj);
              });
            }
            if(rs.fifth != null){
              $(reportPageStyleObj).find("#fourth").text(rs.fifth);
            }
            if(rs.seventh != null){
              $(reportPageStyleObj).find("#sixth").text(rs.seventh);
            }
            $("#loadpageArea").empty().html(reportPageStyleObj);

          });
        });
     });
      
      
    });
    // $("#loadpageArea").
  });
}

function tolist(){
  // getContent('list','list','div_content','',true);
  console.log("t");
  getListContent();
}
//===============list=========s
function toreport(uid){
  // getContent('reportinfo','report','div_content','&uid='+uid,true);
  getReportContent(uid);
}
//===============list=========e
//===============setcontent=========s
function tosetpage(){
  // getContent('setcontent','setcontent','div_content','',true);
  getSetcontentContent();
}
function savecontentcheck(){
  isnew=$("#isnew").val();
  // console.log(isnew);
  if($("#amw").val!=0 && $("#pmw").val()!=0)
  {
    istrue=confirm("確定後資料無法再進行修改");
    if(istrue){
      if(isnew==1){
          $.ajax({
           url: configObject.logbookInsert,
           type: "POST",
           data: $("#cform").serialize(),
           async:false,
           success: function(rs){
            $.post(configObject.logbookModify, { type:'infocheck' } );
              alert("儲存成功");
              // getContent('list','list','div_content','',true);
           }
        });
      }else{
          $.ajax({
           url: configObject.logbookModify,
           type: "POST",
           data: $("#cform").serialize(),
           async:false,
           success: function(rs){
            $.post(configObject.logbookModify, { type:'infocheck' } );
              alert("儲存成功");
              // getContent('list','list','div_content','',true);
           }
        });
      }
      $("#div_hid").remove();
    }
  }else{
    alert("請輸入天氣");
  }
  
}
function savecontent(){
  isnew=$("#isnew").val();
  console.log($("#cform").serialize());
  if(isnew==1){
      $.ajax({
       url: configObject.logbookInsert,
       type: "POST",
       data: $("#cform").serialize(),
       async:false,
       success: function(rs){
          alert("儲存成功");
          // getContent('list','list','div_content','',true);
          $("#isnew").val(0);
       }
    });
  }else{
      $.ajax({
       url: configObject.logbookModify,
       type: "POST",
       data: $("#cform").serialize(),
       async:false,
       success: function(rs){
          alert("儲存成功");
          // getContent('list','list','div_content','',true);
       }
    });
  }
}
//===============setcontent=========e
function savelaborsafety(){
  isnew=$("#isnew").val();
  if(isnew==1){
      $.ajax({
       url: configObject.logbookInsert,
       type: "POST",
       data: $("#cform").serialize(),
       async:false,
       success: function(rs){
          alert("儲存成功");
       }
    });
  }else{
      $.ajax({
       url: configObject.logbookModify,
       type: "POST",
       data: $("#cform").serialize(),
       async:false,
       success: function(rs){
          alert("儲存成功");
       }
    });
  }
  getListContent();
}
//存檔
function save(){
    var Today=new Date();
　  tdate=Today.getFullYear().toString() + (Today.getMonth()+1).toString() +  Today.getDate().toString() ;
    window.open('/logbook/savepdffile?url='+location.host+'/logbook&name=logbook'+tdate, 'save');
    // window.close();
    // console.log('/logbook/savepdffile?url='+location.host+'/logbook');
}
