/*
*/
function tabCtrl(itemID,option){
	if(typeof option == "undefined"){
		option = {};
	}
	//先初始化
	$("."+itemID+"-tab-content").hide();

	$("#"+itemID+" li a").each(function(){
		var id = $(this).prop("id");
		var thisLiClass = $(this).parent().prop("class");
		$("#"+id+"-content").addClass(itemID+"-tab-content");
		if( thisLiClass.search("active") != -1){
			$("#"+id+"-content").show();
		}
	});
	//設定功能頁籤
  	$("#"+itemID+" li a").click(function(){
  		var contentID = $(this).prop("id");
       
        $("#"+itemID+" li").removeClass("active");
        $(this).parent().addClass("active");
        $("."+itemID+"-tab-content").hide();
        contentID += "-content";
        $("#"+contentID).show();
        return false;
    });
}

// 共用顯示區域
function tabContentCtrl(itemID){
	//設定功能頁籤
	var item;
	if(typeof itemID == "string"){
	  	item = $("#"+itemID);
  	}else{
  		item = $(itemID);
  	}
  	item.find("li a").click(function(){
  		var contentID = $(this).prop("id");
        item.find("li").removeClass("active");
        $(this).parent().addClass("active");
        return false;
    });
}