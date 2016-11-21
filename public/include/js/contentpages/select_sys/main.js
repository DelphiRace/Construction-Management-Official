$(function(){
    getData();
});

// 取得資料
function getData(){
    $.blockUI({
        message: "Loading..."
    });

    loader($("#grid"));

    var sendData = {
        // api: ctrlAuthorityAPI+"GetData_AssBaseGroup",
        api: syslistAPI,
        threeModal: true,
        data: {
            sysList: userLoginInfo.sysList
        }
    }
    
    // ＡＰＩ呼叫
    $.post(wrsUrl, sendData ).done(function(rs){
        console.log(rs);
        var rs = $.parseJSON(rs);

        $("#grid").empty();
        if(rs.status){
            putDataToPage(rs.data);

        }else{
            // 放入空的
            putEmptyInfo($("#grid"));
        }
        $.unblockUI();
        // console.log(rs);
    }).fail(function(){
        // 放入空的
        putEmptyInfo($("#grid"));
        $.unblockUI();

    });
}

// 放資料
function putDataToPage(data){
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"select-sys",style:"list"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        $.each(data,function(index,content){
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");
            // 名稱
            $(pageStyleObj).find(".list-items").eq(0).html(content.name).click(function(){
                // 設定系統代碼
                setUserSysCode(content.codeID);
            });
            $(pageStyleObj).appendTo($("#grid"));

        });
        $("#grid").find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}