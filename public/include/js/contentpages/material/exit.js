var pageRowShow = 2;
var nowPage = 1;
var exitPetListNowPage = 1;
var exitPetListPageRowShow = 10;

$(function() {
	$( "#of-items" ).combobox();
	// $( "#toggle" ).click(function() {
	//   $( "#combobox" ).toggle();
	// });
	getComboboxSelectList();
	$("#search_content").hide();
	//gotoPageTab(1);
	//初始日期
  	$("#start_date").datepicker({
      dateFormat: 'yy-mm-dd',
      showOn: "both", 
      buttonText: '<i class="fa fa-calendar mouse-pointer"></i>'
  	});
  	//初始日期
  	$("#end_date").datepicker({
      dateFormat: 'yy-mm-dd',
      showOn: "both", 
      buttonText: '<i class="fa fa-calendar mouse-pointer"></i>'
  	});
  	//剩餘物料申請-預計出場日期
  	$("#surplus_exit").datepicker({
      dateFormat: 'yy-mm-dd',
      showOn: "both", 
      buttonText: '<i class="fa fa-calendar mouse-pointer"></i>'
  	});

  	//設定按鈕-品項
  	$("#of-search").click(function(){
  		gotoPageTab(1);
  	});
  	//設定按鈕-進場日期
  	$("#date_search").click(function(){
  		gotoPageTab(1);
  	});
  	$(".tab_content").hide();
  	$("#of-items-exit_content").show();
  	//先載入合約物料
  	loadExitPetList(1);

  	//設定功能頁籤
  	$("#optionTab li a").click(function(){
  		var contentID = $(this).prop("id");
  		if(contentID == "of-items-exit"){
  			//載入合約物料
  			loadExitPetList(1);
  		}else if(contentID == "surplus-items-exit"){
  			//載入剩餘物料
  			loadExitSurplusList(1);
  			//載入相關選項
  			creatComboboxContent(configObject.MaterialGetData+"?type=application","el_materiel","surplus-items","surplus-msg");
  		}else if(contentID == "other-items-exit"){
  			//載入其他
  			loadExitOtherList(1);
  			creatComboboxContent(configObject.exitOtherSelectItem,"list","other-items","other-msg");
  			$("#other_exit").datepicker({
		      dateFormat: 'yy-mm-dd',
		      showOn: "both", 
		      buttonText: '<i class="fa fa-calendar mouse-pointer"></i>'
		  	});
  		}
        
        contentID += "_content";
        $("#optionTab li").removeClass("active");
        $(this).parent().addClass("active");
        $(".tab_content").hide();
        $("#"+contentID).show();
        return false;
    });

});

function getComboboxSelectList(itemID){
	$.getJSON(configObject.getOrderFormItem, function( rs ) {
		//console.log(rs);
		var optionStr = '';
		$("#pageTab").empty();
		if(rs.status){
			$.each(rs.list, function(i,v){
				optionStr += '<option value="'+v.uid+'">'+v.ma_name+'</option>';
			});
			$(optionStr).appendTo("#of-items");
		}else{
			$("#msg_add_content").html(rs.msg).parent().show();
		}
		//開始做頁碼
		var btn = '';
		var totalPage = Math.ceil(rs.total_row / pageRowShow);
		if(rs.total_row >= pageRowShow){			
			for(var i=1; i<=totalPage; i++){
				if(i == nowPage){
					btn += '<button type="button" class="btn btn-default active" onclick="gotoPageTab('+i+',$(this))">' + i + '</button>';
				}else{
					btn += '<button type="button" class="btn btn-default" onclick="gotoPageTab('+i+',$(this))">' + i + '</button>';
				}
			}
			
		}else{
			btn = '<button type="button" class="btn btn-default active" onclick="gotoPageTab(1,$(this))">1</button>';
		}

		//設定跳頁
		$("#toFirstPage").click(function(){
			gotoPageTab(1);
		});
		$("#toEndPage").click(function(){
			gotoPageTab(totalPage);
		});
		//設定跳頁結束

		//放入
		$("#pageTab").html(btn);
	});
	$("#of-items");
}

//品項
function creatComboboxContent(apiLink,listIndex,itemID,msgAreaID){
	
	$.getJSON(apiLink, function( rs ) {
		//console.log(rs.el_materiel);
		var optionStr = "";
		$.each(rs[listIndex], function(i,v){
			optionStr += '<option value="'+v.uid+'">'+v.name+'</option>';
		});
		$(optionStr).appendTo("#"+itemID);
		$("#"+msgAreaID).html("");
		$( "#"+itemID ).combobox();
	});
}

//頁碼呼叫函式 & 初始化內容或者更新頁面內容
function gotoPageTab(goPage, btnObject){
	var start = (goPage - 1)*pageRowShow;	
	nowPage = goPage;
	$("#search_content").show();
	$("#tbList").empty();
	var data;

	//取得品項
	var of_items = $("#of-items").val();

	//取得日期
	var start_date = $("#start_date").val();
	var end_date = $("#end_date").val();

	$.getJSON(configObject.getSelectItem, {of_items:of_items, start_date: start_date, end_date: end_date,start: start, end: pageRowShow}, function( rs ) {
		data = rs.list;
		// console.log(rs);
	}).done(function(){
		$.get("pages/style/material/exit_add_list_content.html",function(pages){
			var title = $.parseHTML(pages);
			title = $(title).find(".list_title");
			$(title).appendTo("#tbList");
			var countNO = 1;
			if(!$.isEmptyObject(data)){
				$.each(data,function(i,v){
					var content = $.parseHTML(pages);
					content = $(content).find(".list_content");
					//$(content).find(".numbers").html(countNO);
					$(content).find(".uid").html("AA0000"+v.uid);
					$(content).find(".ma_name").html(v.ma_name);
					$(content).find(".count").html(v.count);
					$(content).find(".datein").html(v.datein);
					$(content).find(".ofstatus").html(v.ofstatus);
					$(content).find(".viewInfos").click(function(){
						showinfo(v.uid);
						return false;
					});
					countNO++;
					$(content).appendTo("#tbList");
				});
			}
		});
	});

	if(typeof btnObject != "undefined"){
		$(btnObject).parent().find("button").removeClass("active");
		$(btnObject).addClass("active");
	}
}

//查看按鈕
function showinfo(uid){
  //傳入uid 將html 塞入dialog div內
 	loader("dialog","content-loading-img-in");
 	var data;
 	var itemInfo;
 	var typeID = 3;
 	var prj_mid = 1;
  	//先查詢相關的資訊
	$.getJSON(configObject.exitItemInfo,{pl_id:uid,typeID: typeID,prj_mid:prj_mid}, function( info ) {
		if(info.status){
			itemInfo = info.list;
		}else{
			itemInfo = [];
		}
		//console.log(itemInfo);
	}).done(function(){

	  	$.getJSON(configObject.MaterialGetData,{type:"chkinfo",uid:uid}, function( datas ) {
	    	data = datas;
	 	 }).done(function(){
	 	 	if(data != null){
			    $.get("pages/style/material/exit_add_list_info.html",function(rs){
			      var content = $.parseHTML(rs);
			      $.each(data,function(i,v){
			        $(content).find("#inp_"+i).val(v);
			        $(content).find("#"+i).html(v);
			      });
			      if(!data.imgfile){
			        $(content).find("#purchaseInfo_content").html("暫無資料");
			      }else{
			        //清空，準備放入照片列表
			        $(content).find("#purchaseInfo_content").empty();
			        //取得照片資料
			        var imgData;
			        $.getJSON(configObject.getPurchaseImg,{uid:data.uid},function(rs){
			          imgData = rs;
			        }).done(function(){
			        	//console.log(imgData);
			          //取得樣式
			            $.get("pages/style/material/exit_add_purchase_content_style.html",function(pages){
			              //放入
			              if(imgData.status){
			                $.each(imgData.imgMemo,function(i,v){
			                  	var content = $.parseHTML(pages);
			                  	// console.log(imgData)
			                  	$(content).find("img").prop("src",imgData.imgs["img"+i]);
			                  	$(content).find("#purchase_number").html(v.purchase_number);
			                  	$(content).find("#purchase_count").html(v.purchase_count);
			                  	$(content).find("#exit_date").datepicker({
							      dateFormat: 'yy-mm-dd',
							      showOn: "both", 
							      buttonText: '<i class="fa fa-calendar mouse-pointer"></i>',
							      onSelect: function(date,dateObject){
							      	//console.log(date,dateObject);
							      	console.log($(this));
							        $(this).val(date);
							      }
							  	});
			                  	if($.inArray(v.uid,itemInfo) == -1){
			                  		$(content).find("#addItem").click(function(){
			                  			var exit_date = $(content).find("#exit_date").val();
			                  			if(exit_date == ""){
			                  				$(content).find("#exit_date").addClass("item-bg-danger");
			                  				alert("未選擇日期");
			                  			}else{
			                  				var quid = $("#dialog").find("#inp_quid").val();
			                  				exitPurchaseApply(data.uid,v.uid,typeID,exit_date, quid,uid);
			                  			}
			                  		});
			              		}else{
			              			$(content).find("#addItem_content").html("已申請");
			              			$(content).find("#exit_content").remove();
			              		}
			                  	$(content).appendTo("#purchaseInfo_content");
			                });
			              }
			            });
			        });
			      }
			      //清空
			      $("#dialog").empty();
			      $(content).appendTo("#dialog")
			      .find(".list_tabs li a").click(function(){
			        var contentID = $(this).prop("id") + "_content";
			        $(content).find(".list_tabs li").removeClass("active");
			        $(this).parent().addClass("active");
			        $(content).find(".tab_content").hide();
			        $(content).find("#"+contentID).show();
			        return false;
			      });

			    });
			}
	  	});
	});
	//顯示dialog
	//$('#dialog').css({display:'inline'});
	$("#dialog").dialog({
	  title: '資料',
	  bgiframe: true,
	  height: 460,
	  width: '80%',
	  modal: true,
	  draggable: true,
	  resizable: false,
	  overlay:{opacity: 0.7, background: "#FF8899" },
	  position:{ my: "top+50", at: "top+50", of: window }
	});
	purchaseImg = {};
	nowPhoto = 1;
}

//出貨單申請出場
function exitPurchaseApply(petitionlist_id, purchaseID, typeID, exit_date, quid, showID){
	// console.log(petitionlist_id,purchaseID,typeID);
	var uuid;
	//合約ID，目前暫以1為使用範例
	var prj_mid = 1;
	var exit_date = exit_date;
	var option = {};
	
	$.getJSON(configObject.getAcInfo,{},function(acinfo){
		uuid = acinfo.uuid;
		option = {
			petitionlist_id:petitionlist_id, 
			purchaseID:purchaseID, 
			typeID:typeID, 
			uuid:uuid, 
			prj_mid:prj_mid, 
			exit_date:exit_date,
			quid: quid
		};
	}).done(function(){
		$.post(configObject.exitApply, option, function(rs){
			 //console.log(rs);
			//重新載入
			showinfo(showID);
			loadExitPetList(1);
		});
	});
	
}

//剩餘物料申請出場
function exitSurplusApply(){
	// console.log(petitionlist_id,purchaseID,typeID);
	var uuid;
	//合約ID，目前暫以1為使用範例
	var prj_mid = 1;
	var exit_date = $("#surplus_exit").val();
	var option = {};
	var typeID = 5;
	var quid = $("#surplus-items").val();
	var quantity = $("#quantity").val();
	
	$.getJSON(configObject.getAcInfo,{},function(acinfo){
		uuid = acinfo.uuid;
		option = { 
			typeID:typeID, 
			uuid:uuid, 
			prj_mid:prj_mid, 
			exit_date:exit_date,
			quantity: quantity,
			quid: quid
		};
		//console.log(option);
	}).done(function(){
		$.post(configObject.exitApply, option, function(rs){
			//console.log(rs);
			$("#quantity").val("");
			$("#surplus_exit").val("");
			loadExitSurplusList(1);
			showArea('surplus_apply','surplusList');
		});
	});
	
}

//其他申請出場
function exitOtherApply(){
	// console.log(petitionlist_id,purchaseID,typeID);
	var uuid;
	//合約ID，目前暫以1為使用範例
	var prj_mid = 1;
	var exit_date = $("#other_exit").val();
	var option = {};
	var typeID = $("#other-items").val();
	var quid = $("#other-items").val();
	var quantity = $("#other-quantity").val();
	
	$.getJSON(configObject.getAcInfo,{},function(acinfo){
		uuid = acinfo.uuid;
		option = { 
			typeID:typeID, 
			uuid:uuid, 
			prj_mid:prj_mid, 
			exit_date:exit_date,
			quantity: quantity,
			quid: quid
		};
		console.log(option);
	}).done(function(){
		$.post(configObject.exitOtherApply, option, function(rs){
			//console.log(rs);
			//$("#other-quantity").val("");
			//$("#other_exit").val("");
			//loadExitSurplusList(1);
			//showArea('surplus_apply','surplusList');
		});
	});
	
}

//顯示區域
function showArea(areaID, hideID){
	$("#"+areaID).toggle("blind",{},500);
	$("#"+hideID).toggle();
}

//載入申請入場列表
function loadExitPetList(goPage, btnObject){

	var start = (goPage - 1)*exitPetListPageRowShow;	
	exitPetListNowPage = goPage;

	var prj_mid = 1;
	var typeID = 3;
	var data;
	var totalPage;
	$("#exitPetList").empty();

	$.getJSON(configObject.exitItemList,{typeID: typeID,prj_mid:prj_mid,start:start,end:exitPetListPageRowShow}, function( info ) {
		data = info;
		totalPage = data.totla;
		//console.log(data);
	}).done(function(){
		$.get("pages/style/material/exit_list_content.html",function(pages){
			var title = $.parseHTML(pages);
			title = $(title).find(".list_title");
			$(title).appendTo("#exitPetList");
			var countNO = 1;
			if(!$.isEmptyObject(data.list)){
				$.each(data.list,function(i,v){
					var content = $.parseHTML(pages);
					content = $(content).find(".list_content");
					//console.log(v);
					//$(content).find(".numbers").html(countNO);
					$(content).find(".uid").html("AA0000"+v.uid);
					$(content).find(".purchase_number").html(v.purchase_number);
					$(content).find(".ma_name").html(v.ma_name);
					$(content).find(".count").html(v.count);
					$(content).find(".date").html(v.date);
					$(content).find(".ofstatus").html(v.ofstatus);
					countNO++;
					$(content).appendTo("#exitPetList");
				});
				//開始做頁碼
				$("#toExitPetpageTab").empty();
				var btn = '';
				var totalPage = Math.ceil(data.total / exitPetListPageRowShow);
				if(data.total >= exitPetListPageRowShow){			
					for(var i=1; i<=totalPage; i++){
						if(i == nowPage){
							btn += '<button type="button" class="btn btn-default active" onclick="loadExitPetList('+i+',$(this))">' + i + '</button>';
						}else{
							btn += '<button type="button" class="btn btn-default" onclick="loadExitPetList('+i+',$(this))">' + i + '</button>';
						}
					}
					
				}else{
					btn = '<button type="button" class="btn btn-default active" onclick="loadExitPetList(1,$(this))">1</button>';
				}
				//設定跳頁
				$("#toExitPetFirstPage").unbind("click").click(function(){
					loadExitPetList(1);
				});
				$("#toExitPetEndPage").unbind("click").click(function(){
					loadExitPetList(totalPage);
				});
				//設定跳頁結束
				//放入
				$("#toExitPetpageTab").html(btn);
			}
		});
	});

	if(typeof btnObject != "undefined"){
		$(btnObject).parent().find("button").removeClass("active");
		$(btnObject).addClass("active");
	}
	
}

//載入剩餘物料申請入場列表
function loadExitSurplusList(goPage, btnObject){

	var start = (goPage - 1)*exitPetListPageRowShow;	
	exitPetListNowPage = goPage;

	var prj_mid = 1;
	var typeID = 5;
	var data;
	var totalPage;
	$("#exitSurplusList").empty();

	$.getJSON(configObject.exitItemList,{typeID: typeID,prj_mid:prj_mid,start:start,end:exitPetListPageRowShow}, function( info ) {
		data = info;
		totalPage = data.totla;
		console.log(data);
	}).done(function(){
		$.get("pages/style/material/exit_surplus_list_content.html",function(pages){
			var title = $.parseHTML(pages);
			title = $(title).find(".list_title");
			$(title).appendTo("#exitSurplusList");
			var countNO = 1;
			if(!$.isEmptyObject(data.list)){
				$.each(data.list,function(i,v){
					var content = $.parseHTML(pages);
					content = $(content).find(".list_content");
					//console.log(v);
					//$(content).find(".numbers").html(countNO);
					$(content).find(".uid").html(v.exitID);
					$(content).find(".ma_name").html(v.ma_name);
					$(content).find(".count").html(v.exitCount);
					$(content).find(".date").html(v.date);
					$(content).find(".ofstatus").html(v.ofstatus);
					countNO++;
					$(content).appendTo("#exitSurplusList");
				});
				//開始做頁碼
				$("#toExitSurpluspageTab").empty();
				var btn = '';
				var totalPage = Math.ceil(data.total / exitPetListPageRowShow);
				if(data.total >= exitPetListPageRowShow){			
					for(var i=1; i<=totalPage; i++){
						if(i == nowPage){
							btn += '<button type="button" class="btn btn-default active" onclick="loadExitPetList('+i+',$(this))">' + i + '</button>';
						}else{
							btn += '<button type="button" class="btn btn-default" onclick="loadExitPetList('+i+',$(this))">' + i + '</button>';
						}
					}
					
				}else{
					btn = '<button type="button" class="btn btn-default active" onclick="loadExitPetList(1,$(this))">1</button>';
				}
				//設定跳頁
				$("#toExitSurplusFirstPage").unbind("click").click(function(){
					loadExitSurplusList(1);
				});
				$("#toExitSurplusEndPage").unbind("click").click(function(){
					loadExitSurplusList(totalPage);
				});
				//設定跳頁結束
				//放入
				$("#toExitSurpluspageTab").html(btn);
			}
		});
	});

	if(typeof btnObject != "undefined"){
		$(btnObject).parent().find("button").removeClass("active");
		$(btnObject).addClass("active");
	}
	
}

//其他申請入場列表
function loadExitOtherList(goPage, btnObject){

	var start = (goPage - 1)*exitPetListPageRowShow;	
	exitPetListNowPage = goPage;

	var prj_mid = 1;
	var data;
	var totalPage;
	$("#exitOtherList").empty();

	$.getJSON(configObject.exitOtherItemList,{prj_mid:prj_mid,start:start,end:exitPetListPageRowShow}, function( info ) {
		data = info;
		totalPage = data.totla;
		//console.log(data);
	}).done(function(){
		$.get("pages/style/material/exit_other_list_content.html",function(pages){
			var title = $.parseHTML(pages);
			title = $(title).find(".list_title");
			$(title).appendTo("#exitOtherList");
			var countNO = 1;
			if(!$.isEmptyObject(data.list)){
				$.each(data.list,function(i,v){
					var content = $.parseHTML(pages);
					content = $(content).find(".list_content");
					//console.log(v);
					//$(content).find(".numbers").html(countNO);
					var uidNumber = btoa("AA0000"+v.exitID).replace("==","");
					$(content).find(".uid").html(uidNumber);
					$(content).find(".typeName").html(v.typeName);
					$(content).find(".count").html(v.exitCount);
					$(content).find(".date").html(v.date);
					$(content).find(".ofstatus").html(v.ofstatus);
					countNO++;
					$(content).appendTo("#exitOtherList");
				});
				//開始做頁碼
				$("#toExitOtherpageTab").empty();
				var btn = '';
				var totalPage = Math.ceil(data.total / exitPetListPageRowShow);
				if(data.total >= exitPetListPageRowShow){			
					for(var i=1; i<=totalPage; i++){
						if(i == nowPage){
							btn += '<button type="button" class="btn btn-default active" onclick="loadExitPetList('+i+',$(this))">' + i + '</button>';
						}else{
							btn += '<button type="button" class="btn btn-default" onclick="loadExitPetList('+i+',$(this))">' + i + '</button>';
						}
					}
					
				}else{
					btn = '<button type="button" class="btn btn-default active" onclick="loadExitPetList(1,$(this))">1</button>';
				}
				//設定跳頁
				$("#toExitOtherFirstPage").unbind("click").click(function(){
					loadExitSurplusList(1);
				});
				$("#toExitOtherEndPage").unbind("click").click(function(){
					loadExitSurplusList(totalPage);
				});
				//設定跳頁結束
				//放入
				$("#toExitSurpluspageTab").html(btn);
			}
		});
	});

	if(typeof btnObject != "undefined"){
		$(btnObject).parent().find("button").removeClass("active");
		$(btnObject).addClass("active");
	}
	
}