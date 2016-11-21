var getMenu = function (dataObject) {
    this.menu = useGetAjax(configObject.getmenu,dataObject);
};

getMenu.prototype = {
    menu: '',
    MenuContent: function () {
        //var menuStyle = useGetAjax(configObject.menuProcess,this.menu);
        $("#menus").html(this.menu.menu);
        getLan();
        //處理連結問題
        $("a").click(function(){
            var thisHref = $(this).attr("href");
            if(thisHref != "#"){
              location.href = location.origin + "/" + $(this).attr("href");
            }
            return false;
        });
        //return this.menu;
    }
};

//取得資訊
function useGetAjax(url, data){
    var result = '';
    if(typeof data === 'undefined'){
        data = {};
    }
    $.ajax({
       url: url,
       type: "POST",
       data: data,
       async: false,
       dataType: "JSON",
       success: function(rs){
           //console.log(rs);
           if(rs.status){
               result = rs;
           }else{
               console.log(rs.msg);
           }
       }
    });
    return result;
}



