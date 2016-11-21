// 收文新增
function referenceInsertDialog(modifyObj, modifyItem){
    $.blockUI();
    // console.log(modifyObj, modifyItem);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(modifyObj != undefined){
        title = "修改收文";
        saveBtn = "修改";
    }else{
        title = "新增收文";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: title,
        autoShow: true,
        start: referenceInsertStart(modifyObj, modifyItem),
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
                    referenceInsertClickBtn(modifyItem);
                }
            }
        ]
    });
}

// ----------------發文擬文部分----------------

// 先選擇情境範本-新增&修改Dialog
function selectSampleDialog(sourceData){
    // 在收文的資料點了回文，所待入的
    if(sourceData == undefined){
        sourceData = null;
    }

    $("#selectSampleDialog").remove();
    var selectSampleDialog = $("<div>").prop("id","selectSampleDialog");
    selectSampleDialog.appendTo("body");

    $("#selectSampleDialog").bsDialog({
        title: "擬文情境選擇",
        start: function(){
          var option = {styleKind:"received-issued",style:"sendDoc-sample"};
          getStyle(option,function(samplePage){
            var samplePageObj = $.parseHTML(samplePage);
            // 類別改變事件
            $(samplePageObj).find("#sampleCategory").change(function(){
                // 類型改變事件
                var sampleTypePutArea = $(samplePageObj).find("#sampleType");
                getSampleListData(sampleTypePutArea, $(this).val());
                sampleTypePutArea.change();
            });
            // 類別一進入時，取得位置
            var putArea = $(samplePageObj).find("#sampleCategory");
            putArea.empty();
            // 放入類別選項
            getSampleListData(putArea);

            // 範本列表
            $(samplePageObj).find("#sampleType").change(function(){
                var sampleArea = $(samplePageObj).find("#sample");
                sampleArea.empty($(this).val());
                if($(this).val() != "" && $(this).val() != null){
                    getSampleContentListData(sampleArea, $(this).val());
                }
            });
            
             
            // sampleType
            $(samplePageObj).appendTo( $("#selectSampleDialog").find(".modal-body") );
          });
        },
        button:[
            {
                text: "關閉",
                className: "pull-left",
                click: function(){
                    $("#selectSampleDialog").bsDialog("close");
                }
            },
            {
                text: "不使用",
                className: "btn-danger",
                click: function(){
                    $("#selectSampleDialog").bsDialog("close");
                    insertDialog(undefined, undefined, undefined, sourceData);
                }
            },
            {
                text: "使用",
                className: "btn-success",
                click: function(){
                    var selectSampleTypeID = $("#selectSampleDialog").find("#sample").val();
                    getSampleData(selectSampleTypeID, sourceData);
                }
            },
        ]
    });

}

// 發文
// 新增&修改Dialog
function insertDialog(modifyObj, modifyItem, sampleData, sourceData){
    
    if(modifyObj != undefined){
        $.blockUI();
         var sendData = {
            api: waDrfAPI + "getDispatch",
            data:{
                uid:modifyObj.uid,
                sys_code_id: sys_code,
                user_id: userID
            }
        };
        $.getJSON(wrsUrl, sendData).done(function(rs){  
            // console.log(modifyObj);
            $.unblockUI();
            if(rs.status && rs.data != null){
                openInsertDialog(rs.data[0], modifyItem, sampleData, sourceData);
            }else{
                msgDialog("無法取得資料");
            }

        });
    }else{
        openInsertDialog(modifyObj, modifyItem, sampleData, sourceData);
    }
        

}

// 發文新增/重新送審
function openInsertDialog(modifyObj, modifyItem, sampleData, sourceData){
    // console.log(modifyObj, modifyItem);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    
    var saveBtn = "";
    if(modifyObj != undefined){
        title = "修改擬文";
        saveBtn = "重新送審";
    }else{
        title = "新增擬文";
        saveBtn = "設定簽核";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title: title,
        autoShow: true,
        start: dispatchStart(modifyObj, modifyItem, sampleData, sourceData),
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
                    var originalTarget = $("#insertDialog").find("#originalTarget .originalTargetID");                    
                    if(!originalTarget.length){
                        $("#insertDialog").find("#originalTarget").addClass("item-bg-danger").text("尚未選擇受文對象");
                        msgDialog("尚未選擇正本受文對象，請新增後再嘗試");
                        return;
                    }

                    var userInputOption = {
                        without:["del_file","prefix"],
                        emptyCall: function(obj, id){
                            if(id == "del_file"){
                                return;
                            }
                            if(id == "content" || id == "explanation"){
                                if(!$("#insertDialog").find("#"+i).parent().find(".contentEmpty").length){
                                    var msg = $("<div>").addClass("col-xs-12 col-md-12 item-bg-danger contentEmpty").text("下方內容不可為空");
                                
                                    $("#insertDialog").find("#"+i).before(msg);
                                }
                            }
                            if(id == "dispatch_end_date"){
                                $("#insertDialog").find("#dispatchEndDateContent").addClass("item-bg-danger");
                            }
                        },
                        success: function(sendObj){
                            // 正本塞入
                            var originalIDStr = "";
                            $.each(originalTarget, function(){
                                originalIDStr += $(this).val() + ",";
                            });
                            originalIDStr = originalIDStr.substring(0, originalIDStr.length - 1);
                            sendObj.originalID = originalIDStr;

                            // 檢查是否有選取副本
                            var duplicateTarget = $("#insertDialog").find("#duplicateTarget .duplicateTargetID");
                            var duplicateTargetIDStr = "";
                            if( duplicateTarget.length ){
                                $.each(duplicateTarget, function(){
                                    duplicateTargetIDStr += $(this).val() + ",";
                                });
                                duplicateTargetIDStr = duplicateTargetIDStr.substring(0, duplicateTargetIDStr.length - 1);
                            }
                            sendObj.duplicateTargetID = duplicateTargetIDStr;

                            var putFormArea = $("#insertDialog").find("#uploadFiles");
                            isReDispatch = false;
                            if(modifyObj != undefined){
                                if(modifyObj.uid != undefined){
                                    isReDispatch = true;
                                    sendObj.orgoriginal_Uid = modifyObj.uid;
                                }
                            }

                            // 塞入來源相關
                            // if(sourceData != null){
                            //     sendObj.source_doc = sourceData.uid;
                            //     // sendObj.trace = sourceData.trace;
                            // }else{
                                
                            // }
                            var track = $("#insertDialog").find("#track").prop("class");
                            sendObj.source_doc = $("#insertDialog").find("#according").val();
                            sendObj.track = (track.search("fa-check-square-o") != -1 )?1:0;
                            var idStr = "";
                            if(modifyObj != undefined){
                                // console.log(modifyObj);
                                if(modifyObj.file_info != undefined){
                                    if(modifyObj.file_info != "" && modifyObj.file_info.length){
                                        var tmpDelFileIDArr = [];
                                        if(sendObj.del_file.length){
                                            tmpDelFileIDArr = sendObj.del_file.split(",");
                                        }
                                        $.each(modifyObj.file_info, function(fileIndex,fileContent){
                                            var isIn = ($.inArray(fileContent.uid.toString(), tmpDelFileIDArr) != -1)?true:false;
                                            if(!isIn){
                                                idStr += fileContent.uid + ",";
                                            }
                                        });
                                        if(idStr.length){
                                            idStr = idStr.substring(0, idStr.length-1);
                                        }
                                    }
                                }
                                sendObj.doc_uid = idStr;
                                delete sendObj.del_file;
                            }

                            // 選擇簽核日期
                            signInfoAndDate(sendObj, modifyItem, putFormArea, isReDispatch);

                            $("#insertDialog").bsDialog("close");

                        }
                    }
                    checkInputEmpty($("#insertDialog"),userInputOption);
                }
            }
        ]
    });
}

// ---------以上為擬文動作----------------

// 收文新增時開啟的動作要做的事情
function referenceInsertStart(modifyObj, modifyItem){
    var option = {styleKind:"received-issued",style:"reference-insert"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        $(insertPageObj).find(".fa-cloud-upload").click(function(){
            var putFormArea = $(insertPageObj).find("#uploadFiles");
            fileSelect(putFormArea);
        });
        

        // 取得來文對象資訊
        getSUOptionList($(insertPageObj).find("#come_from"));

        // 來文對象資訊重整
        $(insertPageObj).find("#referenceTargetRefresh").click(function(){
            getSUOptionList($(insertPageObj).find("#come_from"));
        });

        // 取得速別
        getSpeedTypeAndSecretType($(insertPageObj).find("#level_id"));
        // 取得密等
        getSpeedTypeAndSecretType($(insertPageObj).find("#isopycnic_id"), 2);

        // 速別重整鈕
        $(insertPageObj).find(".list-items").eq(5).find(".fa-refresh").click(function(){
            getSpeedTypeAndSecretType($(insertPageObj).find("#level_id"));
        });
        // 密等重整鈕
        $(insertPageObj).find(".list-items").eq(6).find(".fa-refresh").click(function(){
            getSpeedTypeAndSecretType($(insertPageObj).find("#isopycnic_id"), 2);
        });

        // 對方來文日期
        var dateOption = {
            dateFormat: "yy-mm-dd",
            onSelect: function(dateText, inst) {
                $(insertPageObj).find("#receiveTimeContent").removeClass("item-bg-danger").text(dateText);
                $(insertPageObj).find("#receive_time").val(dateText);
                $(insertPageObj).find("#receiveTimeSelect").hide();
            },
            // minDate: 0
            maxDate: new Date()
        };

        $(insertPageObj).find("#receiveTimeSelect").hide().datepicker(dateOption);
        
        $(insertPageObj).find("#receiveTimeCalendar").click(function(){
            $(insertPageObj).find("#receiveTimeSelect").toggle();
        });

        // 類別、類型
        $(insertPageObj).find("#category").change(function(){
            var sampleTypePutArea = $(insertPageObj).find("#type_id");
            getSampleListData(sampleTypePutArea, $(this).val());
        });

        var putArea = $(insertPageObj).find("#category");
        putArea.empty();

        getSampleListData(putArea);

        // 類別重整鈕
        $(insertPageObj).find("#categoryRefresh").click(function(){
            var putArea = $(insertPageObj).find("#category");
            putArea.empty();
            getSampleListData(putArea);
        });

        // 來文依據
        $(insertPageObj).find("#docReferenceAdd").click(function(){
            var infoPutArea = $(insertPageObj).find("#docReferenceSelectInfo");
            var valuePutArea = $(insertPageObj).find("#according");
            var selectData = valuePutArea.val().split(",");
            // console.log(selectData);
            getReferenceList(infoPutArea, valuePutArea, selectData);
        });

        // 選擇正本
        $(insertPageObj).find("#originalType").click(function(){
            var duplicate = $(insertPageObj).find("#duplicateType");
            var duplicateClass = duplicate.prop("class");
            var thisCalss = $(this).prop("class");
            // 還沒勾
            if(thisCalss.search("fa-check-square-o") == -1){
                // duplicate已經勾了
                if(duplicateClass.search("fa-square-o") == -1){
                    duplicate.removeClass("fa-check-square-o").addClass("fa-square-o");
                }
                $(this).removeClass("fa-square-o").addClass("fa-check-square-o");
                // 放值
                $(insertPageObj).find("#drf_type").val(0);
            }
            $(insertPageObj).find("#selectDocComeType").removeClass("item-bg-danger");
        });

        // 選擇副本
        $(insertPageObj).find("#duplicateType").click(function(){
            var original = $(insertPageObj).find("#originalType");
            var originalClass = original.prop("class");
            var thisCalss = $(this).prop("class");
            // 還沒勾
            if(thisCalss.search("fa-check-square-o") == -1){
                // original已經勾了
                if(originalClass.search("fa-square-o") == -1){
                    original.removeClass("fa-check-square-o").addClass("fa-square-o");    
                }
                $(this).removeClass("fa-square-o").addClass("fa-check-square-o");
                // 放值
                $(insertPageObj).find("#drf_type").val(1);
            }
            $(insertPageObj).find("#selectDocComeType").removeClass("item-bg-danger");

        });

        // 類型重整鈕
        $(insertPageObj).find("#typeRefresh").click(function(){
            var categoryVal = $(insertPageObj).find("#category").val();
            var sampleTypePutArea = $(insertPageObj).find("#type_id");
            getSampleListData(sampleTypePutArea, categoryVal);
        });

        // CKEDITOR.replace( $(insertPageObj).find("#summary"), {});
        // 修改
        if(modifyObj != undefined){

            // console.log("T");
            $.each(modifyObj, function(index,content){
                if(index != "sex" ){
                    $(insertPageObj).find("#"+index).val(content);
                }else{
                    $(insertPageObj).find("[name=sex][value=" + content + "]").attr("checked",true).parent().addClass("active");
                }
            });
            var account = $(insertPageObj).find("#sid").val();
            $(insertPageObj).find("#accountContent").text(account);
        }else{
            // 新增
            $(insertPageObj).find("#sid").keyup(function(){
                var account = $(this).val();
                $(insertPageObj).find("#accountContent").text(account);
            });
        }
        // 放到畫面中
        $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));
        // 加載CKeditor
        $("#insertDialog").find("#explanation").ckeditor();
        // getQCTableTypeList("tableTypeTab","tableType",true);
        $.unblockUI();
    });
}

// 收文按下新增或修改按鈕要做的事情
function referenceInsertClickBtn(modifyItem){
    var userInputOption = {
        without: ["according"],
        emptyCall: function(obj, id){
            if(id == "explanation"){
                if(!$("#insertDialog").find("#"+id).parent().find(".contentEmpty").length){
                    var msg = $("<div>").addClass("col-xs-12 col-md-12 item-bg-danger contentEmpty").text("下方內容不可為空");
                
                    $("#insertDialog").find("#"+id).before(msg);
                }
            }
            if(id == "drf_type"){
                $("#insertDialog").find("#selectDocComeType").addClass("item-bg-danger");
            }
            if(id == "receive_time"){
                $("#insertDialog").find("#receiveTimeContent").addClass("item-bg-danger")
            }
        },
        success: function(sendObj){
            var putFormArea = $("#insertDialog").find("#uploadFiles");
            sendObj.userID = userID;
            sendObj.sys_code_id = sys_code;
            saveReferenceData(sendObj, modifyItem, putFormArea);
        }
    }
    checkInputEmpty($("#insertDialog"),userInputOption);
}

// 取得擬文選單
function getSampleListData(putArea, sampleCategoryID, sampleTypeID){
    var sendObj = {
        api: typeAPI + "getDocTypeList",
        data: {
            code_id: sys_code
        }
    };
    var str = "未有類別";
    // 取類別列表
    if(sampleCategoryID != undefined){
        sendObj.data.fid = sampleCategoryID;
        putArea.empty();
        str = "未有類型";
    }

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            $.each(rs.data, function(i, v){
                selectOptionPut(putArea, v.uid, v.name);
            });
            putArea.change();
        }else{
            selectOptionPut(putArea, "", str);
        }
    });
}

// 取得擬文範本選單
function getSampleContentListData(putArea, sampleTypeID){
    $(putArea).empty();
    var sendObj = {
        api: waDrfAPI + "getTtmplateList",
        data: {
            sys_code_id: sys_code,
            user_id: userID,
            typeId: sampleTypeID
        }
    };

    var str = "未有範本";

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            $.each(rs.data, function(i, v){
                selectOptionPut(putArea, v.uid, v.subject);
            });
            putArea.change();
        }else{
            selectOptionPut(putArea, "", str);
        }
    });
}

// 取得範本內容
function getSampleData(sampleID, sourceData){
    var sendObj = {
        api: waDrfAPI + "getTemplate",
        data: {
            uid: sampleID,
            sys_code_id: sys_code,
            user_id: userID
        }
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            // console.log(rs);
            $("#selectSampleDialog").bsDialog("close");
            insertDialog(undefined,undefined,rs.data[0], sourceData);
        }else{
            msgDialog("未有擬文範本，請選擇其他類型或類別");
        }
    });
}

// 擬文新增/修改頁面相關
function dispatchStart(modifyObj, modifyItem, sampleData, sourceData){
    // console.log(modifyObj);
    var option = {styleKind:"received-issued",style:"sendDoc-insert"};
    getStyle(option,function(insertPage){
        var insertPageObj = $.parseHTML(insertPage);

        // 範本塞入
        if(sampleData != undefined || sampleData != null){
            if(sampleData.explanation != undefined || sampleData.explanation){
                var string = $.parseHTML(sampleData.explanation);
                $(insertPageObj).find("#explanation").val(string[0].data);
            }
            $(insertPageObj).find("#subject").val(sampleData.subject);
        }

        // sourceData > 在收文點選發文鈕
        if(sourceData != undefined || sourceData != null){
            // 收文ID直接固定不能選
            // 放入名稱(文號)
            $(insertPageObj).find("#docReferenceSelectInfo").text(sourceData.doc_number);
            // $(insertPageObj).find("#docReferenceAdd").parent().remove();
            $(insertPageObj).find("#according").val(sourceData.uid);

            // 將來文單位變成正本
            var orgiginalPutArea = $(insertPageObj).find("#originalTarget");
            originalAndDuplicateSelect(orgiginalPutArea, true, sourceData.fromID);
            
        }else if(modifyObj != undefined && modifyObj != ""){
            if(modifyObj.according != "" && modifyObj.according!=undefined){
                var accStr = "";
                var accContentStr = "";
                $.each(modifyObj.according, function(accIndex, accContent){
                    accContentStr += accContent.name + ",";
                    accStr += accContent.uid + ",";
                });
                accContentStr = accContentStr.substring( 0, accContentStr.length - 1);
                accStr = accStr.substring( 0, accStr.length - 1);

                $(insertPageObj).find("#docReferenceSelectInfo").text(accContentStr);
                $(insertPageObj).find("#according").val(accStr);
            }
        }
        $(insertPageObj).find("#docReferenceAdd").click(function(){
            var infoPutArea = $(insertPageObj).find("#docReferenceSelectInfo");
            var valuePutArea = $(insertPageObj).find("#according");
            var selectData = valuePutArea.val().split(",");
            getReferenceList(infoPutArea, valuePutArea, selectData);
        });

        $(insertPageObj).find("#track").click(function(){
            var thisCalss = $(this).prop("class");
            if(thisCalss.search("fa-square-o") != -1){
                $(insertPageObj).find("#track").removeClass("fa-square-o").addClass("fa-check-square-o");
            }else{
                 $(insertPageObj).find("#track").removeClass("fa-check-square-o").addClass("fa-square-o");
            }
        });
        
        // 擬文到期日
        var dateOption = {
            dateFormat: "yy-mm-dd",
            onSelect: function(dateText, inst) {
                $(insertPageObj).find("#dispatchEndDateContent").removeClass("item-bg-danger").text(dateText);
                $(insertPageObj).find("#dispatch_end_date").val(dateText);
                $(insertPageObj).find("#dispatchEndDateSelect").hide();
            },
            minDate: 0
            // maxDate: new Date()
        };

        $(insertPageObj).find("#dispatchEndDateSelect").hide().datepicker(dateOption);
        
        $(insertPageObj).find("#dispatchEndDateCalendar").click(function(){
            $(insertPageObj).find("#dispatchEndDateSelect").toggle();
        });

        if(modifyObj != undefined){
            $(insertPageObj).find("#subject").val(modifyObj.subject);
        }
        // 承辦人的名字
        $(insertPageObj).find("#pointPeople").text(userLoginInfo.userName);

        // 附件上傳
        $(insertPageObj).find(".fa-cloud-upload").click(function(){
            var putFormArea = $(insertPageObj).find("#uploadFiles");
            fileSelect(putFormArea);
        });

        // 正本新增鈕
        $(insertPageObj).find(".list-items").eq(0).find(".fa-plus").click(function(){
            var orgiginalPutArea = $(insertPageObj).find("#originalTarget");
            originalAndDuplicateSelect(orgiginalPutArea, true);
        });

        // 副本新增鈕
        $(insertPageObj).find(".list-items").eq(1).find(".fa-plus").click(function(){
            var duplicatePutArea = $(insertPageObj).find("#duplicateTarget");
            originalAndDuplicateSelect(duplicatePutArea, false);
        });

        // 取得速別
        getSpeedTypeAndSecretType($(insertPageObj).find("#level_id"));
        // 取得密等
        getSpeedTypeAndSecretType($(insertPageObj).find("#isopycnic_id"), 2);

        // 速別重整鈕
        $(insertPageObj).find("#level_id_refresh").click(function(){
            getSpeedTypeAndSecretType($(insertPageObj).find("#level_id"));
        });
        // 密等重整鈕
        $(insertPageObj).find("#isopycnic_id_refresh").click(function(){
            getSpeedTypeAndSecretType($(insertPageObj).find("#isopycnic_id"), 2);
        });
        if(modifyObj != undefined){
            if(modifyObj.prefix != undefined){
                if(parseInt(modifyObj.prefix) != 0){
                    // 取得字號
                    getPrefixContent( $(insertPageObj).find("#prefix"), modifyObj.prefix );
                }else{
                    getPrefixContent( $(insertPageObj).find("#prefix") );
                }
            }else{
                getPrefixContent( $(insertPageObj).find("#prefix") );
            }
            
        }else{
            // 取得字號
            getPrefixContent( $(insertPageObj).find("#prefix") );
        }
        // 重新送審
        if(modifyObj != undefined){
            if(modifyObj.uid != undefined){
                // 刪除檔案的部分
                var deleteFile = $("<input>").prop("type","hidden").addClass("userInput").prop("id","del_file");
                $(insertPageObj).append(deleteFile);
                reDispatch(modifyObj.uid, insertPageObj);
            }
        }else{
            
            // 說明
            $(insertPageObj).find("#explanation").ckeditor();
        }
        $(insertPageObj).appendTo($("#insertDialog").find(".modal-body"));   
    });
}

// 若為重新審核走這邊
function reDispatch(uid, insertPageObj){
    // 取得資料
    var sendData = {
        api: waDrfAPI + "getDispatch",
        data:{
            uid:uid,
            sys_code_id: sys_code,
            user_id: userID
        }
    };
    $.blockUI();
    $.getJSON(wrsUrl, sendData).done(function(rs){
        $.unblockUI();
        if(rs.status){
            var data = rs.data[0];
            if(data.explanation){
                // 說明
                var string = $.parseHTML(data.explanation.replace(/&amp;/g, '&'));
                if(string[0].data != undefined){
                    string = string[0].data;
                }else{
                    string = $(string).prop("outerHTML");
                }
                $(insertPageObj).find("#explanation").val(string);
            }
            $(insertPageObj).find("#key_word").val(data.key_words);

            // 正本
            var orgiginalPutArea = $(insertPageObj).find("#originalTarget");
            $.each(data["send_to"], function(sendIndex,sendValue){
                originalAndDuplicateSelect(orgiginalPutArea, true, sendValue.uid);
            });
            // 副本
            if(data.carbon_paper != undefined && data.carbon_paper != ""){
                var duplicatePutArea = $(insertPageObj).find("#duplicateTarget");
                $.each(data.carbon_paper, function(sendIndex,sendValue){
                    originalAndDuplicateSelect(duplicatePutArea, false, sendValue.uid);
                });
            }

            // 上傳的檔案列表
            if(data.file_info != undefined){
                $(insertPageObj).find("#isSelectFile").show();
                var option = {styleKind:"received-issued",style:"reference-fileList-modify"};
                getStyle(option,function(fileListPage){

                    $.each(data.file_info, function(fI,fC){
                        // console.log(fc);
                        var fileListObj = $.parseHTML(fileListPage);
                        $(fileListObj).addClass("fileData");
                        // 迴紋針-下載
                        $(fileListObj).find(".fa-paperclip").click(function(){
                            downloadFile(fC.uid, fC.name_ori);
                        });
                        // 垃圾桶 - 刪除附件
                        $(fileListObj).find(".fa-trash-o").click(function(){
                            var deleteFile = $(insertPageObj).find("#del_file");
                            var dFVal = deleteFile.val();
                            if(dFVal.length){
                                dFVal += dFVal+","+fC.uid;
                                deleteFile.val(dFVal);
                            }else{
                                deleteFile.val(fC.uid);
                            }
                            // 刪除該項目
                            $(this).parent().parent().remove();
                        });
                        $(fileListObj).find(".list-items").eq(1).text(fC.name_ori)
                        $(fileListObj).appendTo($(insertPageObj).find("#isSelectFile").find(".control-label").eq(1));
                    });
                });
            }

            // 追蹤
            var track = false;
            if(data.track != ""){
                if(parseInt(data.track)){
                    track = true;
                }
            }
            if(track){
                $(insertPageObj).find("#track").removeClass("fa-square-o").addClass("fa-check-square-o");
            }
            $(insertPageObj).find("#track").val(data.track);
            $(insertPageObj).find("#explanation").ckeditor();
        }else{
            $("#insertDialog").bsDialog('close');
            msgDialog(rs.errMsg || rs.Message , true, function(){
                $("#insertDialog").remove();
            });
        }
    });
}

// 取得速別＆密等
function getSpeedTypeAndSecretType(putArea, typeID){
    if(typeID == undefined){
        typeID = 1;
    }
    putArea.empty();
    var sendObj = {
        api: typeAPI+"getTypeList",
        data: {
            type: typeID
        }
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.status && rs.data != null){
            $.each(rs.data, function(i, v){
                selectOptionPut(putArea, v.uid, v.name);

            });
        }else{
            selectOptionPut(putArea, "", "無資料");
        }
    });
}

// 創建正、副本相關選項
function originalAndDuplicateSelect(putArea,isOriginal, setValue){
    var siClass = "duplicateTargetID";
    if(isOriginal){
        siClass = "originalTargetID";
    }
    if(!$(putArea).find("."+siClass).length){
        $(putArea).empty().removeClass("item-bg-danger");
    }
    var option = {styleKind:"received-issued",style:"sendDoc-originalAndDuplicate"};
    getStyle(option,function(odPage){
        var odPageObj = $.parseHTML(odPage);
        var selectItem = $("<select>").addClass("form-control "+siClass);
        
        getSUOptionList(selectItem, setValue);

        $(odPageObj).find(".control-label").eq(0).append(selectItem);
        $(odPageObj).find(".fa-refresh").click(function(){
            getSUOptionList(selectItem);
        });
        $(odPageObj).find(".fa-trash-o").click(function(){
            $(odPageObj).remove();
        });
        $(odPageObj).appendTo(putArea);
    });
}

function getSUOptionList(putArea, setValue){
    putArea.empty();

    var sendObj = {
        api: "SuSupply/GetData_SuSupply",
        threeModal: true,
        data:{
            sys_code: sys_code
        }
    };

    $.getJSON(wrsUrl, sendObj, function(rs){
        if(rs.Status){
            $.each(rs.Data, function(i, v){
                selectOptionPut(putArea, v.uid, v.name);
            });
            if(setValue != undefined){
                putArea.val(setValue);
            }
        }else{
            selectOptionPut(putArea, "", "無資料");
        }
    });
}


// 分文 - 設定待辦
function setReferenceCalendarDialog(content, modifyItem){
    $.blockUI();

    // 取得相關檔案
    var sendData = {
        api: referenceAPI + "getReference",
        data:{
            uid:content.uid
        }
    };
    getPageListData(sendData, function(rs){
        if(rs.status && rs.data != null){
            var saveBtn = "設定";
            title = "新增承辦與協辦";
            
            $("#setReferenceCalendarDialog").remove();
            var setReferenceCalendarDialog = $("<div>").prop("id","setReferenceCalendarDialog");
            setReferenceCalendarDialog.appendTo("body");

            $("#setReferenceCalendarDialog").bsDialog({
                title: title,
                autoShow: true,
                start: referenceCalendarStart(rs.data[0]),
                button:[
                
                    // {
                    //     text: "取消",
                    //     className: "btn-default-font-color",
                    //     click: function(){
                    //         $("#setReferenceCalendarDialog").bsDialog("close");
                    //     }
                    // },
                    {
                        text: "設定",
                        className: "btn-success",
                        click: function(){
                            referenceCalendarClickBtn(rs.data[0], modifyItem);
                        }
                    }
                ]
            });
        }else{
            $.unblockUI();
            msgDialog("無法取得「"+content.doc_number+"」資料");
        }
    });
}

// 設定待辦 - 起始
function referenceCalendarStart(content, modifyItem){
    // 最外層的外觀
    var option = {styleKind:"received-issued",style:"reference-set-calendar"};
    getStyle(option,function(insertPage){
        // 檔案列表外觀
        var option = {styleKind:"received-issued",style:"reference-fileList"};
        getStyle(option,function(fileListPage){
            var insertPageObj = $.parseHTML(insertPage);
            
            // 原始檔案資訊
            if(content.file_info != undefined){
                if(content.file_info.length){
                    var originalFileInfo = $(insertPageObj).find("#originalFileInfo");
                    $.each(content.file_info, function(fileIndex, fileContent){
                        var fileListPageObj = $.parseHTML(fileListPage);
                        $(fileListPageObj).find(".fa-paperclip").click(function(){
                             downloadFile(fileContent.uid, fileContent.name_ori);
                        });
                        $(fileListPageObj).find(".list-items").eq(1).text(fileContent.name_ori).click(function(){
                             downloadFile(fileContent.uid, fileContent.name_ori);
                        });
                        $(fileListPageObj).appendTo(originalFileInfo);
                    });
                    
                }
            }

            // 額外附件
            $(insertPageObj).find("#principalFile").click(function(){
                var putFormArea = $(insertPageObj).find("#uploadFiles");
                var selectInfoArea = $(insertPageObj).find("#isSelectFile");

                calendarFileSelect(putFormArea, 0, selectInfoArea);
                selectInfoArea.show();
            });

            // 設定總承辦
            $(insertPageObj).find("#principalUserAdd").click(function(){
                var infoPutArea = $(insertPageObj).find("#principalInfo");
                var valuePutArea = $(insertPageObj).find("#pricipalId");
                var selectData = valuePutArea.val().split(",");                
                addUserListData(infoPutArea, valuePutArea, selectData, true);
            });

            // 設定到期日
            var expiryDateSelect = $(insertPageObj).find("#expiryDateSelect");
            var dateOption = {
                dateFormat: "yy-mm-dd",
                onSelect: function(dateText, inst) {
                    $(insertPageObj).find("#expiryDateSelectInfo").removeClass("item-bg-danger").text(dateText);
                    $(insertPageObj).find("#expiry_date").val(dateText);
                    expiryDateSelect.hide();
                },
                minDate: 0
            };
            expiryDateSelect.datepicker(dateOption);
            $(insertPageObj).find("#expiryDateSelectBtn").click(function(){
                expiryDateSelect.toggle();
            });

            // 設定預警日
            var endDateSelect = $(insertPageObj).find("#endDateSelect");
            var dateOption = {
                dateFormat: "yy-mm-dd",
                onSelect: function(dateText, inst) {
                    $(insertPageObj).find("#endDateSelectInfo").removeClass("item-bg-danger").text(dateText);
                    $(insertPageObj).find("#endDate").val(dateText);
                    endDateSelect.hide();
                },
                minDate: 0
            };
            endDateSelect.datepicker(dateOption);
            $(insertPageObj).find("#endDateSelectBtn").click(function(){
                endDateSelect.toggle();
            });

            // 新增協辦
            $(insertPageObj).find("#assistAddBtn").click(function(){
                addAssistItem( $(insertPageObj) );
            });

            // 承辦事項
            $(insertPageObj).find("#Desc").val(content.subject);

            // 回文
            $(insertPageObj).find("#toResponses").click(function(){
                var thisCalss = $(this).prop("class");
                // 不需回文
                if(thisCalss.search("fa-check-square-o") == -1){
                    var btnThis = $(this);
                    var option = {
                        sureCall: function(){
                            btnThis.removeClass("fa-square-o").addClass("fa-check-square-o");
                            $(insertPageObj).find("#responses_doc").val(1);
                            $(insertPageObj).find("#track").parent().show();
                            $(insertPageObj).find("#assistArea").hide();
                        },
                        title: "訊息"
                    };
                    var msg = "設置「回文」後，將「無需設置協辦細項」，<br>";
                    msg += "您確定要設置為「回文」？";
                    chooseDialog(msg, option);
                }else{
                    $(this).removeClass("fa-check-square-o").addClass("fa-square-o");
                    $(insertPageObj).find("#responses_doc").val(0);
                    $(insertPageObj).find("#track").parent().hide();
                    $(insertPageObj).find("#assistArea").show();
                }
            });

            // 放到畫面中
            $(insertPageObj).appendTo($("#setReferenceCalendarDialog").find(".modal-body"));
            $.unblockUI();
        });
    });
}

// 設定協辦事項
function addAssistItem(insertPageObj){
    // 取得樣式
    var option = {styleKind:"received-issued",style:"reference-assist-item"};
    getStyle(option,function(assistStyle){
        var assistObj = $.parseHTML(assistStyle);
        // 刪除協辦
        $(assistObj).find("#deleteAssistItem").click(function(){
            $(assistObj).remove();
        });

        // 協辦附件上傳
        $(assistObj).find(".fa-cloud-upload").click(function(){
            var putFormArea = $(assistObj).find("#fileSelect");
            var selectInfoArea = $(assistObj).find(".fileInfo");
            calendarFileSelect(putFormArea, "unset", selectInfoArea);
        });

        // 設定協辦人
        $(assistObj).find(".fa-user").click(function(){
            var infoPutArea = $(assistObj).find("#assistUserInfo");
            var valuePutArea = $(assistObj).find("#assist_user");
            var selectData = valuePutArea.val().split(",");                
            addUserListData(infoPutArea, valuePutArea, selectData);
            $(assistObj).find("#assistUserArea").show();
        });

        $(assistObj).appendTo(insertPageObj.find("#assistInfo"));
    });
}

// 設定後送出
function referenceCalendarClickBtn(content, modifyItem){
    var userInputOption = {
        without: ["according"],
        emptyCall: function(obj, id){
            if(id == "pricipalId"){
                $("#setReferenceCalendarDialog").find("#principalInfo").addClass("item-bg-danger").text("尚未設定總承辦");
            }
            if(id == "expiry_date"){
                $("#setReferenceCalendarDialog").find("#expiryDateSelectInfo").addClass("item-bg-danger");
            }
            if(id == "endDate"){
                $("#setReferenceCalendarDialog").find("#endDateSelectInfo").addClass("item-bg-danger");
            }
        },
        success: function(sendObj){
            var putFormArea = $("#setReferenceCalendarDialog").find("#uploadFiles");
            var responses_doc = $("#setReferenceCalendarDialog").find("#responses_doc").val();

            if(responses_doc == "0" || responses_doc == ""){
                responses_doc = "0";
            }

            sendObj.responses_doc = responses_doc;

            var date = new Date();
            var toDay = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            var originalCalendarSet = {
                "Desc": sendObj.Desc,
                "Creater": {
                  "Uid": userID,
                },
                "Designee": {
                  "Uid": userID,
                },
                "Pricipal": {
                  "Uid": sendObj.pricipalId,
                },
                "StartDate": toDay,
                "EndDate": sendObj.endDate,
                "Keywords": content.key_words,
                "Fid": 0,
                "Type": {
                    Uid: 2
                }
            }
            sendObj.sys_code_id = sys_code;
            sendObj.uid = content.uid;
            // 設定待辦要使用的資料
            sendObj.calendarSet = [];
            // 先放入第一筆 "事項"
            sendObj.calendarSet.push(originalCalendarSet);

            // 整理好協辦檔案
            var assistInfo = $("#setReferenceCalendarDialog").find("#assistInfo").find(".assist-item");
            if(assistInfo.length){
                assistInfo.each(function(index){
                    var detailDesc = $(this).find("#detailDesc").val();
                    // 不為空格
                    if($.trim(detailDesc)){
                        // 放入細項的資料
                        var detailSet = {};
                        // 更改為細項
                        detailSet.Fid = "-1";
                        detailSet.Desc = detailDesc;

                        // 如果協辦人不為空，則更改資料
                        var assist_user = $(this).find("#assist_user").val();
                        if(assist_user != ""){
                            detailSet.Assist = {};
                            detailSet.Assist.Uid = assist_user;
                        }

                        detailSet = $.extend({}, originalCalendarSet, detailSet);
                        sendObj.calendarSet.push(detailSet);
                        var assistFile = $(this).find("#fileSelect").find("input:file");
                        if(assistFile.length){
                            assistFile.each(function(){
                                $(this).prop("name","files["+(index+1)+"][]");
                                // console.log("files["+(index+1)+"][]");
                            });
                        }
                    }
                });
            }

            // console.log(sendObj);
            saveReferenceCalendar(sendObj, modifyItem);
        }
    }
    checkInputEmpty($("#setReferenceCalendarDialog"),userInputOption);
}

// 指派＆設置預警後存取
function saveReferenceCalendar(sendObj, pageObjArea){
    var uploadFileLength = $("#setReferenceCalendarDialog").find("input:file").length;
    var changeJson = false;
    if(uploadFileLength){
        uploadBlockInfo();
        changeJson = true;
    }else{
        $.blockUI();
    }
    var processURL = (uploadFileLength)?wrsAPI+"uploaderAPI":wrsUrl;

    var sendData = {
        api: referenceAPI+"setReferenceDesignate",
        data:sendObj,
        sysCode: sys_code,
        changeJson: true,
        sendJsonIndex: "jsonString"
    };

    var options = {
        url: processURL,
        type:"POST",
        data: sendData,
        dataType:"JSON",
        beforesend: function(xhr){
            // testBs3Show(xhr);
        },
        uploadProgress: function(event, position, total, percentComplete) {
          // console.log(event, position, total, percentComplete);
          $("#processFileUpload").text(percentComplete+"%");

        },
        success: function(rs) {
            // console.log(rs);
            // var rs = $.parseJSON(rs);
            if(rs.status){
                msgDialog(rs.Message, false);
                // 重新讀取這筆資料
                renewListData(pageObjArea, sendObj.uid, false);
                $("#setReferenceCalendarDialog").bsDialog('close');
            }else{
                msgDialog(rs.Message||rs.errMsg||"無法分派");
            }
            $.unblockUI();

        }
    };
    $("#setReferenceCalendarDialog").find("#uploadFiles").ajaxSubmit(options);
}

// 擬文回填簽核檔案
function sendDocFileUpload(modifyObj, modifyItem){
    $.blockUI();
    $("#sendDocFileUploadDialog").remove();
    $("<div>").prop("id","sendDocFileUploadDialog").appendTo("body");

    $("#sendDocFileUploadDialog").bsDialog({
        title: modifyObj.doc_number+"用印檔案上傳",
        autoShow: true,
        start: sendDocFileUploadStart(modifyObj),
        button:[
            {
                text: "上傳",
                className: "btn-success",
                click: function(){
                    var fileLingth = $("#sendDocFileUploadDialog").find("input:file").length;
                    if(fileLingth){
                        var option = {
                          sureCall: function(){
                            sendDocFileUploadSave(modifyObj,modifyItem);
                          },
                          title: "訊息"
                        };
                        var msg = "「"+modifyObj.doc_number+"」檔案上傳後將無法異動，<br>";
                        msg += "您確定要開始上傳？";
                        chooseDialog(msg, option);
                    }else{
                        msgDialog("尚未選取任何檔案");
                    }
                }
            }
        ]
    });
}
// 回傳檔案起始動作
function sendDocFileUploadStart(modifyObj){
    var option = {styleKind:"received-issued",style:"sendDoc-file-upload"};
    getStyle(option,function(uploadPage){
        var uploadPageObj = $.parseHTML(uploadPage);
        var form = $("<form>").prop("id","uploadFile");
        form.append(uploadPageObj);

        $(uploadPageObj).find(".fa-cloud-upload").click(function(){
            var selectInfoArea = $(uploadPageObj).find("#fileInfoArea");
            newFileSelect(form, selectInfoArea);
        });
        
        $("#sendDocFileUploadDialog").find(".modal-body").append(form);
        $.unblockUI();
    });
}

// 收文 - 選擇辦理/公告頁面
function referenceChooseProcessType(content, modifyItem){
    $("#referenceChooseProcessDialog").remove();
    $("<div>").prop("id","referenceChooseProcessDialog").appendTo("body");

    $("#referenceChooseProcessDialog").bsDialog({
        title: "請選擇分派類型",
        autoShow: true,
        start: referenceChooseProcessStart(content, modifyItem),
        showFooterBtn: false,
    });
}

function referenceChooseProcessStart(content, modifyItem){
    var option = {styleKind:"received-issued",style:"reference-process-type"};
    getStyle(option,function(processTypePage){
        var processTypePageObj = $.parseHTML(processTypePage);
        // 辦理/回文
        $(processTypePageObj).find("#process").click(function(){
            $("#referenceChooseProcessDialog").bsDialog("close");
            setReferenceCalendarDialog(content, modifyItem);
        });
        // 公告
        $(processTypePageObj).find("#bullhorn").click(function(){
            var option = {
              sureCall: function(){
                referenceToAnnouncement(content.uid, modifyItem);
                $("#referenceChooseProcessDialog").bsDialog("close");
              },
              title: "訊息"
            };
            var msg = "若「"+content.doc_number+"」設為公告，將不需設置相關承辦，<br>";
            msg += "您確定要將「"+content.doc_number+"」設為公告？";
            chooseDialog(msg, option);
        });
        $("#referenceChooseProcessDialog").find(".modal-body").append(processTypePageObj);
    });

}

// 取得字號
function getPrefixContent(putArea, defaultVal){
    putArea.empty();
    var sendData = {
        api: prefixAPI + "GetData_PlPrefix",
        threeModal:true,
        data:{
            sys_code: sys_code
        }
    };
    $.getJSON(wrsUrl, sendData).done(function(rs){
        if(rs.Status){
            selectOptionPut(putArea,"0","請選擇字號（選填）");
            $.each(rs.Data, function(i, content){
                selectOptionPut(putArea,content.uid,content.name);
            });
            if(defaultVal != undefined){
                $(putArea).val(defaultVal);
            }
        }else{
            selectOptionPut(putArea,"","無資料");
        }
    });
}