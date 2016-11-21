(function( $ ){

    $.fn.bsDialog = function(option) {
        if(typeof option == "string"){
            openDialog(option,this);
            return;
        }

        option = optionSet(option);
        // console.log(option);
        this.addClass("modal fade");
        var originContent = this.html();
        this.empty();
        var bsModal = $("<div>").addClass("modal-dialog").appendTo(this);
        var bsModalContent = $("<div>").addClass("modal-content").appendTo(bsModal);
        var bsModalHeader = $("<div>").addClass("modal-header");
        // title Button
        if(option.headerCloseBtn){
            $("<button>").addClass("close")
            .attr("data-dismiss","modal")
            .html("&times;")
            .appendTo(bsModalHeader);
        }
        // title
        $("<h4>").addClass("modal-title").html(option.title).appendTo(bsModalHeader);
        bsModalHeader.appendTo(bsModalContent);

        // bodys
        $("<div>").addClass("modal-body").html(originContent).appendTo(bsModalContent);

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

        // auto show
        if(option.autoShow){
            this.modal({
                backdrop: 'static',
            });
        }
    }

    $.fn.bsDialog.defaults = {
        headerCloseBtn: true,
        title: "&nbsp;",
        showFooterBtn: true,
        autoShow: false,
        button: {},
        start: function(){}
    };

    function optionSet(option){
        // tmpOption = {
        //     headerCloseBtn: true,
        //     title: "&nbsp;",
        //     showFooterBtn: true,
        //     autoShow: false,
        //     button: {},
        //     start: function(){}
        // };
        // if(option != undefined){
        //     $.each(tmpOption,function(index,value){
        //         if(typeof option[index] != "undefined"){
        //             tmpOption[index] = option[index];
        //         }
        //     });
        // }
        var opts = $.extend({}, $.fn.bsDialog.defaults, option);
        return opts;
    }

    function openDialog(status,thisObj){
        switch(status){
            case "show":
                thisObj.modal({
                    backdrop: 'static',
                });
            break;
            case "close":
                thisObj.modal("hide");
            break;
        }
    }
})(jQuery);