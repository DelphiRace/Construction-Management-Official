(function($) {
    $.fn.orgChart = function(options) {
        var opts = $.extend({}, $.fn.orgChart.defaults, options);
        return new OrgChart($(this), opts);        
    }

    $.fn.orgChart.defaults = {
        data: [{id:1, name:'Root', parent: 0}],
        rootNodesDelete: false,
        showControls: false,
        allowEdit: false,
        onAddNode: null,
        onDeleteNode: null,
        onClickNode: null,
        onOtherNode: null,
        chartTitleHover: false,
        selectModal: false,
        selectOnly: false,
        rootSelect: false,
        newNodeText: 'Add Child',
        otherNodeBtnText: 'Action',
        otherNodeBtnClass: 'fa-cog',
        otherNodeBtn: false,
        otherNodeBtnForRoot: false,
        without:[],
        withoutRoot: false,
    };

    function OrgChart($container, opts){
        var data = opts.data;
        var nodes = {};
        var rootNodes = [];
        this.opts = opts;
        this.$container = $container;
        var self = this;

        this.draw = function(){
            $container.empty().append(rootNodes[0].render(opts));
            $container.find('.node').click(function(){
                // root can not select
                if(opts.withoutRoot){
                    var parent = parseInt(nodes[$(this).attr('node-id')].data.parent);
                    if(parent == 0){
                        return;
                    }
                }
                if(self.opts.onClickNode !== null && $.inArray(nodes[$(this).attr('node-id')],opts.without) == -1){
                    self.opts.onClickNode(nodes[$(this).attr('node-id')]);
                }
                if(opts.selectModal){
                    if(opts.selectOnly ){
                        $(".node").removeClass("nodeSelectActive");
                        $(this).addClass("nodeSelectActive");
                    }else{
                        var isActive = $(this).prop("class").search("nodeSelectActive");
                        if(isActive == -1){
                            $(this).addClass("nodeSelectActive");
                        }else{
                            $(this).removeClass("nodeSelectActive");
                        }
                    }
                    
                }
            });

            if(opts.allowEdit){
                $container.find('.node h2').click(function(e){
                    var thisId = $(this).parent().attr('node-id');
                    self.startEdit(thisId);
                    e.stopPropagation();
                });
            }

            // add "add button" listener
            $container.find('.org-add-button').click(function(e){
                var thisId = $(this).parent().attr('node-id');

                if(self.opts.onAddNode !== null){
                    self.opts.onAddNode(nodes[thisId]);
                }
                else{
                    self.newNode(thisId);
                }
                e.stopPropagation();
            });

            $container.find('.org-other-button').click(function(e){
                var thisId = $(this).parent().attr('node-id');

                if(self.opts.onOtherNode !== null){
                    self.opts.onOtherNode(nodes[thisId]);
                }
                e.stopPropagation();
            });

            $container.find('.org-del-button').click(function(e){
                var thisId = $(this).parent().attr('node-id');

                if(self.opts.onDeleteNode !== null){
                    self.opts.onDeleteNode(nodes[thisId]);
                }
                else{
                    self.deleteNode(thisId);
                }
                e.stopPropagation();
            });
        }

        this.startEdit = function(id){
            var inputElement = $('<input class="org-input" type="text" value="'+nodes[id].data.name+'"/>');
            $container.find('div[node-id='+id+'] h2').replaceWith(inputElement);
            var commitChange = function(){
                var h2Element = $('<h2>'+nodes[id].data.name+'</h2>');
                if(opts.allowEdit){
                    h2Element.click(function(){
                        self.startEdit(id);
                    })
                }
                inputElement.replaceWith(h2Element);
            }  
            inputElement.focus();
            inputElement.keyup(function(event){
                if(event.which == 13){
                    commitChange();
                }
                else{
                    nodes[id].data.name = inputElement.val();
                }
            });
            inputElement.blur(function(event){
                commitChange();
            })
        }

        this.newNode = function(parentId,name,childID,listID){
            if(childID == undefined){
                var nextId = Object.keys(nodes).length;
                while(nextId in nodes){
                    nextId++;
                }
            }else{
                nextId = childID;
            }
            if(name == undefined){
                name = '';
            }
            if(listID == undefined){
                listID = null;
            }
            self.addNode({id: nextId, name: name, parent: parentId, listID:listID});
        }

        this.addNode = function(data){
            var newNode = new Node(data);
            nodes[data.id] = newNode;
            nodes[data.parent].addChild(newNode);

            self.draw();
            if(this.opts.allowEdit){
                self.startEdit(data.id);
            }
        }

        this.deleteNode = function(id){
            for(var i=0;i<nodes[id].children.length;i++){
                self.deleteNode(nodes[id].children[i].data.id);
            }
            
            if(nodes[id].data.parent != 0){
                nodes[nodes[id].data.parent].removeChild(id);
                delete nodes[id];
            }
            self.draw();
        }

        this.getData = function(){
            var outData = [];
            for(var i in nodes){
                outData.push(nodes[i].data);
            }
            return outData;
        }

        this.getSelectData = function(){
            // console.log($container.find(".nodeSelectActive"));
            var outData = {};
            outData.obj = [];
            outData.pageObj = [];
            outData.idArr = [];

            var idStr = "";
            $container.find(".nodeSelectActive").each(function(){
                // console.log($(this).attr("node-id"));
                var thisNodeID = $(this).attr("node-id");
                outData.obj.push(nodes[thisNodeID].data);
                outData.idArr.push(thisNodeID);
                outData.pageObj.push($(this).find("h2").text());

                idStr += thisNodeID + ",";

            });
            idStr = idStr.substr(0,idStr.length-1);
            outData.idStr = idStr;
            return outData;
        }

        // constructor
        for(var i in data){
            var node = new Node(data[i]);
            nodes[data[i].id] = node;
        }

        // generate parent child tree
        for(var i in nodes){
            if(nodes[i].data.parent == 0){
                rootNodes.push(nodes[i]);
            }
            else{
                if(nodes[nodes[i].data.parent] != undefined){
                    nodes[nodes[i].data.parent].addChild(nodes[i]);
                }
            }
        }

        // draw org chart
        $container.addClass('orgChart');
        self.draw();
    }

    function Node(data){
        this.data = data;
        this.children = [];
        var self = this;

        this.addChild = function(childNode){
            this.children.push(childNode);
        }

        this.removeChild = function(id){
            for(var i=0;i<self.children.length;i++){
                if(self.children[i].data.id == id){
                    self.children.splice(i,1);
                    return;
                }
            }
        }

        this.render = function(opts){
            var childLength = self.children.length,
                mainTable;

            mainTable = "<table cellpadding='0' cellspacing='0' border='0'>";
            var nodeColspan = childLength>0?2*childLength:2;
            mainTable += "<tr><td colspan='"+nodeColspan+"'>"+self.formatNode(opts)+"</td></tr>";

            if(childLength > 0){
                var downLineTable = "<table cellpadding='0' cellspacing='0' border='0'><tr class='lines x'><td class='line left half'></td><td class='line right half'></td></table>";
                mainTable += "<tr class='lines'><td colspan='"+childLength*2+"'>"+downLineTable+'</td></tr>';

                var linesCols = '';
                for(var i=0;i<childLength;i++){
                    if(childLength==1){
                        linesCols += "<td class='line left half'></td>";    // keep vertical lines aligned if there's only 1 child
                    }
                    else if(i==0){
                        linesCols += "<td class='line left'></td>";     // the first cell doesn't have a line in the top
                    }
                    else{
                        linesCols += "<td class='line left top'></td>";
                    }

                    if(childLength==1){
                        linesCols += "<td class='line right half'></td>";
                    }
                    else if(i==childLength-1){
                        linesCols += "<td class='line right'></td>";
                    }
                    else{
                        linesCols += "<td class='line right top'></td>";
                    }
                }
                mainTable += "<tr class='lines v'>"+linesCols+"</tr>";

                mainTable += "<tr>";
                for(var i in self.children){
                    mainTable += "<td colspan='2'>"+self.children[i].render(opts)+"</td>";
                }
                mainTable += "</tr>";
            }
            mainTable += '</table>';
            return mainTable;
        }

        this.formatNode = function(opts){
            var nameString = '',
                descString = '',
                titleClass = '',
                selectModalClass = '';
            if(typeof data.name !== 'undefined'){
                if(opts.allowEdit){
                    titleClass = "edit";
                }
                if(self.data.parent == 0 && !opts.rootNodesDelete){
                    titleClass += "rootNode";
                }
                nameString = '<h2 class="'+titleClass+'">'+self.data.name+'</h2>';
            }
            if(typeof data.description !== 'undefined'){
                descString = '<p>'+self.data.description+'</p>';
            }
            if(opts.showControls){
                var buttonsHtml = "<div class='org-add-button'><i class='fa fa-plus-circle'></i>"+opts.newNodeText+"</div>";
                buttonsHtml += self.createOtherBtn(opts);
                
                // It is Root, so could not del btn
                buttonsHtml += (self.data.parent == 0 && !opts.rootNodesDelete)?"":"<div class='org-del-button'><i class='fa fa-trash'></i></div>";
            }
            else{
                buttonsHtml = '';
            }
            // root can not select
            if(opts.selectModal){
                if(opts.withoutRoot){
                    if(parseInt(self.data.parent) > 0 ){
                        selectModalClass = ' nodeSelectModal';
                    }
                }else{
                    selectModalClass = ' nodeSelectModal';
                }
            }
            return "<div class='node"+selectModalClass+"' node-id='"+this.data.id+"'>"+nameString+descString+buttonsHtml+"</div>";
        }

        this.createOtherBtn = function(opts){
            if(opts.otherNodeBtn){
                if(self.data.parent == 0 && !opts.otherNodeBtnForRoot){
                    return "";
                }
                var buttonsHtml = "<div class='org-other-button'><i class='fa "+opts.otherNodeBtnClass+"'></i>"+opts.otherNodeBtnText+"</div>";
            }
            return buttonsHtml;
        }
    }

})(jQuery);

