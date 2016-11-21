var global_language,langSet;

//取得語言設定
function getLan(){
    $.ajax({
        url: configObject.langSet,
        data: {type:"getLan"},
        type: "POST",
        async: false,
        dataType: "JSON",
        success:function(rs){
           //console.log(rs);
           if(rs.status){
               langSet = rs.lang;
               changLang(rs);
           }else{
               console.log(rs.msg);
           }
        }
    });
}

function changLang(lang,toSave){
	if(typeof toSave == 'undefined'){
		toSave = false;
	}
	
	if(typeof lang == 'undefined' || !lang){
        lang = langSet;
	}
	//取得語系檔內容
  if(lang.status){
    //console.log(lang.langContent);
    global_language = lang.langContent;
    $.each(global_language,function(i,val){
       //console.log(i,val);
       $("."+i).html(val);
       $("."+i+":button").val(val);
       $("."+i+":text").val(val);
    });
  }else{
    console.log(lang.msg);
  }

	if(toSave){
		$.post("status.php",{kind:"setLan",lang:lang});
		langSet = lang;
	}
}