function getStyle(pageStyleOption,callback){

	var stylePath = pageStyleOption.styleKind+"/"+pageStyleOption.style;
 	var time = new Date().getTime()
	$.get("pages/style/"+stylePath+".html?"+time).done(function(pageStyle){
		callback(pageStyle);
	});
}

function getBorder(style,callback){

	var stylePath = "style/border/"+style;

	$.get("pages/"+stylePath+".html?"+time).done(function(pageStyle){
		callback(pageStyle);
	});
}

function getPage(pageOption,callback){

	var stylePath = pageOption.styleKind+"/"+pageOption.style;

	$.get("pages/"+stylePath+".html"+time).done(function(pageStyle){
		callback(pageStyle);
	});
}