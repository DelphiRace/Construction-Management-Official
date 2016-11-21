$(function(){
	loadTmpCardDataContent();
});

function loadTmpCardDataContent(){
	var tmpCardTableContent = $("#cardUserData").html();
	loader("cardUserData");
	var tContentStyle;
	$.get("pages/style/sar/tmpCardDataMana_content_style.html",function(rs){
		tContentStyle = rs;
	}).done(function(){
		$.getJSON(configObject.tmpCardUserInfo,{},function(data){
			//console.log(data);
			$("#cardUserData").html(tmpCardTableContent);
			if(data.status){
				var ui_data = data.ui_data;

				$.each(ui_data,function(i,v){
					var tContent = $.parseHTML(tContentStyle);
					$(tContent).find(".cardID").html(v.number);
					$(tContent).find(".userID").html(v.user_id);
					setThisMouseEvent(tContent);
					$(tContent).prop("id",v.uid).appendTo("#cardUserData");
				});
				
			}
		})
		
	});
}

function setThisMouseEvent(object){
	$(object).mouseover(function(){
		$(this).addClass("item-hover").find(".action-btn").find(".toEdit").show();
	}).mouseout(function(){
		$(this).removeClass("item-hover").find(".action-btn").find(".toEdit").hide();
	});
}

function getThisTDParents(object){
	return $(object).parent().parent().parent();
}

function showDetail(object){
	$("#tmpCardDataMana_dialog").remove();
	var thisParent = getThisTDParents(object);
	var thisID = $(thisParent).prop("id");
	//tmpCardDataMana_dialog.html
	var tContentStyle;
	$.get("pages/style/sar/tmpCardDataMana_dialog.html",function(rs){
		tContentStyle = rs;
	}).done(function(){
		$.post(configObject.tmpCardUserDetail,{uid:thisID},function(data){
			var rsObject = $.parseJSON(data);
			var tContent = $.parseHTML(tContentStyle);
			var rsContent = rsObject.ui_data[0];
			$('<div id="tmpCardDataMana_dialog">').appendTo("#tmpCardDataMana");

			if(rsObject.status){
				$.each(rsContent,function(i,v){
					if(i != 'imgfile'){
						$(tContent).find("#"+i).html(v);
						$(tContent).find("#"+i).val(v);
					}else{
						$(tContent).find("#thisPhoto").prop("src",v.img0);
					}
				});
				$(tContent).find("#modifyID").val(thisID);
				$(tContent).appendTo("#tmpCardDataMana_dialog");
			}else{
				$(rsObject.msg).appendTo("#tmpCardDataMana_dialog");
			}

			$("#tmpCardDataMana_dialog").dialog({
		      modal: true,
		      width: "80%"
		    });
		});
	});
}

//存相關資訊
function tmpCardDataSaveBtn(object){
	$(object).addClass("item-ischeck");
	var userInputObject = getUserInput("tmpCardDataMana_dialog");
	var id = $("#tmpCardDataMana_dialog").find("#modifyID").val();
	userInputObject.uid = id;
	$.post(configObject.tmpCardModifyUserDetail,userInputObject);
	console.log(userInputObject);

}