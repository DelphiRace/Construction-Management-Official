$(function(){
  //取得列表
  //getDailyList("floor");
  getWorkList();
});

function getWorkList(){
    var uuid = userLoginInfo.userID;

    //取得列表
    $.ajax({
       url: configObject.getWorkProject,
       type: "POST",
       data: {uuid:uuid},
       dataType: "JSON",
       success: function(rs){
           $("#worklist").empty();
           if(rs.status){
               $.each(rs.workList,function(i,v){
                  $('<option value="'+v.uid+'">'+v.name+'</option>').appendTo("#worklist");
              });
               getDailyList("floor");
           }else{
               console.log(rs.msg);
           }
       }
    });
}

function getDailyList(type){
    var formOption = $("#menuSelect").serialize();
    var puid = $("#worklist").val();
    formOption += "&puid="+puid+"&type="+type;
    //取得列表
    $.ajax({
       url: configObject.getDailyContent,
       type: "POST",
       data: formOption,
       dataType: "JSON",
       success: function(rs){
           if(rs.status){
              switch(type){
                case "floor":
                  var options = $("#floorid");
                break;
                case "workitem":
                  var options = $("#workitemid");
                break;
                case "pacemodel":
                  var options = $("#pacemodelid");
                break;
                case "area":
                  var options = $("#areaid");
                break;
                case "alllist":
                  var options = $("#alllist");
                break;
              }

              if(type != "alllist"){
                var resetOptionStr = '<option value="0">請選擇</option>',resetStr = "";
                options.empty().append(resetOptionStr);
                $.each(rs.daily,function(i,v){
                    $('<option value="'+v.uid+'">'+v.Name+'</p>').appendTo(options);
                });
              }else if(type == "alllist"){
                var strContent = "";
                if(rs.daily != null){
                  $.each(rs.daily,function(i,v){
                        strContent += '<ul>';
                        strContent += '<li><label>';
                        strContent += checkAction(v.uid);
                        strContent += '<h3>'+v.Name+'</h3>';
                        strContent += '</label></li>';
                        strContent += '</ul>';
                  });
                }else{
                  strContent = '無資料';
                }
                options.empty().html(strContent);
              }
           }else{
               console.log(rs.msg);
           }
       }
   });
}

function checkAction(id){
  return '<div class="checkitem"><input type="checkbox" name="alllistid[]" value="'+id+'"></div>';
    
}

function checkItems(){
  var formOption = $("#alllist").serialize();
  formOption += "&type=checkData";
  $.ajax({
       url: configObject.getDailyContent,
       type: "POST",
       data: formOption,
       //dataType: "JSON",
       success: function(rs){
        alert('已送出項目至QC列表中');
        getDailyList('alllist');
      }
  });
}

function backWorkList(){
    location.replace("work_project.html");
}