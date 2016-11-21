function getMenus(loginInfo){
  // var menus = porcessData(configObject.getmenu,loginInfo);
	var menus = porcessData(configObject.getUserMenu,{});
  // 載入頁面
  firstLoadPage();
  var options = {
      idName: "uid",
      title: "memo",
  }

  meunData = processMenuTreeDataOnly(menus.data,options);
  // console.log(meunData);
  $("#menus").empty();
  $.each(meunData,function(i, content){
    content.find("a").click(function(){
      var thisHref = $(this).attr("href");
      if(thisHref != "#"){
        $("#pagescontent").empty();
        loadPage($(this).attr("href"),"pagescontent");
      }
      // 登出機制，只要再CLASS裡面有logout關鍵字的連結走這裡
      if($(this).prop("class").search("logout") != -1){
        logoutEven();
      }
      return false;
    });
    content.appendTo($("#menus"));
  });
 //  	getLan();
	loadJS("include/strongly/assets/js/content-main.js","keep");
}