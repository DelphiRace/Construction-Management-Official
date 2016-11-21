(function( $ ){

    $.fn.treeView = function(option) {
        option = $.extend(true, {}, $.fn.treeView.defaults, option);
        // console.log(option);
        return new treeView(this, option);
    }

    $.fn.treeView.defaults = {
        openIcon: null,
        closeIcon: null,
        selectedData: null, //split ","
        data:{},
        expansion: true,
        expansionLevel: 0,
        start: function(){},
        editorBtn:{},
        editor: {},
        checkbox: true,
        selectedRturnDataIndex: "id",
        title: "",
        titleTextSplit: ""

    };

    var isSelected = {};
    var parentSelectStatus = {};
    var childIsSelected = {};
    var parentItem = {};

    function treeView($selector, option){
        var self = this;

        if(option.selectedData){
            var selectedDataArr = option.selectedData.split(",");
            option.selectedData = selectedDataArr;
        }

        this.start = function(){
            var contentUL = $('<ul>');
            
            contentUL.addClass("treeViewContent");
            // 其他的欄位
            var otherTitle = [];
            if(option.title){
                if(option.title.search(",") != -1){
                    var tmpTitle = $.trim(option.title).split(",");
                    otherTitle = tmpTitle;
                }else{
                    otherTitle.push(option.title);
                }
            }

            $.each(option.data,function(index, nodesContent){
                // console.log(nodesContent);
                var contents = $('<div>');
                var checkBox = $('<input type="checkbox">');
                var contentText = $('<span>').text(nodesContent.title).addClass('treeViewText');
                var thisLIContent = $('<li>').addClass("treeContent roots");

                if(option.checkbox){
                    contents.append(checkBox);
                }
                contents.append(contentText);
                if(otherTitle.length){
                    $.each(otherTitle, function(titleIndex, titleContent){
                        tmpContentText = $('<span>').text(nodesContent[titleContent]).addClass('otherTitle');
                        contents.append(tmpContentText);
                        if($.trim(option.titleTextSplit)){
                            if(titleIndex+1 < otherTitle.length){
                                $('<span>').text(option.titleTextSplit).addClass('otherTitleSplit').appendTo(contents);
                            }
                        }
                    });
                }

                if(Object.size(option.editorBtn)){
                    var editorBtns = $('<span>').addClass('editorBtnGroup');
                    // console.log("T");
                    $.each(option.editorBtn, function(eIndex,eBtn){
                        var btnObj = $.parseHTML(eBtn);
                        $(btnObj).addClass("treeViewEditorBtn");
                        if(Object.size(option.editor)){
                            $(btnObj).click(function(){
                                if(option.editor[eIndex] != undefined){
                                    option.editor[eIndex](nodesContent, thisLIContent);
                                }
                            });
                        }
                        editorBtns.append(btnObj);
                    });
                    contents.append(editorBtns);
                }

                thisLIContent.append(contents);

                if(nodesContent.nodes != undefined){
                    var expansion = $('<i class="fa fa-caret-down fa-lg"></i>');
                    expansion.click(function(){
                        if($(this).prop("class").search("fa-caret-down") != -1){
                            thisLIContent.find(".treeViewContent").slideUp();
                            thisLIContent.find(".fa-caret-down").removeClass("fa-caret-down").addClass("fa-caret-right");
                            $(this).removeClass("fa-caret-down").addClass("fa-caret-right");
                        }else{
                            thisLIContent.find(".treeViewContent").slideDown();
                            thisLIContent.find(".fa-caret-right").removeClass("fa-caret-right").addClass("fa-caret-down");
                            $(this).removeClass("fa-caret-right").addClass("fa-caret-down");
                        }
                    });
                    if(option.checkbox){
                        thisLIContent.find("input").after(expansion);
                    }else{
                        thisLIContent.find(".treeViewText").before(expansion);
                    }
                    createChild( thisLIContent, nodesContent.nodes, nodesContent.id, nodesContent, option, 1, otherTitle );

                    checkBox.click(function(){
                        var isChecked = $(this).prop("checked");
                        // console.log($(this).parents(".treeContent").find("input:checkbox"));
                        $(this).parents(".treeContent").find("input:checkbox").prop("checked",isChecked).change();
                        if(isChecked){
                            isSelected[nodesContent.id] = nodesContent;
                        }else{
                            delete isSelected[nodesContent.id];
                        }
                    }).change(function(){
                        var isChecked = $(this).prop("checked");
                        if(isChecked){
                            isSelected[nodesContent.id] = nodesContent;
                        }else{
                            delete isSelected[nodesContent.id];
                        }
                    });
                    parentSelectStatus[nodesContent.id] = nodesContent.nodes.length;
                    childIsSelected[nodesContent.id] = {};
                    parentItem[nodesContent.id] = checkBox;
                    if(!option.expansion && option.expansionLevel == 0 && expansion != undefined){
                        expansion.click();
                    }
                }else{
                    checkBox.change(function(){
                        var isChecked = $(this).prop("checked");
                        if(isChecked){
                            isSelected[nodesContent.id] = nodesContent;
                        }else{
                            delete isSelected[nodesContent.id];
                        }

                    });
                }
                
                thisLIContent.appendTo(contentUL);
                if($.inArray(nodesContent[option.selectedRturnDataIndex].toString(), option.selectedData) != -1){
                    checkBox.prop("checked",true).change();
                }
                // $selector
            });
            contentUL.appendTo($selector);
            option["start"]();
        }

        this.getParents = function(itemID){
            var tmpArr = [];
            if(itemID != ""){
                tmpArr = findParent( itemID, option.data, option.data);
                tmpArr = $.grep(tmpArr,function(content, index){
                    if(content.id != itemID){
                        return content;
                    }
                });
                
            }
            return tmpArr;
        }

        this.reload = function(reloadOption){
            $selector.empty();
            if(reloadOption != undefined){
                if(reloadOption.data != undefined){
                    option.data = reloadOption.data;
                }
                if(reloadOption.selectedData != undefined){
                    option.selectedData = reloadOption.selectedData;
                }
            }else{
                option.selectedData = null;
            }
            treeView($selector, option);
        }

        this.selected = function(){
            return selected(option.selectedRturnDataIndex);
        }

        this.expansion = function(){

        }

        self.start();
    }

    function createChild($selector,data, parentID, parentData, option, level, otherTitle){
        
        $.each(data, function(index,cNodes){
            // console.log(index, data[index].nodes);
            // return;
            var childContentUL = $('<ul>');
            childContentUL.addClass("treeViewContent");

            var contents = $('<div>');
            var checkBox = $('<input type="checkbox">');

            // contents.append(checkBox).append(cNodes.title);
            var liContent = $('<li>').addClass("treeContent").append(contents);

            var contentText = $('<span>').text(cNodes.title).addClass('treeViewText');

            if(option.checkbox){
                contents.append(checkBox);
            }
            contents.append(contentText);

            if(otherTitle.length){
                $.each(otherTitle, function(titleIndex, titleContent){
                    tmpContentText = $('<span>').text(cNodes[titleContent]).addClass('otherTitle');
                        contents.append(tmpContentText);
                        if($.trim(option.titleTextSplit)){
                            if(titleIndex+1 < otherTitle.length){
                                $('<span>').text(option.titleTextSplit).addClass('otherTitleSplit').appendTo(contents);
                            }
                        }
                });
            }

            if(Object.size(option.editorBtn)){
                var editorBtns = $('<span>').addClass('editorBtnGroup');
                // console.log("T");
                $.each(option.editorBtn, function(eIndex,eBtn){
                    var btnObj = $.parseHTML(eBtn);
                    $(btnObj).addClass("treeViewEditorBtn");
                    if(Object.size(option.editor)){
                        $(btnObj).click(function(){
                            if(option.editor[eIndex] != undefined){
                                option.editor[eIndex](cNodes, liContent);
                            }
                        });
                    }
                    editorBtns.append(btnObj);

                });
                contents.append(editorBtns);
            }

            liContent.appendTo(childContentUL);

            if(typeof cNodes.nodes != "undefined"){
                var expansion = $('<i class="fa fa-caret-down fa-lg"></i>');
                expansion.click(function(){
                    if($(this).prop("class").search("fa-caret-down") != -1){
                        liContent.find(".treeViewContent").slideUp();
                        $(this).removeClass("fa-caret-down").addClass("fa-caret-right");
                        liContent.find(".fa-caret-down").removeClass("fa-caret-down").addClass("fa-caret-right");
                    }else{
                        liContent.find(".treeViewContent").slideDown();
                        $(this).removeClass("fa-caret-right").addClass("fa-caret-down");
                        liContent.find(".fa-caret-right").removeClass("fa-caret-right").addClass("fa-caret-down");

                    }
                });
                if(option.checkbox){
                    liContent.find("input").after(expansion);
                }else{
                    liContent.find(".treeViewText").before(expansion);
                }
                checkBox.click(function(){
                    var isChecked = $(this).prop("checked");
                    // console.log($(this).parents(".treeViewContent"));
                    $(this).parents(".treeViewContent").eq(0).find("input:checkbox").prop("checked",isChecked).change();
                    if(isChecked){
                        isSelected[cNodes.id] = cNodes;
                        childIsSelected[parentID][cNodes.id] = true;
                    }else{
                        delete isSelected[cNodes.id];
                        delete childIsSelected[parentID][cNodes.id];
                    }
                    setPartentSelectStatus(parentID, parentData);

                }).change(function(){
                    if(childIsSelected[parentID] != undefined){
                        var isChecked = $(this).prop("checked");
                        if(isChecked){
                            isSelected[cNodes.id] = cNodes;
                            childIsSelected[parentID][cNodes.id] = true;
                        }else{
                            delete isSelected[cNodes.id];
                            delete childIsSelected[parentID][cNodes.id];
                        }
                        setPartentSelectStatus(parentID, parentData);
                    }
                });
                createChild(liContent, cNodes.nodes, cNodes.id, cNodes, option, level + 1, otherTitle);
                parentSelectStatus[cNodes.id] = cNodes.nodes.length;
                childIsSelected[cNodes.id] = {};
                parentItem[cNodes.id] = checkBox;

            }else{
                checkBox.change(function(){
                    // console.log("T");
                    if(childIsSelected[parentID] != undefined){
                        var isChecked = $(this).prop("checked");
                        if(isChecked){
                            isSelected[cNodes.id] = cNodes;
                            childIsSelected[parentID][cNodes.id] = true;
                        }else{
                            delete isSelected[cNodes.id];
                            delete childIsSelected[parentID][cNodes.id];
                        }
                        // console.log(parentID);
                        setPartentSelectStatus(parentID, parentData);
                    } 
                });
            }
            // console.log($.inArray(cNodes[option.selectedRturnDataIndex], option.selectedData));
            if($.inArray(cNodes[option.selectedRturnDataIndex].toString(), option.selectedData) != -1){
                if(childIsSelected[parentID] == undefined){
                    childIsSelected[parentID] = {};
                }
                checkBox.prop("checked",true).change();
            }
            // console.log(level);
            if(!option.expansion){
                if(expansion != undefined){
                    expansion.click();
                }
                if(level > option.expansionLevel){
                    childContentUL.hide();
                }
            }
            $(childContentUL).appendTo( $selector );
        });
    }

    function findParent( itemID, data, originalData ){
        // console.log(itemID);
        var tmpArr = [];
        $.each(data,function(index, content){
            if((content.id == itemID || content.id.toString() == itemID) && (itemID != 0 || itemID != "0")){
                
                // console.log(content.parent, data);
                tmpArr.push(content);
                var tmpProcessArr = findParent( content.parent, originalData, originalData );

                if(tmpProcessArr.length){
                    if(tmpProcessArr.length){
                        // console.log(tmpProcessArr);
                        $.each(tmpProcessArr,function(i,v){
                            // console.log(v);
                            tmpArr.push(v);

                        });
                    }
                    
                }
            }else{
                if(content.nodes != undefined){
                    var tmpProcessArr = findParent( itemID, content.nodes, originalData );
                    if(tmpProcessArr.length){
                        // console.log(tmpProcessArr);
                        $.each(tmpProcessArr,function(i,v){
                            // console.log(v);
                            tmpArr.push(v);

                        });
                    }
                }
            }
        });
        // if(tmpArr.length)
        // console.log(tmpArr);
        return tmpArr;
    }

    function selected(dataIndex){
        var selectStr = "";
        $.each(isSelected,function(i,content){
            selectStr += content[dataIndex] + ","; 
        });
        if(selectStr.length){
            selectStr = selectStr.substring(0,selectStr.length-1);
        }
        return selectStr;
    }

    function setPartentSelectStatus(parentID,parentData){
        // console.log(childIsSelected[parentID],parentID);
        if(parentItem[parentID] != undefined){
            if(Object.size(childIsSelected[parentID]) == parentSelectStatus[parentID]){
                parentItem[parentID].prop("checked",true).change();
                isSelected[parentID] = parentData;
            }else{
                
                parentItem[parentID].prop("checked",false).change();
                delete isSelected[parentID];
                
            }
        }
    }

    //取得物件長度
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
})(jQuery);