// 新增&修改Dialog
function insertDialog(modifyObj, modifyItem){
    // 新增細項容器
    var detailArr = [];
    // console.log(modifyObj, modifyItem);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(modifyObj != undefined){
        title = "修改事項";
        saveBtn = "修改";
    }else{
        switch(calendarType){
            case 1:
                title = "新增備忘";
            break;
            case 3:
                title = "新增指派";
            break;
            default:
                return;
            break;
        }
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    // 細項
    var detailUidContentArr = [];
    $("#insertDialog").bsDialog({
        title: title,
        autoShow: true,
        start: function(){
          var option = {styleKind:"calendar-list",style:"insert"};
          getStyle(option,function(insertPage){
            // 細項樣式
            var option = {styleKind:"calendar-list",style:"detail"};
            getStyle(option,function(detailPage){

                var insertPageObj = $.parseHTML(insertPage);
                var isModify = false;
                var detailArea = $(insertPageObj).find("#detailArea");
                var detailPutArea = detailArea.find("#detailInfo");
                // 開始日期
                $(".ui-datepicker").remove();
                var dateOptionStart = {
                    dateFormat: "yy-mm-dd",
                    onSelect: function(dateText, inst) {
                        // end_date_content
                        $(insertPageObj).find("#StartDate_content").removeClass("item-bg-danger").text(dateText);
                        $(insertPageObj).find("#StartDate").hide();
                        $(insertPageObj).find("#EndDate").datepicker( "option", "minDate", new Date(dateText));
                        $(insertPageObj).find("#EndDate_content").html(dateText);

                        // $(insertPageObj).find("#WarningDate").datepicker( "option", "minDate", new Date(dateText));
                        // $(insertPageObj).find("#WarningDate_content").html(dateText);
                    },
                    minDate: 0
                };
                // 到期日期
                var dateOptionEnd = {
                    dateFormat: "yy-mm-dd",
                    onSelect: function(dateText, inst) {
                        // end_date_content
                        $(insertPageObj).find("#EndDate_content").removeClass("item-bg-danger").text(dateText);
                        $(insertPageObj).find("#EndDate").hide();
                        $(insertPageObj).find("#StartDate").datepicker( "option", "maxDate", new Date(dateText));
                        $(insertPageObj).find("#WarningDate").datepicker( "option", "maxDate", new Date(dateText));
                    },
                    minDate: 0
                };

                // 預警日期
                var date = new Date();
                var dateY = date.getFullYear();
                var dateM = date.getMonth();
                var dateD = date.getDate();

                var defaultAlertDate = dateCalculate(dateY,dateM,dateD,0);
                var dateOptionAlert = {
                    dateFormat: "yy-mm-dd",
                    onSelect: function(dateText, inst) {
                        // end_date_content
                        $(insertPageObj).find("#WarningDate_content").removeClass("item-bg-danger").text(dateText);
                        $(insertPageObj).find("#WarningDate").hide();        
                        $(insertPageObj).find("#EndDate").datepicker( "option", "minDate", new Date(dateText));
                
                    },
                    minDate: 0,
                    defaultDate: defaultAlertDate
                };

                if(modifyObj != undefined){
                    // 開始日
                    // var defaultStartDateArr = modifyObj.StartDate.split("-");
                    // var Year = parseInt(defaultStartDateArr[0]);
                    // var Month = parseInt(defaultStartDateArr[1])-1;
                    // var Day = parseInt(defaultStartDateArr[2]);
                    var defaultStartDate = new Date(modifyObj.StartDate);
                    dateOptionStart.defaultDate = defaultStartDate;
                    dateOptionStart.minDate = defaultStartDate;
                    // 到期日
                    // var defaultEndDateArr = modifyObj.MyKeypoint.EndDate.split("-");
                    // var Year = parseInt(defaultEndDateArr[0]);
                    // var Month = parseInt(defaultEndDateArr[1])-1;
                    // var Day = parseInt(defaultEndDateArr[2]);
                    var defaultEndDate = new Date(modifyObj.MyKeypoint.EndDate);
                    dateOptionEnd.defaultDate = defaultEndDate;
                    // defaultEndDate.minDate = defaultEndDate;

                    // 預警
                    if(modifyObj.MyKeypoint.WarningDate){
                        // var defaultAlertDateArr = modifyObj.MyKeypoint.WarningDate.split("-");
                        var defaultAlertDate = new Date(modifyObj.MyKeypoint.WarningDate);
                    }else{
                        // var defaultAlertDateArr = modifyObj.MyKeypoint.EndDate.split("-");
                        var defaultAlertDate = new Date(modifyObj.MyKeypoint.EndDate);

                    }
                    // var Year = parseInt(defaultAlertDateArr[0]);
                    // var Month = parseInt(defaultAlertDateArr[1])-1;
                    // var Day = parseInt(defaultAlertDateArr[2]);
                    // var defaultAlertDate = new Date(Year, Month, Day);
                    dateOptionAlert.defaultDate = defaultAlertDate;
                    dateOptionAlert.minDate = defaultStartDate;
                    dateOptionAlert.maxDate = defaultEndDate;
                    // 到期日的最小日期
                    dateOptionEnd.minDate = defaultAlertDate;
                }

                // 設置
                $(insertPageObj).find("#StartDate").hide().datepicker(dateOptionStart);
                $(insertPageObj).find("#EndDate").hide().datepicker(dateOptionEnd);
                $(insertPageObj).find("#WarningDate").hide().datepicker(dateOptionAlert);

                // 預設日期
                // 開始
                var defaultStartDate = $(insertPageObj).find("#StartDate").val();
                $(insertPageObj).find("#StartDate_content").html(defaultStartDate);
                // 到期
                var defaultEndDate = $(insertPageObj).find("#EndDate").val();
                $(insertPageObj).find("#EndDate_content").html(defaultEndDate);
                // 預警
                var defaultAlertDate = $(insertPageObj).find("#WarningDate").val();
                $(insertPageObj).find("#WarningDate_content").html(defaultAlertDate);

                // 日期顯示
                $(insertPageObj).find("#StartDateCalendar").click(function(){
                    $(insertPageObj).find("#StartDate").toggle();
                });
                $(insertPageObj).find("#EndDateCalendar").click(function(){
                    $(insertPageObj).find("#EndDate").toggle();
                });
                $(insertPageObj).find("#WarningDateCalendar").click(function(){
                    $(insertPageObj).find("#WarningDate").toggle();
                });
                // 如果類型是備忘
                if(calendarType == 1){
                    $(insertPageObj).find("#Pricipal").parent().parent().remove();
                    $(insertPageObj).find("#Designee").parent().parent().remove();
                }
                if(modifyObj != undefined){
                    // 指派人
                    var DesigneeID = modifyObj.Designee.Uid;
                    var DesigneeName = modifyObj.Designee.Name;
                    // console.log(DesigneeName,modifyObj.Designee, modifyObj);

                    // 承辦人
                    var PricipalID;
                    if(modifyObj.MyKeypoint != undefined){
                        PricipalID = modifyObj.MyKeypoint.Pricipal.Uid;
                        PricipalName = modifyObj.MyKeypoint.Pricipal.Name;
                    }else{
                        PricipalID = modifyObj.Pricipal.Uid;
                        PricipalName = modifyObj.Pricipal.Name;
                    }

                    // 放入總承辦
                    $(insertPageObj).find("#Pricipal").val(PricipalID);
                    $(insertPageObj).find("#principalInfo").text(PricipalName);

                    // 放入回報對象
                    $(insertPageObj).find("#Designee").val(DesigneeID);
                    $(insertPageObj).find("#reportTargetInfo").text(DesigneeName);

                }else{
                    // 放入總承辦
                    $(insertPageObj).find("#Pricipal").val(userID);
                    $(insertPageObj).find("#principalInfo").text(userName);
                    // 放入回報對象
                    $(insertPageObj).find("#Designee").val(userID);
                    $(insertPageObj).find("#reportTargetInfo").text(userName);
                }

                // 指派
                var putAreaArr = [];
                var PricipalArea = $(insertPageObj).find("#Pricipal");
                putAreaArr.push(PricipalArea);

                // 回報
                var DesigneeArea = $(insertPageObj).find("#Designee");
                putAreaArr.push(DesigneeArea);

                // 先判斷是不是主管，是才可以設置
                if(!userLoginInfo.isSuperiors){
                    $(insertPageObj).find("#principalUserAdd").parent().text("-");
                    $(insertPageObj).find("#principalInfo").val(userName);
                    $(insertPageObj).find("#Pricipal").val(userID);
                }
                // 總承辦
                $(insertPageObj).find("#principalUserAdd").click(function(){
                    var infoPutArea = $(insertPageObj).find("#principalInfo");
                    var valuePutArea = $(insertPageObj).find("#Pricipal");
                    var selectData = valuePutArea.val();
                    addUserListData(infoPutArea, valuePutArea, selectData, true);
                });

                // 回報對象
                $(insertPageObj).find("#reportTargetUserAdd").click(function(){
                    var infoPutArea = $(insertPageObj).find("#reportTargetInfo");
                    var valuePutArea = $(insertPageObj).find("#Designee");
                    var selectData = valuePutArea.val();
                    addUserListData(infoPutArea, valuePutArea, selectData, true);
                });


                // 修改
                if(modifyObj != undefined){
                    // 確認是否為被指派
                    var isDesignee = true;
                    // isModify, isHistories, isDetail, isDesignee, modifyObj
                    if(modifyObj.Designee.Uid != modifyObj.MyKeypoint.Pricipal.Uid){
                        if(modifyObj.MyKeypoint.Pricipal.Uid != userID){
                            isDesignee = false;
                        }
                    }

                    // 如果不是被指派，不能新增辦況
                    if(!isDesignee){
                        $(insertPageObj).find("#historiesArea").find(".control-label").eq(1).empty();
                    }

                    isModify = true;
                    // 事項
                    $(insertPageObj).find(".list-items").find("#Desc").text(modifyObj.Desc);

                    // 地點
                    $(insertPageObj).find(".list-items").find("#Location").val(modifyObj.Location);

                    // 起日
                    $(insertPageObj).find("#StartDate_content").text(modifyObj.StartDate);

                    // 迄日
                    var EndDate;
                    if(modifyObj.MyKeypoint != undefined){
                        EndDate = modifyObj.MyKeypoint.EndDate;
                    }else{
                        EndDate = modifyObj.EndDate;
                    }
                    $(insertPageObj).find("#EndDate_content").text(EndDate);

                    // 預警
                    if(modifyObj.MyKeypoint != undefined){
                        WarningDate = (modifyObj.MyKeypoint.WarningDate)?modifyObj.MyKeypoint.WarningDate:"尚未選擇日期";
                    }else{
                        WarningDate = modifyObj.WarningDate;
                    }
                    $(insertPageObj).find("#WarningDate_content").text(WarningDate);

                    // 取得細項內容
                    var sendData = {
                        api: calendarAPI+"GetToDoList",
                        data: {
                            userId: userID,
                            type: calendarType,
                            fid: modifyObj.Uid
                        }
                    };
                    $.getJSON(wrsUrl,sendData, function(rs){
                        if(rs.Status){
                            var tmpModifyObj = {
                                modifyObj: modifyObj,
                                modifyItem: modifyItem
                            }
                            $.each(rs.Data,function(detailIndex, detailContent){
                                detailUidContentArr.push(detailContent.Uid);
                                createDetailItem(detailPage, detailContent, detailPutArea, isModify, false, false, modifyObj);
                            });
                        }
                    });
                    if(modifyObj.Doc.length){
                        $(insertPageObj).find("#isSelectFile").show();
                        if(modifyObj.MyKeypoint.Status.Uid > 1){
                            putFileToInfoArea($(insertPageObj).find("#isSelectFile"), modifyObj.Doc);
                        }else{
                            putFileToInfoArea($(insertPageObj).find("#isSelectFile"), modifyObj.Doc, true, modifyObj.Uid);
                        }
                    }
                }else{
                    $(insertPageObj).find("#historiesArea").remove();
                }
                
                // 新增細項
                $(insertPageObj).find("#addDetail").click(function(){
                    // createDetail(detailPage, "", detailPutArea, isModify, false, false, true);
                    createDetailItem(detailPage, null, detailPutArea, isModify, false, false, modifyObj, true, true);
                });
                

                // 檔案上傳
                $(insertPageObj).find("#itemFiles").click(function(){
                    var putFormArea = $(insertPageObj).find("#uploadFiles");
                    var selectInfoArea = $("#insertDialog").find("#isSelectFile");
                    // fileSelect(putFormArea);
                    fileSelect(putFormArea, 0, selectInfoArea);
                    $("#insertDialog").find("#isSelectFile").show();
                });

                $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));
            });
          });
        },
        button:[
            // {
            //     text: "取消",
            //     className: "btn-default-font-color",
            //     click: function(){
            //         $("#insertDialog").bsDialog("close");
            //     }
            // },
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var withoutArr = [];
                    withoutArr.push("Location");
                    withoutArr.push("Pricipal");
                    withoutArr.push("Designee");
                    var userInputOption = {
                        without: withoutArr,
                        emptyCall: function(obj, id){
                            if(id != "Pricipal" && id != "Designee" && id != "Location"){
                                
                                if(id != "StartDate" && id != "EndDate"){
                                    $("#insertDialog").find("#"+id).addClass("item-bg-danger");
                                }else{
                                    $("#insertDialog").find("#"+id+"_content").addClass("item-bg-danger").text("尚未選擇日期");
                                }
                                
                            }
                        },
                        success: function(sendObj){
                            if(modifyObj != undefined){
                                sendObj.Uid = modifyObj.Uid;
                                sendObj.startDate = sendObj.StartDate;
                                sendObj.endDate = sendObj.EndDate;
                                sendObj.Trace = true;
                                sendObj.DetialItemUids = detailUidContentArr;
                            }else{
                                sendObj.Fid = 0;
                                sendObj.Creater = {
                                    Uid:userID
                                };
                                sendObj.Type = {
                                    Uid: 2
                                };
                                $("#total-content").find(".data-empty").remove();
                            }
                            var PricipalVal = $("#insertDialog").find("#Pricipal").val();
                            var PricipalName = $("#insertDialog").find("#principalInfo").text();
                            var DesigneeVal = $("#insertDialog").find("#Designee").val();
                            var DesigneeName = $("#insertDialog").find("#reportTargetInfo").text();

                            if(calendarType == 1){
                                PricipalVal = userID;
                                PricipalName = userLoginInfo.userName;

                                DesigneeVal = userID;
                                DesigneeName = userLoginInfo.userName;

                            }
                            
                            if(PricipalVal == ""){
                                sendObj.Pricipal = {
                                    Uid: userID,
                                    Name: userLoginInfo.userName
                                };
                            }else{
                                sendObj.Pricipal = {
                                    Uid: PricipalVal,
                                    Name: PricipalName
                                };
                            }

                            if(DesigneeVal == ""){
                                sendObj.Designee = {
                                    Uid: userID,
                                    Name: userLoginInfo.userName
                                };
                                
                            }else{
                                sendObj.Designee = {
                                    Uid: DesigneeVal,
                                    Name: DesigneeName
                                };
                            }
                            var eventIsSelf = false;
                            if(sendObj.Pricipal.Uid == userID && sendObj.Designee.Uid == userID && calendarType != 1){
                                eventIsSelf = true;
                            }
                            
                            if(eventIsSelf){
                                var option = {
                                  sureCall: function(){
                                    saveData(sendObj, modifyItem);
                                  },
                                  title: "訊息"
                                };
                                var msg = "您新增的事項「"+sendObj.Desc+"」承辦與回報皆為同一位，<br>因此「確認」後將新增為「備忘」且無法異動，<br>";
                                msg += "您確定要新增「"+sendObj.Desc+"」為「備忘」？";
                                chooseDialog(msg, option);
                            }else{
                                saveData(sendObj, modifyItem);
                            }
                            
                        }
                    }
                    checkInputEmpty($("#insertDialog"),userInputOption);
                }
            }
        ]
    });

}

// 回報事項
function returmWorkDialog(){
    $("#returmWorkDialog").remove();
    $("<div>").prop("id","returmWorkDialog").appendTo("body");

    $("#returmWorkDialog").bsDialog({
        autoShow:true,
        showFooterBtn:true,
        title: "回報事項",
        start:function(){

            var msgDiv = $("<div>").html(msg);
            $("#returmWorkDialog").find(".modal-body").append(msgDiv);
        },
        button:[{
            text: "關閉",
            className: "btn-danger",
            click: function(){
                $("#returmWorkDialog").bsDialog("close");
            }
        }
        ]
    });
}
