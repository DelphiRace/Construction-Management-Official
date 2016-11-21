var restObject;
$(function() {
  // var datas = buildDomTree();
  treeData();
  // console.log(datas);
    
  tabCtrl("nodesSetting");
    
});

function treeData(){
  $.ajax({
    url: configObject.WebAPI + "/waDataBase/api/Str/GetStrList",
    type: "GET",
    dataType: "JSON",
    timeout: 30000,
    success: function(rs){
      console.log(rs);
      if(rs.status){
        var datas = processTreeData( rs.data, true, "root", "空間建立" );
        var options = {
          bootstrap2: false, 
          showTags: false,
          levels: 3,
          data: datas,
          
          //showBorder: false,
          onNodeSelected: function(event, node) {
            // console.log(event, node);
            nodeDataContents(node.id,node);
            if(node.parentId == 0){
              $("#nodeData").parent().hide();
              $("#nodeData-content").hide();
              $("#nodeOption").click();
              $("#nodeOption").parent().show();
            }else{
              $("#nodeData").click();
              $("#nodeData").parent().show();
              $("#nodeOption").parent().show();
              
            }
          }
        };
        $(".err_msg").empty().hide();
        $(".tree-menus").show();
        $('#treeview').treeview(options);
      }else{
        $(".tree-menus").hide();
        $(".err_msg").empty().show();
        $.get('pages/style/engineering/tree_error.html',function(rs){
          $(".err_msg").html(rs);
        });
      }
    },
    error:function(){
      $(".tree-menus").hide();
      $(".err_msg").empty().show();
      $.get('pages/style/engineering/tree_error.html',function(rs){
        $(".err_msg").html(rs);
      });
    }
  });
  // var data = [{"uid":"A1","name":"建築工程","parent":"0"},{"uid":"A2","name":"水電工程","parent":"0"},{"uid":"A6","name":"正是工程一","parent":"0"},{"uid":"A7","name":"幀幀政治","parent":"0"},{"uid":"B1","name":"結構工程","parent":"A1"},{"uid":"B2","name":"粉刷工程","parent":"A1"},{"uid":"B3","name":"電氣工程","parent":"A2"},{"uid":"B4","name":"測試工程地二層","parent":"A6"},{"uid":"C1","name":"鋼筋工程","parent":"B1"},{"uid":"C2","name":"模板工程","parent":"B1"},{"uid":"C3","name":"混凝土工程","parent":"B1"},{"uid":"C4","name":"泥作工程\r\n","parent":"B2"},{"uid":"C5","name":"PVC管 3/4吋 (22mm∮)\r\n","parent":"B3"},{"uid":"C6","name":"PVC管 1吋 (28mm∮)\r\n","parent":"B3"},{"uid":"C7","name":"PVC管 1 1/4吋 (35m∮)\r\n","parent":"B3"},{"uid":"C8","name":"PVC管 1 1/2吋 (41mm∮)\r\n","parent":"B3"},{"uid":"D1","name":"加工","parent":"C1"},{"uid":"D10","name":"粗底","parent":"C4"},{"uid":"D11","name":"粉光","parent":"C4"},{"uid":"D2","name":"綁紮","parent":"C1"},{"uid":"D3","name":"拆、傳料","parent":"C2"},{"uid":"D4","name":"立模","parent":"C2"},{"uid":"D5","name":"緊結","parent":"C2"},{"uid":"D6","name":"搗築","parent":"C3"},{"uid":"D7","name":"素面清理","parent":"C4"},{"uid":"D8","name":"吊料","parent":"C4"},{"uid":"D9","name":"吊線","parent":"C4"}];
  // return processTreeData( data, true, "root", "工項建立" );
}

function nodeDataContents(nodeID,node){
  if(nodeID != "root"){
    $("#select-nodeContents").show();
    $("#tab-content").hide();

    
    var nodesContentObj;
    $.getJSON(configObject.WebAPI + "/waDataBase/api/Str/GetStrContent",{id:nodeID},function(rs){
       // console.log(rs);
      nodesContentObj = rs;
      nodeOrderContents(nodeID, node, nodesContentObj.addStatus, nodesContentObj.seqStatus);
    }).done(function(){
      // console.log(nodesContentObj);
      $.get("pages/style/engineering/engineering_data_option_style.html",function(pageContent){
        var pages = $.parseHTML(pageContent);
        //取得樹狀結構的資料
        var nodeContent = $('#treeview').treeview('getSelected', nodeID);
        nodeContent = nodeContent[0];
        // console.log(nodeContent);
        var nodesContent = nodesContentObj;

        $("#nodeData-content").empty();

        $(pages).find("#nodeID").val(nodeContent.id);
        $(pages).find("#fid").val(nodesContent.fid);
        //放入名稱
        $(pages).find("#node-name").html(nodeContent.text);
        if(typeof nodesContent.fCodeType != "undefined"){
          $(pages).find("#fatherCode").html(nodesContent.fCodeType);
        }else{
          $(pages).find("#fatherCode").remove();  
        }
        //工種相關設定
        if(typeof nodesContent.code != "undefined"){
          $(pages).find(".code-content").html(nodesContent.code);
          $(pages).find("#code").val(nodesContent.code);
        }else{
          $(pages).find(".code").remove();
        }

        //工種相關設定
        if(typeof nodesContent.worksid != "undefined"){
          worksList(pages,nodesContent.worksid);
        }else{
          $(pages).find(".worksid").remove();
        }

        //計數單位相關設定
        if(typeof nodesContent.typeid_u != "undefined"){
          typeUnitList(pages,nodesContent.typeid_u,nodeID);
        }else{
          $(pages).find(".unitid").remove();
        }

        $(pages).find("#name").val(nodeContent.text);
        $(pages).find(".edit-item").hide();
        $(pages).appendTo("#nodeData-content");
      });
    });
  }else{
    $("#select-nodeContents").hide();
  }
}

function nodeOrderContents(nodeID,node,addStatus,seqStatus){
  // console.log(nodeID,node,addStatus,seqStatus);
  $.get("pages/style/engineering/engineering_node_option_style.html",function(pageContent){
    // console.log(pageContent);
    var pages = $.parseHTML(pageContent);
    $(pages).find("#node-order-sortable").sortable().disableSelection();
    //取得樹狀結構的資料
    
    var nodeContent;
    // if(node.parentId > 0){//取得選擇的父節點
    //   nodeContent = $('#treeview').treeview('getParent', node);
    // }else{//如果父節點是ROOT，取同層
    //   nodeContent = node;
    // }
    nodeContent = node;
    
    //取得選擇的父節點同層的節點
    var nodeSiblingsContent = $('#treeview').treeview('getSiblings', nodeContent);
    var nodeArr = [];
    nodeArr.push(nodeContent);
    if(nodeSiblingsContent.length > 0 ){
      $.each(nodeSiblingsContent, function(i,nodeContent){
       nodeArr.push(nodeContent);
      });
    }
    //創建節點順序
    creatNodeOrder(pages,nodeArr);
    //創建節點相關修改東西
    if(typeof node.nodes != "undefined"){
      creatChildNode(pages,node);
    }else{
      if(addStatus){
        //沒有的話，顯示增加按鈕
        creatChildNode(pages,node);
      }else{
        $("#nodeOption").parent().hide();
      }
    }

    // console.log(nodeID,node,addStatus);
    if(!seqStatus){
      // console.log("T");
      $(pages).find("#node-order-content").remove();
      $(pages).find("#node-order").parent().remove();

      $(pages).find("#inNode").parent().addClass("active");
      $(pages).find("#inNode-content").show();
    }

    $("#nodeOption-content").empty();
    $(pages).appendTo("#nodeOption-content");
    tabCtrl("node-options");
  });
}

function creatNodeOrder(pages,nodeArr){
  // console.log(nodeArr);
  // #("#node-order-sortable").empty();
  //先產生父層
  $.each(nodeArr,function(i,node){
    // console.log(node);
    var liItem = $.parseHTML('<li class="list-group-item nodeParent">');
    //先放入節點資訊
    $(liItem).prop("id",node.id).html(node.text);
    //產生子節點可拖移放入的區域
    var chItem = $.parseHTML('<ul class="childSort content-padding5">');
    //若有子節點，產生
    if(typeof node.nodes != "undefined"){
      $.each(node.nodes, function(chI,chNode){
        var chLiItem = $.parseHTML('<li class="list-group-item">');
        $(chLiItem).prop("id",chNode.id).html(chNode.text);
        $(chLiItem).appendTo(chItem);
      });
    }
    //放入子節點
    $(chItem).appendTo(liItem);
    //設定子節點拖移條件
    $(liItem).find(".childSort").sortable({
      connectWith: ".childSort",
      placeholder: "ui-state-highlight"
    }).disableSelection();
    var pagesNodeOrderSortable = $(pages).find("#node-order-sortable");
    //將項目放入
    $(liItem).appendTo(pagesNodeOrderSortable);
  });
}
//創建節點項目
function creatChildNode(pages,nodeArr){
  // console.log(nodeArr);
  // #("#node-order-sortable").empty();
  //先產生父層
  var liItem = $.parseHTML('<li class="list-group-item nodeParent">');
  //子項目父層樣式
  var childNodeParentStyle;
  $.get("pages/style/engineering/engineering_childNode_option.html",function(rs){
    childNodeParentStyle = rs;
  }).done(function(){
    //創建父層資訊區
    var parentInfo = $.parseHTML(childNodeParentStyle);
    $(parentInfo).find(".parentName").html(nodeArr.text);
    //放入節點資訊
    $(parentInfo).appendTo(liItem);
    //放入節點資訊
    $(liItem).prop("id",nodeArr.id);
    //產生子節點可拖移放入的區域
    var chItem = $.parseHTML('<ul class="childSort content-padding5" id="nodesChildCreat">');
    //若有子節點，產生
    if(typeof nodeArr.nodes != "undefined"){
      $.get("pages/style/engineering/engineering_childNode_child_option.html",function(childStyle){
        $.each(nodeArr.nodes, function(chI,chNode){
          var chLiItem = $.parseHTML('<li class="list-group-item">');
          //子節點樣式
          var childInfo = $.parseHTML(childStyle);

          $(childInfo).find(".childName").html(chNode.text);
          $(childInfo).find(".userInput").val(chNode.text);
          //放入子節點資訊
          $(childInfo).appendTo(chLiItem);
          //設定子節點ＩＤ
          $(chLiItem).prop("id",chNode.id);
          $(chLiItem).appendTo(chItem);
        });
      });
    }
    //放入子節點
    $(chItem).appendTo(liItem);
    //設定子節點拖移條件
    $(liItem).find(".childSort").sortable({
      connectWith: ".childSort",
      placeholder: "ui-state-highlight"
    }).disableSelection();
    var pagesNodeOrderSortable = $(pages).find("#inNode-sortable");
    //將項目放入
    $(liItem).appendTo(pagesNodeOrderSortable);
  });
}

//創建子節點事件
function creatChildNodeAddAction(){
  $.get("pages/style/engineering/engineering_childNode_child_option.html",function(childStyle){
    
      var chLiItem = $.parseHTML('<li class="list-group-item">');
      //子節點樣式
      var childInfo = $.parseHTML(childStyle);

      $(childInfo).find(".childName").html("新增項目").hide();
      $(childInfo).find(".userInput").val("新增項目").parent().show();
      $(childInfo).find(".edit_btn").hide();
      $(childInfo).find(".save_btn").show();


      //放入子節點資訊
      $(childInfo).appendTo(chLiItem);
      //設定子節點Class
      $(chLiItem).addClass("newChildItem");
      $(chLiItem).appendTo("#nodesChildCreat");
    
  });
}

//創建子節點事件--儲存
function creatChildNodeSaveAction(object){
  var fid = $("#nodeID").val();
  var parentObj = $(object).parent().parent().parent().parent();
  var parentClass = parentObj.prop("class");
  var name = parentObj.find(".userInput").val();
  var id = parentObj.prop("id");
  if(parentClass.search("newChildItem") == -1){ //找不到
    var option = {
      id:id,
      name:name,
      fid:fid
    };
    // console.log(option);
    $.post(configObject.WebAPI + "/waDataBase/api/Str/setEngContentModify",option,function(rs){
      console.log(rs);
      reloadTreeData();
    })
  }else{//是新增物件
    // console.log({fid:fid,name:name});
    $.post(configObject.WebAPI + "/waDataBase/api/Str/setStrNameInsert",{fid:fid,name:name},function(rs){
      // http://211.21.170.18:8080/waDataBase/api/Eng/setEngNameInsert?fid=B1&name=test
      // console.log(rs);
      parentObj.removeClass("newChildItem");
      parentObj.prop("id",rs.uid);
      reloadTreeData();
    });
  }
  parentObj.find(".childName").html(name).show();
  parentObj.find(".childName_edit").hide();
  parentObj.find(".save_btn").hide();
  parentObj.find(".edit_btn").show();

  
}

//創建子節點事件--取消
function creatChildNodeCancelAction(object){
  var fid = $("#nodeID").val();
  var parentObj = $(object).parent().parent().parent().parent();
  var parentClass = parentObj.prop("class");
  var name = parentObj.find(".userInput").val();
  if(parentClass.search("newChildItem") == -1){ //找不到
    parentObj.find(".edit_btn").show();
    parentObj.find(".save_btn").hide();

    parentObj.find(".childName").show();
    parentObj.find(".userInput").parent().hide();
    //還原
    parentObj.find(".userInput").val(name);
  }else{//是新增物件
    // console.log(parentClass);
    parentObj.remove();
  }
  
}

//創建子節點事件--修改
function creatChildNodeEditAction(object){
  var parentObj = $(object).parent().parent().parent().parent();
  parentObj.find(".edit_btn").hide();
  parentObj.find(".save_btn").show();
  parentObj.find(".childName").hide();
  parentObj.find(".userInput").parent().show();
}

//創建子節點事件--刪除
function creatChildNodeDeleteAction(object){
  var parentObj = $(object).parent().parent().parent().parent();
  var id = parentObj.prop("id");
  // console.log(parentClass);
  $.post(configObject.WebAPI + "/waDataBase/api/Str/setStrDelete",{id:id},function(rs){
    parentObj.remove();
    reloadTreeData();
  });
  
}

function reloadTreeData(){
  $('#treeview').treeview("remove");
  treeData();
}

//工種列表
function worksList(pages,wID){
  var worksid = $(pages).find("#worksid");
  worksid.empty();
  $.getJSON(configObject.WebAPI + "/waDataBase/api/Eng/getengwork",function(rs){
    // console.log(rs);
    if(rs.status){
      $.each(rs.data,function(i,v){
        var option = '<option value="'+v.uid+'">'+v.name+'</option>';
        $(option).appendTo(worksid);
      });
      worksid.val(wID);
      var workText = $(pages).find("#worksid option:selected").text();
      $(pages).find(".worksid-content ").empty().html(workText);
    }
  });
}

//計數單位
function typeUnitList(pages,typeUnitID,nodeID){
  var typeUnit = $(pages).find("#unitid");
  typeUnit.empty();
  $.getJSON(configObject.WebAPI + "/waDataBase/api/Eng/getengunit",{id:nodeID},function(rs){
    // console.log(rs);
    if(rs.status){
      $.each(rs.data,function(i,v){
        var option = '<option value="'+v.uid+'">'+v.name+'</option>';
        $(option).appendTo(typeUnit);
      });
      typeUnit.val(typeUnitID);
      var typeUnitText = $(pages).find("#unitid option:selected").text();
      $(pages).find(".unitid-content ").empty().html(typeUnitText);
    }
  });
}

//------------------------------------記得要移除-----------------------------------
function getUserInput(objectID){
  var tmpObj = {};
  $("#"+objectID).find(".userInput").each(function(){
    var userInputType = $(this).prop("type");
    if( userInputType != "radio" ){
      var id= $(this).prop("id");
    }else{
      var id= $(this).prop("name");
    }
    tmpObj[id] = $(this).val();
  });
  return tmpObj;
}

function toEdit(){
  $(".content-item").hide();
  $(".edit-item").show();
  restObject = getUserInput("nodeUserSetting");
}

function toNodeSettingSave(){
  var userObj = getUserInput("nodeUserSetting");
  var fid = $("#fid").val();
  var id = $("#nodeID").val();
  console.log(userObj);
  $.each(userObj,function(i,v){
    var selectText = $("#"+i+" option:selected").text();
    if(!selectText){
      $("."+i+"-content").html(v);
    }else{
      $("."+i+"-content").html(selectText);
    } 
  });
  $(".content-item").show();
  $(".edit-item").hide();

  userObj.id = id;
  userObj.fid = fid;
  console.log(userObj);
  // console.log(option);
  $.post(configObject.WebAPI + "/waDataBase/api/Eng/setStrContentModify",userObj,function(rs){
    reloadTreeData();
  });
}

//設定排序
function setChildItemSeq(){
  var idStr = '';
  $("#nodesChildCreat").find("li").each(function(){
    idStr += $(this).prop("id")+",";
  });
  if(idStr.length > 0){
    idStr = idStr.substring(0, idStr.length-1);
  }
  // console.log(idStr);
  $.post(configObject.WebAPI + "/waDataBase/api/Str/setStrSeq",{id:idStr},function(rs){
    reloadTreeData();
  });
}

function toNodeSettingCancel(){
  resetNodeSetting(restObject);
  $(".content-item").show();
  $(".edit-item").hide();
}

function resetNodeSetting(restObject){
  $.each(restObject,function(i,v){
    $("#"+i).val(v);
  });
}