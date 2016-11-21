// 簽核預覽
function signStatusViewDialog(modifyObj){
    // console.log(modifyObj);
    $("#signStatusViewDialog").remove();
    var signStatusViewDialog = $("<div>").prop("id","signStatusViewDialog");
    signStatusViewDialog.appendTo("body");

    $("#signStatusViewDialog").bsDialog({
        title: modifyObj.doc_number + " 簽核狀態預覽",
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
    $.blockUI();
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
            if(rs.status){
                var signData = rs.data;
                // var contractorsData = $.extend({}, signData[0][0], {});
                // contractorsData.status = 1;
                // contractorsData.org = {
                //     orgName: "承辦"
                // };
                // contractorsData.user = [];
                // var pricipalUserName = (contractorsRS.data[0].pricipalUser != undefined && contractorsRS.data[0].pricipalUser != null)?contractorsRS.data[0].pricipalUser[0].name:"無法取得承辦資訊";
                // userObj = {
                //     name : pricipalUserName
                // }
                // contractorsData.user.push(userObj);
                // contractorsData.layer = -1;
                // contractorsData.uid = 0;
                // contractorsData.appr_date = contractorsData.start_date;
                // contractorsData.remark = null;
                // contractorsData.name = pricipalUserName;

                // var tmpData = []
                // tmpData.push(contractorsData);
                // signData.splice(0, 0, tmpData);

                creatSignStatusChart($(insertPageObj), signData);
                $(insertPageObj).appendTo($("#signStatusViewDialog").find(".modal-body"));
            }else{
                var putArea = $("<div>").addClass("contents");
                $("#signStatusViewDialog").find(".modal-body").append(putArea);
                putEmptyInfo(putArea);
            }
            $.unblockUI();
        });
        

        // 放到畫面中

        // getQCTableTypeList("tableTypeTab","tableType",true);
    });
}

// 創建圖示
function creatSignStatusChart(putArea, data){
    // console.log(putArea, data);
    // return;
    // $(putArea).empty();
    var putStatusArea = putArea.find("#signStatusArea");
    if(data.length){
        var progressBarWidth = 275*data.length;
        putStatusArea.parent().width(progressBarWidth);
        // 前一階最後簽完日期
        var preLayerEndDate = "";
        var preLayerEndTime = 0;

        $.each(data, function(i, v){
            var baseChart = $('<div>').addClass("processBorder");
            if(i > 0){
                baseChart.addClass("progressBar-other");
            }
            var date = $('<div>').addClass("date");
            var signStatus = $('<div>').addClass("signStatus");
            baseChart.append(date);
            var baseBar = $('<div>').addClass('bar');
            // 以加總方式判斷是否有全數通過或退件
            var countPassNumber = 0;
            $.each(v, function(layerIndex, layerContent){
                var baseContent = $('<div>').addClass("processContent");
                var org = $('<div>').addClass("org");
                var userName = $('<div>').addClass("title list-item-hide-text");
                var signDate = $('<div>').addClass("signDate");
                
                // 放入組織名稱
                if(layerContent["org"]!=undefined){
                    var orgName = layerContent["org"]["orgName"];
                    if(i == 0){
                        orgName += "(承辦單位)";
                    }
                    org.text(orgName);
                    baseContent.append(org)
                    .append(userName)
                    .append(signDate);
                }

                var nameText = "";
                if(layerContent.user == undefined){
                    nameText = "未設定主管";
                }else{
                    $.each(layerContent.user, function(uIndex,uContent){
                        nameText += uContent.name + ",";
                    });
                    nameText = nameText.substr(0,nameText.length - 1);
                }
                if(i == 0){
                    date.text(layerContent.start_date);
                }else{
                    if(preLayerEndDate == ""){
                        preLayerEndDate = "順序" + (i+0) + "未完成";
                    }
                    date.text(preLayerEndDate);
                }
                
                if(parseInt(layerContent.status) == 13){
                    userName.addClass("done");
                    // label.html("&#10003;");
                    signDate.text(layerContent.appr_date);
                    countPassNumber++;
                    nameText = layerContent.name;
                }else if(parseInt(layerContent.status) == 12 || parseInt(layerContent.status) == 4){
                    userName.addClass("ban");
                    // label.html("&#x2717;");
                    signDate.text(layerContent.appr_date);
                    countPassNumber += countPassNumber + 30;
                    nameText = layerContent.name;
                }else{
                    // nameText = layerContent.statusName;
                    signDate.text("-");
                }
                
                // 放入原因
                if(layerContent.remark != null){
                    putRemark(putArea.find("#remarkArea"), layerContent.org.orgName, layerContent.name , layerContent);
                }
                userName.text(layerContent.statusName).prop("title",nameText).tooltip();

                baseChart.append(baseContent);
                // countPassNumber += parseInt(layerContent.status);

                // 計算最後簽核日期
                if(layerContent.appr_date){
                    var apprDate = new Date(layerContent.appr_date);
                    var apprTime = apprDate.getTime();
                    if(apprTime > preLayerEndTime){
                        preLayerEndDate = layerContent.appr_date;
                    }
                }

            });
            var signStatusStr = "順序"+(i+1);
            if(countPassNumber == v.length){
                signStatusStr += "完成";
                baseBar.addClass("barDone");
            }else if(countPassNumber < v.length){
                signStatusStr += "未完成";
            }else if(countPassNumber > v.length){
                signStatusStr += "退件";
            }
            signStatus.text(signStatusStr);
            baseChart.append(signStatus);
            
            $(putStatusArea).append(baseChart);

            if(i+1 < data.length){
                $(putStatusArea).append(baseBar);
            }
        });
    }else{
        putEmptyInfo(putStatusArea);
    }
}

function putRemark(putArea, orgName, userName, data){
    // console.log(data);
    var option = {styleKind:"received-issued",style:"remark-list"};
    getStyle(option,function(remarkPage){
        var remarkPageObj = $.parseHTML(remarkPage);
        $(remarkPageObj).find(".list-items").eq(0).text(orgName);
        $(remarkPageObj).find(".list-items").eq(1).text(userName);
        $(remarkPageObj).find(".list-items").eq(2).html(data.remark);
        var statusStr = "";
        var statusClass = "";
        // if(parseInt(data.status) == 13){
        //     statusStr = "通過";
        // }else if(parseInt(data.status) == 4 || parseInt(data.status) == 12){
        //     statusStr = "退件";
        //     statusClass = "received-back";
        // }else if(parseInt(data.status) == 12){
        //     statusStr = "作廢";
        //     statusClass = "received-back";
        // }
        statusStr = data.statusName;
        if(parseInt(data.status) == 4 || parseInt(data.status) == 12){
            statusClass = "received-back";
        }

        $(remarkPageObj).find(".list-items").eq(3).addClass(statusClass).text(statusStr);
        $(remarkPageObj).find(".list-items").eq(4).text(data.appr_date);
        $(remarkPageObj).appendTo(putArea);
    });
}