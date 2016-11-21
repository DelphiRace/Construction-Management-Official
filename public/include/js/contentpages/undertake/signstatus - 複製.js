// 簽核預覽
function signStatusViewDialog(modifyObj){
    console.log(modifyObj);
    $("#signStatusViewDialog").remove();
    var signStatusViewDialog = $("<div>").prop("id","signStatusViewDialog");
    signStatusViewDialog.appendTo("body");

    $("#signStatusViewDialog").bsDialog({
        title: modifyObj.doc_number,
        autoShow: true,
        modalClass: "bsDialogWindow",
        start: signStatusViewStart(modifyObj),
        button:[
        
            {
                text: "關閉",
                className: "btn-default-font-color",
                click: function(){
                    $("#signStatusViewDialog").bsDialog("close");
                }
            },
        ]
    });
}

// 簽核預覽時開啟的動作要做的事情
function signStatusViewStart(modifyObj){
    var option = {styleKind:"received-issued",style:"sendDoc-signStatus"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        // $.each(modifyObj, function(i, content){
        //     $(insertPageObj).find("#"+i).html(content);
        // })
        var sendObj = {
            api: apdAPI + "Get_ApdDataSignStatus",
            threeModal: true,
            data:{
                sys_code:sys_code,
                docUid: modifyObj.uid
            }

        };
        $.getJSON(wrsUrl, sendObj, function(rs){
            // console.log(rs);
            if(rs.status){
                creatSignStatusChart($(insertPageObj), rs.data);
                $(insertPageObj).appendTo($("#signStatusViewDialog").find(".modal-body"));

            }else{
                var putArea = $("<div>").addClass("contents");
                $("#signStatusViewDialog").find(".modal-body").append(putArea);
                putEmptyInfo(putArea);
            }
        });
        
        // 放到畫面中

        // getQCTableTypeList("tableTypeTab","tableType",true);
    });
}

function creatSignStatusChart(putArea, data){
    // console.log(putArea, data);
    // return;
    // $(putArea).empty();
    var putStatusArea = putArea.find("#signStatusArea");
    if(data.length){
        var progressBarWidth = 150*data.length;
        putStatusArea.parent().width(progressBarWidth);
        $.each(data, function(i, v){
            var baseChart = $('<div>').addClass("circle");
            var date = $('<span>').addClass("data");
            var label = $('<span>').addClass("label");
            var userName = $('<div>').addClass("title list-item-hide-text");
            var signData = $('<span>').addClass("signData");
            var baseBar = $('<span>').addClass('bar');
            var nameText = "";
            if(v.user == undefined){
                nameText = "未有主管";
            }else{
                $.each(v.user, function(uIndex,uContent){
                    nameText += uContent.name;
                });
            }

            if(i == 0){
                date.text(v.start_date);
                if(!parseInt(v.status)){
                    baseChart.addClass("active");
                    label.html(i+1);
                }else if(parseInt(v.status) == 1){
                    baseChart.addClass("done");
                    putRemark(putArea.find("#remarkArea"), i+1 , v);
                    label.html("&#10003;");
                    nameText = v.name;
                    signData.text(v.appr_date);
                    baseBar.addClass("done");
                }else{
                    baseChart.addClass("ban");
                    putRemark(putArea.find("#remarkArea"), i+1 , v);
                    label.html("&#x2717;");
                    signData.text(v.appr_date);
                    nameText = v.name;
                }
            }else{
                var startDate = data[i-1]["appr_date"];
                if(startDate != null){
                    date.text(startDate);
                }   
                if(!parseInt(v.status) && parseInt(data[i-1]["status"]) == 1){
                    baseChart.addClass("active");
                    label.html(i+1);
                    baseBar.addClass("half");
                }else if(parseInt(v.status)){
                    baseChart.addClass("done");
                    label.html("&#10003;");
                    nameText = v.name;
                    baseBar.addClass("done");
                }else{
                    label.html(i+1);
                }
            }
            userName.text(nameText);
            baseChart.prop("title",nameText).tooltip();
            
            
            baseChart.append(date).append(label).append(userName).append(signData);
            $(putStatusArea).append(baseChart);
            if(i+1 < data.length){
                $(putStatusArea).append(baseBar);
            }
        });
    }else{
        putEmptyInfo(putStatusArea);
    }
}

function putRemark(putArea, seq, data){
    var option = {styleKind:"received-issued",style:"remark-list"};
    getStyle(option,function(remarkPage){
        var remarkPageObj = $.parseHTML(remarkPage);
        $(remarkPageObj).find(".list-items").eq(0).text(seq);
        $(remarkPageObj).find(".list-items").eq(1).html(data.remark);
        var statusStr = "";
        var statusClass = "";
        if(parseInt(data.status) == 1){
            statusStr = "通過";
        }else if(parseInt(data.status)  == 2){
            statusStr = "退件";
            statusClass = "received-back";
        }
        $(remarkPageObj).find(".list-items").eq(2).addClass(statusClass).text(statusStr);
        $(remarkPageObj).find(".list-items").eq(3).text(data.appr_date);
        $(remarkPageObj).appendTo(putArea);
    });
}