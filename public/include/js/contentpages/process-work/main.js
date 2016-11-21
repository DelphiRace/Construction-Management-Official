$(function(){
    getMenuData();
});
var meunData;
var treeView;

function getMenuData(){
    loader($("#treeArea"));
    var sendData = {
        api: pwAPI+"GetData_ProcessWork",
        threeModal: true,
        data: {}
    }
    
    // ＡＰＩ呼叫
    getPageListData(sendData, function(rs){
        if(rs.status){
            $("#treeArea").empty();
            var options = {
                idName: "uid",
                title: "name",
            }

            meunData = processTreeDataOnly(rs.data,options);
            console.log(meunData);
            treeView = $("#treeArea").treeView({
                data: meunData[0],
                title: "start_date,end_date",
                titleTextSplit: " ~ ",
                // expansion: false,
                // expansionLevel: 1,
                editorBtn:{
                    insertBtn: '<i class="fa fa-plus-circle"></i>',
                    modifyBtn: '<i class="fa fa-pencil-square-o"></i>',
                    deleteBtn: '<i class="fa fa-trash-o"></i>' 
                },
                checkbox:false,
                editor:{
                    insertBtn: function(data, object){
                        // console.log(object.parent(), $(object).index( 'li.treeContent' ));
                        // console.log($(object).index() , $(object.parent()).index() );
                        // console.log($( object.parents(".treeViewContent").eq(0) ).index(), object.parents(".treeViewContent").eq(0));
                        // console.log($( object.parents(".treeViewContent").eq(0) ).index(), object.parents(".treeViewContent").eq(0));
                        // console.log(object.parent().parents(),$("#treeArea").index(object));
                        insertDialog( data, object );
                    },
                    modifyBtn: function(data, object){
                        // console.log(data);
                        insertDialog( data, object, true );
                    },
                    deleteBtn: function(data){
                        console.log(data);
                        deleteData(data.uid, data.name)
                    }
                },
                start: function(){
                    $("#treeArea").find("ul.treeViewContent").sortable({
                        connectWith: ".treeContent,.treeViewContent",
                        placeholder: "highlight",
                        start: function (event, ui) {
                            ui.item.toggleClass("highlight");
                        },
                        stop: function (event, ui) {
                            ui.item.toggleClass("highlight");
                        }
                    });
                    // $("#treeArea").find(".treeViewContent").disableSelection();
                }
            });
            // console.log(meunData);
        }else{
            $("#treeArea").empty();
            putEmptyInfo($("#treeArea"));
        }
    });
}

// 新增&修改Dialog
function insertDialog(treeViewData,clickObject,modifyStatus){
    // console.log(treeView.getParents(treeViewData.id));
    var treeViewDataIsNull = false;
    if(treeViewData == undefined){
        treeViewData = {};
    }

    if(Object.size(treeViewData)){
        var parentArr = treeView.getParents(treeViewData.id);
    }else{
        treeViewDataIsNull = true;
    }
    // console.log(treeViewData);
    if(modifyStatus == undefined){
        modifyStatus = false;
    }
    var saveBtn = "";
    if(modifyStatus){
        title = "修改工作項目";
        saveBtn = "修改";
    }else{
        title = "新增工作項目";
        saveBtn = "新增";
    }

    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title:title,
        start: function(){
          var option = {styleKind:"process-work",style:"insert"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            // 第一格是名字
            var nameArea = $(insertPageObj).find(".list-items").eq(0).find("input:text").addClass("userInput").prop("id","name");
            
            var dateOption = {
                dateFormat: "yy-mm-dd",
                
                showOn: "button",
                buttonText: '<i class="fa fa-calendar fa-lg mouse-pointer send-btn"></i>',
                onSelect: function(dateText, inst) {
                    // end_date_content
                    $(insertPageObj).find("#start_date_content").removeClass("item-bg-danger").text(dateText);

                },
                minDate: 0
            }

            $(insertPageObj).find("#start_date").datepicker(dateOption);

            var dateOption = {
                dateFormat: "yy-mm-dd",
                
                showOn: "button",
                buttonText: '<i class="fa fa-calendar fa-lg mouse-pointer send-btn"></i>',
                onSelect: function(dateText, inst) {
                    // end_date_content
                    $(insertPageObj).find("#end_date_content").removeClass("item-bg-danger").text(dateText);

                },
                minDate: 0
            }

            $(insertPageObj).find("#end_date").datepicker(dateOption);

            // 第四格是父層相關資訊
            var parentInfo = "";
            if(!treeViewDataIsNull){
                if(parentArr.length){
                    for(var i = (parentArr.length - 1); i >= 0 ; i--){
                        parentInfo += parentArr[i]["memo"] + " > ";
                        // console.log(parentArr[i]);
                    }
                    if(!modifyStatus){
                        parentInfo += treeViewData.name;
                    }else{
                        parentInfo = parentInfo.substring(0,parentInfo.length-3);
                    }
                }else{
                    
                    if(!modifyStatus){
                        parentInfo = treeViewData.name;
                    }else{
                        parentInfo = "Root";
                    }
                    
                }
            }else{
                parentInfo = "Root";
            }

            $(insertPageObj).find(".list-items").eq(3).find(".control-label").eq(0).text("所屬工作");
            $(insertPageObj).find(".list-items").eq(3).find(".control-label").eq(1).text(parentInfo);
            // var remarkArea = $(insertPageObj).find(".list-items").eq(3).find("input:text").addClass("userInput").prop("id","nid");

            if(modifyStatus){
                nameArea.val(treeViewData.name);
                $(insertPageObj).find("#start_date").val(treeViewData.start_date);
                $(insertPageObj).find("#start_date_content").html(treeViewData.start_date);
                $(insertPageObj).find("#end_date").val(treeViewData.end_date);
                $(insertPageObj).find("#end_date_content").html(treeViewData.end_date);

            }

            // 放入
            $(insertPageObj).appendTo( $("#insertDialog").find(".modal-body") );

          });
        },
        button:[
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var data = getUserInput("insertDialog");
                    var sequence = 0;
                    if(modifyStatus){
                        data.parent = treeViewData.parent;
                        data.uid = treeViewData.uid;                        
                    }else{
                        if(treeViewDataIsNull){
                            data.parent = 0;
                        }else{
                            data.parent = treeViewData.uid;
                        }
                    }

                    if(treeViewData != undefined){
                        if(treeViewData.parent == 0){
                            $(clickObject).find(".treeViewContent").filter(function(){
                                var parent = $(this).parent().prop("class").search("roots");
                                if(parent != -1){
                                    sequence++;
                                }
                            });
                        }else{
                            sequence = $(clickObject.parent()).index();

                        }
                    }else{
                        sequence = $(clickObject.parent()).index();
                    }
                    data.sequence = sequence;
                    // console.log(data);
                    // return;
                    // if(uid != undefined){
                    //     data.uid = uid;
                    //      // console.log(data);
                    // }
                    // data.gpname = $("#insertDialog").find("#groupid :selected").text();
                    var isNull = false;
                    $.each(data,function(i,v){
                        if($.trim(v) == ""){
                            isNull = true;
                        }
                    });
                    if(!isNull){
                        // console.log(data);
                        saveData(data,clickObject, treeViewDataIsNull);
                        // $("#insertDialog").bsDialog("close");
                    }
                }
            },
            {
                text: "取消",
                className: "btn-default-font-color",
                click: function(){
                    $("#insertDialog").bsDialog("close");
                }
            },
        ]
    });

}

// 儲存
function saveData(data, clickObject, treeViewDataIsNull){

    var processAPI = "Insert_ProcessWork";

    if(data.uid != undefined){

        processAPI = "Update_ProcessWork";

    }

    var sendData = {
        api: pwAPI+processAPI,
        threeModal: true,
        data: data
    }
    // console.log(data);
    // console.log(sendData);
    $.post( wrsUrl, sendData, function(rs){
        // console.log(rs);
        
        rs = $.parseJSON(rs);
        if(rs.Status){
        // 新增
            // if(treeViewDataIsNull){
                var sendData = {
                    api: pwAPI+"GetData_ProcessWork",
                    threeModal: true,
                    data: {}
                }
                
                // ＡＰＩ呼叫
                $.getJSON( wrsUrl, sendData ).done(function(rs){
                    if(rs.status){
                        $("#treeArea").empty();
                        var options = {
                            idName: "uid",
                            title: "name",
                        }
                        meunData = processTreeDataOnly(rs.data, options);
                        treeView.reload({data:meunData[0]});
                        // console.log(meunData);
                    }
                });
                
            // }
        }
        $("#insertDialog").bsDialog("close");
    });

}

// 刪除
function deleteData(uid, name){
    var sendData = {
        api:  pwAPI + "Delete_ProcessWork",
        threeModal: true,
        data:{
            uid: uid
        }
    };
    // return;
    $.post(wrsUrl,sendData,function(rs){
        // console.log(rs);
        rs = $.parseJSON(rs);
        if(rs.Status){
            var sendData = {
                    api: pwAPI+"GetData_ProcessWork",
                    threeModal: true,
                    data: {}
                }
            // ＡＰＩ呼叫
            $.getJSON( wrsUrl, sendData ).done(function(rs){
                if(rs.status){
                    $("#treeArea").empty();
                    var options = {
                        idName: "uid",
                        title: "name",
                    }
                    meunData = processTreeDataOnly(rs.data, options);
                    treeView.reload({data:meunData[0]});
                    // console.log(meunData);
                }
            });

        }else{
            // 無法刪除
            couldNotDeleteDialog(name);
        }
    });
}

// 當無法刪除時，提供說明
function couldNotDeleteDialog(name){
    $("#couldNotDeleteDialog").remove();
    $("<div>").prop("id","couldNotDeleteDialog").appendTo("body");

    $("#couldNotDeleteDialog").bsDialog({
    start: function(){
        var string = name+" 已被使用，故無法刪除";
        $("#couldNotDeleteDialog").find(".modal-body").html(string);
    },
    button:[
        {
            text: "關閉",
            className: "btn-danger",
            click: function(){
                $("#couldNotDeleteDialog").bsDialog("close");
            }
        }
    ]
    });

}