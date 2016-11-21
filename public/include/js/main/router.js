var isPopstate = false;
//-----監聽上下頁事件-----
window.addEventListener('popstate', function(e){
	if (e.state) {
		isPopstate = true;
		firstLoadPage();
		isPopstate = false;
	}
},false);

//-----確認保留物件-----
function checkKeepItem(){
	$("head").find("script").each(function(){
		if($(this).prop("class").search("keep") == -1){
			$(this).addClass("keep");
		}
	});
	$("head").find("link").each(function(){
		if($(this).prop("class").search("keep") == -1){
			$(this).addClass("keep");
		}
	});
}

function firstLoadPage(){
	if(typeof getUrlParameter("pagetype") != "undefined"){
		loadPage(getUrlParameter("pagetype"),"pagescontent");
	}else{
		loadPage("home","pagescontent");
	}
}

function loadPage(page,contentID,removeHead,popstate){
	if(page == "./"){
		page = "home";
	}
	var pageInfo = {
		pagetype: page
	};

	var params = $.param(pageInfo);
	var hash = "";
	if(location.hash != ""){
		hash = location.hash;	
	}

	if(typeof popstate == "undefined"){
		popstate = (isPopstate)?true:false;
	}
	if(!popstate){
		window.history.pushState(page,null, "content.html?"+params+hash);
	}
	var time = new Date().getTime();
	var loadPage = 'pages/'+page+'.html?'+time;
	if(typeof removeHead == "undefined"){
		removeHead = true;
	}
	// 把不相關的標籤清除
	$("body").removeClass("modal-open");
	$("body").find(".modal-backdrop").remove();
	$("body").find(".modal").remove();
    $(".ui-datepicker").remove();
	loader(contentID);
	// 檢驗權限
	$.ajax({
    	url: configObject.verifyMenuPosition, 
    	type: "POST",
    	data: {page: page},
    	dataType: "json",
    	success: function(rs){
    		var itemObj = $("<div>").addClass("text-center");
			// 取頁面
			if(rs.status){
				$.ajax({
			    	url: loadPage, 
			    	type: "GET",
			    	success: function(contents){
			    		putContent( contentID, getRouterContent(contents), removeHead);
			    	},
			    	error: function(xhr, status, msg){
			    		itemObj.text("此功能暫不開放");
						putContent( contentID, itemObj );
			    	}
				});
			}else{
				itemObj.text("無權限預覽");
				putContent( contentID, itemObj );
			}
		},
		error: function(xhr, status, msg){
			var itemObj = $("<div>").addClass("text-center").text("無權限預覽");
			putContent( contentID, itemObj );
    	}
	});
	

//	$("#"+contentID).load(loadPage);
}
// hash
function hashLoadPage(page, hash, contentID, removeHead, popstate){
	if(page == "./"){
		page = "home";
	}
	var pageInfo = {
		pagetype: page
	};

	var params = $.param(pageInfo);
	var hashParams = "";
	if(hash == undefined){
		if(location.hash != ""){
			hashParams = location.hash;	
		}
	}else{
		if(typeof hash == "object"){
			hashParams = "#"+$.param(hash);
		}
	}
	

	if(typeof popstate == "undefined"){
		popstate = (isPopstate)?true:false;
	}
	if(!popstate){
		window.history.pushState(page,null, "content.html?"+params+hashParams);
	}
	var time = new Date().getTime();
	var loadPage = 'pages/'+page+'.html?'+time;
	if(typeof removeHead == "undefined"){
		removeHead = true;
	}
	// 把不相關的標籤清除
	$("body").removeClass("modal-open");
	$("body").find(".modal-backdrop").remove();
	$("body").find(".modal").remove();
    $(".ui-datepicker").remove();
	loader(contentID);
	// 檢驗權限
	$.ajax({
    	url: configObject.verifyMenuPosition, 
    	type: "POST",
    	data: {page: page},
    	dataType: "json",
    	success: function(rs){
    		var itemObj = $("<div>").addClass("text-center");
			// 取頁面
			if(rs.status){
				$.ajax({
			    	url: loadPage, 
			    	type: "GET",
			    	success: function(contents){
			    		putContent( contentID, getRouterContent(contents), removeHead);
			    	},
			    	error: function(xhr, status, msg){
			    		itemObj.text("此功能暫不開放");
						putContent( contentID, itemObj );
			    	}
				});
			}else{
				itemObj.text("無權限預覽");
				putContent( contentID, itemObj );
			}
		},
		error: function(xhr, status, msg){
			var itemObj = $("<div>").addClass("text-center").text("無權限預覽");
			putContent( contentID, itemObj );
    	}
	});
	

//	$("#"+contentID).load(loadPage);
}

function loader(itemObject,itemClass){
	if(typeof itemClass == "undefined"){
		itemClass = "content-loading-img";
	}
	var str = $('<img>').addClass(itemClass).prop("src","include/images/loader.svg");

	if(typeof itemObject == "string"){
		itemObject = "#"+itemObject;
	}
	// $(itemObject).block({message: str});
	$(itemObject).empty().append(str);
	
}

function getRouterContent(rsContent,removeHead){
	var tmpBody,tmpHead;
	if(removeHead == undefined){
		removeHead = true;
	}
	if(removeHead){
		$("head :not(.keep)").remove();
	}
	if(rsContent.toLowerCase().search("<head") != -1){
		tmpHead = rsContent.split("<head")[1].split(">").slice(1).join(">").split("</head>")[0];
		$(tmpHead).appendTo("head");
	}

	if(rsContent.toLowerCase().search("<body") != -1){
		tmpBody = rsContent.split("<body")[1].split(">").slice(1).join(">").split("</body>")[0];
	}
	if(typeof tmpBody != "undefined"){
		return tmpBody;
	}else{
		return;
	}
}

function putContent(contentID,contents){
	$("#"+contentID).fadeOut(700,function(){
		$(this).html(contents).fadeIn(100).unbind("tooltip").tooltip();
	});
}

function loadJS(jsSrc,jsClass,dataSrc){
	var script = $("<script>");
	script.prop("src",jsSrc);
	if(typeof dataSrc != "undefined"){
		script.attr("data-source",dataSrc);
	}
	if(typeof jsClass != "undefined"){
		script.addClass(jsClass);
	}
	script.appendTo("head");
}

//導引精靈模組
function elfguide(pageObject){
	// {
	// 	page:{},
	// 	itemValue:{},
	// 	start: int or string,
	// 	putArea: string,
	//	startHide: string,
	//	backAction: function,
	//	nextBtnAction: {
	// 		a: function,
	// 		....
	// 	},
	//  preBtnAction:{
	// 		a: function,
	// 		....
	// 	},
	//	breadcrumbs:{
	//		mean:{
	// 			name1: "mean value",
	// 			name2: "mean value",
	//		},
	// 		cancelClick:"name1,name2, ...", //string
	// 		clickAction:{
	// 			name1: function(){...},
	// 			name2: function(){...}
	// 		}
	// 		select: "name1" //default first object name
	// 	}
	// }
	if(typeof pageObject.putArea != "undefined"){
		var eg_path = "elfguide/";
		var pageOb = pageObject.page;
		var result = {};
		var countPage = 0;
		$("#"+pageObject.putArea).empty().show();
		if(typeof pageObject.start == "undefined"){
			pageObject.start = Object.keys(pageOb)[0];
		}
		if(typeof pageObject.startHide != "undefined"){
			itemFade(pageObject.startHide,false);
		}
		//建立breadcrumbs
		if(typeof pageObject.breadcrumbs != "undefined"){
			var breadcrumbs = pageObject.breadcrumbs;	
			//start
			if(typeof breadcrumbs.mean != "undefined"){
				var breadcrumbsItem = $.parseHTML('<ul id="breadcrumbs" class="nav nav-pills" role="tablist">');
				var cancelClick = [];
				if(typeof breadcrumbs.select == "undefined"){
					breadcrumbs.select = Object.keys(breadcrumbs.mean)[0];
				}

				if(typeof breadcrumbs.cancelClick != "undefined"){

					if(breadcrumbs.cancelClick.search(",") != -1){
						cancelClick = breadcrumbs.cancelClick.split(",");
					}else{
						cancelClick[0] = breadcrumbs.cancelClick;
					}
				}

				$.each(breadcrumbs.mean, function(i,v){
					var breadcrumbsContent = $.parseHTML('<li id="breadcrumbs-li-'+i+'" role="presentation">');
					var clickChild = $.parseHTML('<a href="#" class="item-noneborder">');
					$(clickChild).text(v).appendTo(breadcrumbsContent);

					if($.inArray(i,cancelClick) != -1){
						$(clickChild).click(function(){ return false; });
					}else{
						$(clickChild).click(function(){ 
							$(breadcrumbsItem).find(".active").removeClass("active");
							$(this).parent().addClass("active");
							$(".elfguide").hide();
							var fadeItem = $("#"+pageObject.putArea).find("#"+i);
							itemFade( fadeItem ,true);
							return false; 
						});
					}

					if(breadcrumbs.select == i){
						$(breadcrumbsContent).addClass("active");
					}
					$(breadcrumbsContent).appendTo(breadcrumbsItem);
				});
				$(breadcrumbsItem).appendTo("#"+pageObject.putArea);
			}

		}
		$.each(pageOb,function(i,v){
			var tmpPath = eg_path + v + ".html";
			var tmpContent;
			$.get(tmpPath,function(pagesContent){
				tmpContent = $.parseHTML('<div class="elfguide" id="'+i+'">'+pagesContent+'</div>');
			}).done(function(){
				var keys = Object.keys( pageOb ),
	            idIndex = keys.indexOf( i ),
	            nextIndex = idIndex += 1,
	            preIndex = idIndex -= 2,
				nextKey = keys[ nextIndex ],
				preKey = keys[ preIndex ];
				//尚未塞值，待會寫

				// 塞值
				if(typeof pageObject.modifyData == "object"){

					if(Object.size(pageObject.modifyData)){
						$.each(pageObject.modifyData, function(index, value){
							$(tmpContent).find("#"+index).val(value);
						});
					}
				}


				if(typeof pageObject.backAction == "function"){
					$(tmpContent).find(".backBtn").click(function(){
						itemFade(pageObject.startHide,true);
						itemFade(pageObject.putArea,false);
						pageObject.backAction();
					});
				}
				// 若有需要選日期的部分，自動載入datepicker
				if($(tmpContent).find(".date").length){
					if(pageObject.dateOption != undefined){
						$(tmpContent).find(".date").datepicker(pageObject.dateOption);
					}else{
						$(tmpContent).find(".date").datepicker();
					}
				}

				if(typeof pageObject.selectData[i] == "object"){
					$.each(pageObject.selectData[i], function(id, data){
						data( $(tmpContent).find("#"+id) );
						// $(putData).appendTo();
					});
				}
				
				if(typeof pageObject.nextBtnAction[i] == "function"){
					$(tmpContent).find(".nextBtn").click(function(){
						var nowItem = $("#"+pageObject.putArea).find("#"+i);
						var nextItem;
						if(typeof nextKey != "undefined"){
							nextItem = $("#"+pageObject.putArea).find("#"+nextKey);

							var inBreadcrumbs = $("#"+pageObject.putArea).find("#breadcrumbs");
							inBreadcrumbs.find(".active").removeClass("active");
							inBreadcrumbs.find("#breadcrumbs-li-"+nextKey).addClass("active");

						}else{
							nextItem = null;
						}
						
						
						pageObject.nextBtnAction[i]( nowItem,nextItem );
					});
				}

				if(typeof pageObject.preBtnAction[i] == "function"){
					$(tmpContent).find(".preBtn").click(function(){
						var nowItem = $("#"+pageObject.putArea).find("#"+i);
						var preItem;
						if(typeof preKey != "undefined"){
							preItem = $("#"+pageObject.putArea).find("#"+preKey);

							var inBreadcrumbs = $("#"+pageObject.putArea).find("#breadcrumbs");
							inBreadcrumbs.find(".active").removeClass("active");
							inBreadcrumbs.find("#breadcrumbs-li-"+preKey).addClass("active");

						}else{
							preItem = null;
						}
						pageObject.preBtnAction[i]( nowItem, preItem );
					});
				}

				if(typeof pageObject.finishBtnAction == "function"){
					$(tmpContent).find(".finishBtn").click(function(){
						var data = {};
						// 若有設置 dataClass 參數，則以此進行資料取得
						if(pageObject.dataClass != undefined){
							if(typeof pageObject.dataClass == "string"){
								$("#"+pageObject.putArea).find("."+pageObject.dataClass).each(function(){
									var inputType = $(this).prop("type");
									var isInput = false;
									var value = $(this).val();
									
									if(inputType != "radio" && inputType != "checkbox"){
										isInput = true;
									}
									if($.trim($(this).prop("name")).length && isInput){
										data[$(this).prop("name")] = value;
									}else if($.trim($(this).prop("id")).length && isInput){
										data[$(this).prop("id")] = value;
									}else{
										var id = $(this).prop("name");
										if(!$.trim(id).length && $(this).prop("checked")){
											id = $(this).prop("id");
											value = $(this).val();
											if(value == undefined){
												value = true;
											}
											data[id] = value;
											// console.log(id,value);
										}else if($.trim(id).length){
											value = $("[name="+id+"]:checked").val();
											if(value == undefined){
												value = true;
											}
											data[id] = value;
										}
									}
								});
							}else{
								$("#"+pageObject.putArea).find(pageObject.dataClass).each(function(){
									var inputType = $(this).prop("type");
									var isInput = false;
									if(inputType != "radio" && inputType != "checkbox"){
										isInput = true;
									}
									if($.trim($(this).prop("name").length) && isInput){
										data[$(this).prop("name")] = $(this).val();
									}else if($.trim($(this).prop("id").length) && isInput){
										data[$(this).prop("id")] = $(this).val();
									}else{
										var id = $(this).prop("name");
										var value = $("[name="+id+"]:checked").val();
										if(value == undefined){
											value = true;
										}
										data[id] = value;
									}
								});
							}
							var finishClose = function(){
								itemFade( pageObject.putArea,false);
								itemFade( pageObject.startHide,true);
							};
							pageObject.finishBtnAction( data, finishClose );
						}else{
							var finishClose = function(){};
							pageObject.finishBtnAction( 'dataClass is not setting', finishClose );
						}
						
					});
				}

				$(tmpContent).hide().appendTo("#"+pageObject.putArea);
				if(pageObject.start == i){
					$(tmpContent).fadeIn(500);	
				}
			});
		});
	}else{
		console.log("pageObject.putArea is not set!");
	}
}



var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var getHashParameter = function getHashParameter() {
	if(window.location.hash.substring(1) != ""){
	    var sPageURL = decodeURIComponent(window.location.hash.substring(1)),
	        sURLVariables = sPageURL.split('&'),
	        sParameterName,
	        i,
	        sObject = {};

	    for (i = 0; i < sURLVariables.length; i++) {
	        sParameterName = sURLVariables[i].split('=');
	        sObject[ sParameterName[0] ] = sParameterName[1] === undefined ? null : sParameterName[1];
	    }

	    return sObject;
	}else{
		return null;
	}
};

var deleteHash = function(){
	var orgSearch = window.location.search.substring(1);
	var sPageURL = decodeURIComponent(orgSearch);	
	sURLVariables = sPageURL.split('&');
	sParameterName = sURLVariables[0].split('=');
	if(orgSearch){
		orgSearch = "?"+orgSearch;
	}
	var organizePathname = window.location.pathname.substring(1);
	window.history.pushState(sParameterName[1],null, organizePathname+orgSearch);
};