(function( $ ){

    $.fn.bsDialogSelect = function(action, option) {
        if(typeof action == "object"){
            option = $.extend({}, $.fn.bsDialogSelect.defaults, action);
            action = "";
        }else{
            if(typeof option != "function"){
                option = $.extend(true, {}, $.fn.bsDialogSelect.defaults, option);
            }
        }
        // console.log(action, option);
        
        return new bsDialogSelect(this, option, action);
    }

    $.fn.bsDialogSelect.defaults = {
        headerCloseBtn: true,
        title: "&nbsp;",
        showFooterBtn: true,
        autoShow: true,
        width: null,
        height: null,
        modalClass: null,
        button: [],
        selectData: [],
        data: {},
        textTag: "",
        valeTag: "",
        searchBar:true,
        onlySelect: true,
        view: false,
        start: function(){},
        close: function(){},
        viewAction: function(returnData){}
    };

    function bsDialogSelect($selector, option, action){
        var self = this;
        var textTag = option.textTag,
        valeTag = option.valeTag;
        this.bsDialogSelectShow = function(){     
            var nowModalIn = $(".modal.fade.in").length + 1;
            // $(".modal.fade.in").eq(-2).fadeOut(300);
            $selector.modal({
                backdrop: 'static',
                keyboard: option.headerCloseBtn,
                show: 'show'
            }).on("shown.bs.modal",function(event){
                if($(".modal.fade.in").length == 1){
                    if($(".modal.fade.in").last().css("display") == "none"){
                        $(".modal.fade.in").last().fadeIn(300);
                    }
                }
            }).on("hidden.bs.modal",function(event){
                // console.log($(".modal.fade.in"));
                $(".modal.fade.in").eq(-1).fadeIn(300,function(){
                    $("body").addClass("modal-open");
                });
                $selector.off("showbsDialogSelect");
                $("body").removeProp("style");
                self.deleteHash();
            });
            
            if(nowModalIn > 1 && $(".modal.fade.in").length > 0){
                $(".modal.fade.in").last().fadeOut(300);
            }
            
        };

        this.bsDialogSelectClose = function(){
            $selector.modal("hide");
            $selector.off("showbsDialogSelect");
        };

        this.start = function(){

            if($selector.find(".modal-content").length){
                return;
            }
            
            $selector.addClass("modal fade").attr("aria-hidden","true");
            var originContent = $selector.html();
            $selector.empty();
            var bsModal = $("<div>").addClass("modal-dialog");
            if(option.width != null){
                bsModal.css("width", option.width);
            }

            if(option.height != null){
                bsModal.css("height", option.height);
            }

            if(option.modalClass != null){
                bsModal.addClass(option.modalClass);
            }

            bsModal.appendTo($selector);
            var bsModalContent = $("<div>").addClass("modal-content").appendTo(bsModal);
            var bsModalHeader = $("<div>").addClass("modal-select-header");
            // title Button
            if(option.headerCloseBtn){
                $("<button>").addClass("close")
                .attr("data-dismiss","modal")
                .html("&times;")
                .click(function(){
                    $selector.off("showbsDialogSelect");
                    $selector.bsDialogSelect("close");
                    
                })
                .appendTo(bsModalHeader);
            }
            // $("<div>").addClass("modal-title").appendTo(bsModalHeader);
            $("<h4>").addClass("modal-select-title").html(option.title).appendTo(bsModalHeader);

            // title into Header Bar
            bsModalHeader.appendTo(bsModalContent);

            // bodys
            var modalBody = $("<div>").addClass("modal-body");
            modalBody.append(originContent);
            // var 

            // title-bar content
            var titleBar = $("<div>").addClass("modal-select-title-bar contents");
            //search Btn
            if(option.searchBar){
                jQuery.expr[':'].contains = function(a, i, m) {
                  return jQuery(a).text().toUpperCase()
                      .indexOf(m[3].toUpperCase()) >= 0;
                };
                var searchArea = $("<input>").prop("type","text").addClass("form-control");
                // 搜尋事件
                searchArea.keyup(function(){
                    var searchVal = $(this).val();
                    if( searchVal ){
                        $selector.find(".selectItem").hide()
                        .find(".selectItemContent:contains("+searchVal+")").parent().show();
                    }else{
                        $selector.find(".selectItem").show();
                    }
                });
                $("<div>").addClass("col-xs-10 col-md-11").append(searchArea)
                .appendTo(titleBar);

                var searchBtn = $("<i>").addClass("fa fa-search fa-lg modal-select-search mouse-pointer send-btn")
                .click(function(){
                    // $selector.off("showbsDialogSelect");
                    var searchVal = searchArea.val();
                    if( searchVal ){
                        $selector.find(".selectItem").hide()
                        .find(".selectItemContent:contains("+searchVal+")").parent().show();
                    }else{
                        $selector.find(".selectItem").show();
                    }
                });

                $("<div>").addClass("col-xs-2 col-md-1 f-left").append(searchBtn)
                .appendTo(titleBar);   
            }
            // title content
            // $("<h4>").addClass("modal-select-title").html(option.title).appendTo(titleBar);


            // body content
            
            var contentArea = self.createContent(option,originContent);
            // console.log(windowWidth);
            titleBar.appendTo(modalBody);
            modalBody.append(contentArea).appendTo(bsModalContent);
            // console.log();
            // footer Button
            if(option.showFooterBtn){
                var buttonArea = $("<div>").addClass("modal-footer");
                    // console.log(typeof option.button, option.button);

                $.each(option.button,function(index,content){
                    var button = $("<button>");
                    
                    button.addClass("btn btn-default").text(content.text).click(function(){
                        if(typeof content["click"] != "undefined"){
                            content["click"]();
                        }
                    });
                    if(typeof content.className != "undefined"){
                        button.addClass(content.className);
                    }
                    button.appendTo(buttonArea);
                        
                });
                buttonArea.appendTo(bsModalContent);
            }

            option["start"]();
        }

        this.createContent = function(option){
            var windowWidth = $(window).height() * 0.53;
            var contentArea = $("<div>").addClass("modal-items");

            if($selector.find(".modal-items").length){
                $selector.find(".modal-items").remove();
            }
            
            contentArea.css({
                height: windowWidth
            })
            // 最外層框框
            var selectItemBorder = $("<div>").addClass("col-xs-12 col-md-12 selectItem");
            var selectItemBox = $("<div>").addClass("col-xs-2 col-md-1 text-center list-items selectItemBox");
            var selectItemBoxEmptyStyle = "fa-square-o";
            var selectItemBoxCheckStyle = "fa-check-square-o";
            var selectItemBoxBtn = $('<i>').addClass('fa '+selectItemBoxEmptyStyle+' fa-lg selectItemBoxBtn');

            // 查看鈕
            var selectViewBtnBox = $("<div>").addClass("col-xs-2 col-md-1 text-center list-items");
            var selectViewBtn = $('<i>').addClass('fa fa-search fa-lg selectViewBtn mouse-pointer send-btn');

            $("<div>").addClass("item-actionBtn mouse-pointer").append(selectItemBoxBtn).appendTo(selectItemBox);
            // 放入
            selectItemBox.appendTo(selectItemBorder);
            // 內容
            if(!option.view){
                $("<div>").addClass("col-xs-10 col-md-11 list-items selectItemContent").appendTo(selectItemBorder);
            }else{
                $("<div>").addClass("col-xs-8 col-md-10 list-items selectItemContent").appendTo(selectItemBorder);
                selectViewBtnBox.append(selectViewBtn).appendTo(selectItemBorder);
            }

            // 值
            $("<input>").prop("type","hidden").addClass("selectItemValue").appendTo(selectItemBorder);
            
            // 是網頁物件
            if (option.data != undefined && option.data.selector != undefined){
                $(option.data).find("option").each(function(){
                    var items = selectItemBorder.clone();
                    var thisText = $(this).text();
                    var thisVal = $(this).prop("value");
                    items.find(".selectItemContent").text(thisText);
                    items.find(".selectItemValue").val(thisVal);

                    // if value inside array
                    if(option.selectData.length && $.inArray(thisVal,option.selectData) >= 0){
                        items.find(".selectItemBoxBtn")
                        .removeClass(selectItemBoxCheckStyle)
                        .removeClass(selectItemBoxEmptyStyle)
                        .addClass(selectItemBoxCheckStyle);
                    }

                    items.find(".selectItemBoxBtn").click(function(){
                        if(option.onlySelect){
                            items.find("."+selectItemBoxCheckStyle).removeClass(selectItemBoxCheckStyle);
                            $(this).addClass(selectItemBoxEmptyStyle);
                        }else{
                            var thisCalss = $(this).prop("class");
                            if(thisCalss.search(selectItemBoxEmptyStyle) == -1){
                                $(this).removeClass(selectItemBoxCheckStyle).addClass(selectItemBoxEmptyStyle);
                            }else{
                                $(this).removeClass(selectItemBoxEmptyStyle).addClass(selectItemBoxCheckStyle);
                            }
                        }
                    });

                    items.appendTo(contentArea);
                }).hide();
            }else{//不是網頁物件
                var data;
                if(option.data != undefined){
                    data = option.data;
                }else{
                    data = option;
                }

                $.each(data,function(i,v){
                    var items = selectItemBorder.clone();
                    if(textTag){
                        items.find(".selectItemContent").text(v[textTag]);
                    }
                    if(valeTag){
                        items.find(".selectItemValue").val(v[valeTag]);
                    }
                    // if value inside array
                    if(option.selectData.length && $.inArray(v[valeTag],option.selectData) >= 0){
                        items.find(".selectItemBoxBtn")
                        .removeClass(selectItemBoxCheckStyle)
                        .removeClass(selectItemBoxEmptyStyle)
                        .addClass(selectItemBoxCheckStyle);
                    }
                    items.find(".selectItemBoxBtn").click(function(){
                        var thisCalss = $(this).prop("class");
                        if(option.onlySelect){
                            contentArea.find(".selectItemBoxBtn")
                            .removeClass(selectItemBoxCheckStyle)
                            .removeClass(selectItemBoxEmptyStyle)
                            .addClass(selectItemBoxEmptyStyle);
                        }
                            
                        if(thisCalss.search(selectItemBoxEmptyStyle) == -1){
                            $(this).removeClass(selectItemBoxCheckStyle).addClass(selectItemBoxEmptyStyle);
                        }else{
                            $(this).removeClass(selectItemBoxEmptyStyle).addClass(selectItemBoxCheckStyle);
                        }
                        
                    });

                    if(option.view){
                        items.find(".selectViewBtn").click(function(){
                            option.viewAction(v);
                        });
                    }

                    items.appendTo(contentArea);
                });
            }
            // console.log(contentArea);
            return contentArea;
        }

        this.getValue = function(){
                // console.log("T");

            var selectItemBoxCheckStyle = "fa-check-square-o";
            var valueStr = "";
            $selector.find(".selectItem").each(function(){
                if($(this).find("."+selectItemBoxCheckStyle).length){
                    valueStr += $(this).find(".selectItemValue").val() + ",";
                }
            });
            if(valueStr.length){
                valueStr = valueStr.substring(0,valueStr.length - 1);
            }
                // console.log(valueStr);

            return valueStr;
        }

        this.getText = function(){
                // console.log("T");

            var selectItemBoxCheckStyle = "fa-check-square-o";
            var valueStr = "";
            $selector.find(".selectItem").each(function(){
                if($(this).find("."+selectItemBoxCheckStyle).length){
                    valueStr += $(this).find(".selectItemContent").text() + ",";
                }
            });
            if(valueStr.length){
                valueStr = valueStr.substring(0,valueStr.length - 1);
            }
                // console.log(valueStr);

            return valueStr;
        }

        this.reloadData = function(data){
                // console.log("T");

            var content = self.createContent(data);
            $selector.find(".modal-body").append(content);

        }

        this.deleteHash = function(){
            var orgSearch = window.location.search.substring(1);
            var sPageURL = decodeURIComponent(orgSearch);   
            sURLVariables = sPageURL.split('&');
            sParameterName = sURLVariables[0].split('=');
            if(orgSearch){
                orgSearch = "?"+orgSearch;
            }
            var organizePathname = window.location.pathname.substring(1);
            window.history.pushState(sParameterName[1],null, organizePathname+orgSearch);
        }

        switch(action){
            case "show":
                self.bsDialogSelectShow();
                if(typeof option == "function"){
                    option();
                }
                return;
            break;
            case "close":
                self.bsDialogSelectClose();
                if(typeof option == "function"){
                    option();
                }
                return;
            break;
        }
            
        
        if(option.autoShow){
            self.start();
            self.bsDialogSelectShow();
        }else{
            self.start();
        }
    }
})(jQuery);