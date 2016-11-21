//整理樹狀資料
function processTreeData(treeData, showRoot, rootID, rootName, options){
	var tmpMenuObj = {};
    if(typeof options == "undefined"){
        options = {};
        options.idName = "id";
    }
	if(typeof showRoot == "undefined"){
		showRoot = true;
	}
	if(showRoot == true){
		if(typeof rootID == "undefined"){
			rootID = "root";
		}
		if(typeof rootName == "undefined"){
			rootName = "資料";
		}
	}
    //先整理
    $.each(treeData,function(i,node){
    	if(typeof tmpMenuObj[node.parent] == "undefined"){
    		tmpMenuObj[node.parent] = {};
    		tmpMenuObj[node.parent]["nodes"] = {};
    	}
    	tmpMenuObj[node.parent]["nodes"][node[options.idName]] = {id: node[options.idName], text: node.name};
    });
	tmpMenuObj[0].id = rootID;
	tmpMenuObj[0].text = rootName;
    // console.log(tmpMenuObj);
    // ---------------------------------------------------------------------

    //放好第一層級的資料
    $.each(tmpMenuObj[0].nodes,function(i,node){
    	var otherMenuContent = {};
    	//這代表還有第二層
    	if(typeof tmpMenuObj[i] != "undefined"){
    		//轉換為陣列
    		otherMenuContent = $.map(CreatOtherTreeDataNodes(i, tmpMenuObj),function(v, i){
            	return v;
            });
    		tmpMenuObj[0]["nodes"][i]["nodes"] = otherMenuContent;
    	}
    });
    //將物件轉為陣列
    tmpMenuObj[0].nodes = $.map(tmpMenuObj[0].nodes,function(v, i){
    	return v;
    });
    // ---------------------------------------------------------------------
    //回傳
    if(showRoot){
    	return [tmpMenuObj[0]];
	}else{
		var tmpArr = [];
		$.each(tmpMenuObj[0].nodes,function(i,v){
			tmpArr.push(v);
		});

    	return tmpArr;
	}
}

//整理樹狀資料
function processTreeDataOnly(treeData,options){
    var tmpMenuObj = {};
    if(typeof options == "undefined"){
        options = {};
        options.idName = "uid";
        options.title = "name";
    }
    //先整理
    $.each(treeData,function(i,node){
        if(typeof tmpMenuObj[node.parent] == "undefined"){
            tmpMenuObj[node.parent] = {};
        }

        if(typeof node[options.title] != undefined){
            node.title = node[options.title];
        }

         if(typeof node[options.idName] != undefined){
            node.id = node[options.idName];
        }
        
        tmpMenuObj[node.parent][node[options.idName]] = node;
    });
    
    // ---------------------------------------------------------------------
    // console.log(tmpMenuObj);
    //放好第一層級的資料
    $.each(tmpMenuObj[0],function(i, node){
        var otherMenuContent = {};
        // //這代表還有第二層
        if(typeof tmpMenuObj[i] != "undefined"){
            //轉換為陣列
            otherMenuContent = $.map( CreatOtherTreeData(i, tmpMenuObj) , function(v, i){
                return v;
            });
            // console.log(otherMenuContent);
            tmpMenuObj[0][i]["nodes"] = otherMenuContent;
        }
    });
    // ---------------------------------------------------------------------
    //回傳
    return tmpMenuObj;
}

//產生其他子層
function CreatOtherTreeDataNodes(otherLayerDataIndex, totalData){
	var otherMenuContent = {};
	//console.log(otherLayerDataIndex);
	$.each(totalData[otherLayerDataIndex].nodes,function(i,content){
	// console.log(i,content["uid"]);
		if(typeof otherMenuContent[i] == "undefined"){
			otherMenuContent[i] = {};
		}
		//這代表還有第二層
        if(typeof totalData[i] != "undefined"){
            //重複建好
            otherMenuContent[i].id = i;
            otherMenuContent[i].text = content.text;
            otherMenuContent[i].nodes = $.map(CreatOtherTreeDataNodes(i, totalData),function(v, i){
            	return v;
            });
        }else{
        	
        	otherMenuContent[i] = content;
        	
        }
	});
    
    return otherMenuContent;
}

//產生其他子層
function CreatOtherTreeData(otherLayerDataIndex, totalData){
    var otherMenuContent = {};
    // console.log(otherLayerDataIndex);
    // return;
    $.each(totalData[otherLayerDataIndex],function(i,content){
    // console.log(i,content["uid"]);
        if(typeof otherMenuContent[i] == "undefined"){
            otherMenuContent[i] = {};
        }
        //這代表還有第二層
        if(typeof totalData[i] != "undefined"){
            //重複建好
            otherMenuContent[i] = content;
            otherMenuContent[i]["nodes"] = $.map(CreatOtherTreeData(i, totalData),function(v, i){
                return v;
            });
        }else{
            
            otherMenuContent[i] = content;
            
        }
    });
    delete totalData[otherLayerDataIndex];
    return otherMenuContent;
}

//整理Menu樹狀資料
function processMenuTreeDataOnly(treeData,options){
    var tmpMenuObj = {};
    if(typeof options == "undefined"){
        options = {};
        options.idName = "uid";
        options.title = "name";
    }
    var tmpMenuArr = [];
    var finishMenuArr = {};
    //先整理
    $.each(treeData,function(i,node){
        // console.log(node);
        var parent = parseInt(node.parent);
        // console.log(parent);
        var putNodeID = parseInt(node[options.idName]);
        if(typeof tmpMenuObj[parent] == "undefined"){
            tmpMenuObj[parent] = {};
        }

        if(typeof node[options.title] != "undefined"){
            node.title = node[options.title];
        }

         if(typeof node[options.idName] != "undefined"){
            node.id = node[options.idName];
        }
        
        var contentTag = $("<a>").prop("href",node.url).addClass(node["class_name"]).html(node.title);
        // contentTag.click(function(){
        //   if(node.url != "#"){
        //     $("#pagescontent").empty();
        //     loadPage(node.url,"pagescontent");
        //   }
        //   // 登出機制，只要再CLASS裡面有logout關鍵字的連結走這裡
        //   if($(this).prop("class").search("logout") != -1){
        //     logoutEven();
        //   }
        //   return false;
        // });
        // console.log(parent,putNodeID,contentTag);
        // tmpMenuObj[parent][putNodeID] = contentTag;
        tmpMenuArr.push(contentTag);
            
        tmpMenuObj[parent][putNodeID] = { 
            "item": contentTag,
            "sort": tmpMenuArr.length - 1
        };
        // console.log(tmpMenuObj);
    });
    
    // ---------------------------------------------------------------------
    //放好第一層級的資料
    $.each(tmpMenuObj[0],function(i, node){
        // console.log(node);
        var otherMenuContent = {};

        var liContent = $("<li>");
        liContent.append(node.item);
        // //這代表還有第二層
        if(typeof tmpMenuObj[i] != "undefined"){
            
            //轉換為陣列
            otherMenuContent = $.map( CreatOtherMenuData(i, tmpMenuObj, tmpMenuArr) , function(v, i){
                return v;
            });
            // tmpMenuObj[0][i]["nodes"] = otherMenuContent;
            var childUl = $("<ul>");
            childUl.append(otherMenuContent);
            liContent.append(childUl);
        }
        tmpMenuArr[node.sort] = liContent;
        tmpMenuObj[0][i] = liContent;            
        // tmpMenuArr.splice(node.sort,1);
        finishMenuArr[node.sort] = tmpMenuArr[node.sort];
    });
    // ---------------------------------------------------------------------
    // console.log(finishMenuArr);
    //回傳
    return finishMenuArr;
}

//產生其他Menu子層
function CreatOtherMenuData(otherLayerDataIndex, totalData, menuArr){
    var otherMenuContent = {};
    var otherMenuArr = [];

    var processData = $.map(totalData[otherLayerDataIndex],function(v, i){
        var obj = {
            "id":i,
            "obj": v
        };
        return obj;
    });
    processData.sort(function (a, b) {
        return a.obj.sort > b.obj.sort ? 1 : -1;
    });

    $.each(processData,function(i,content){
        // console.log(content);
        var liContent = $("<li>");
        liContent.append(content.obj.item);
        
        if(typeof otherMenuContent[content.id] == "undefined"){
            otherMenuContent[content.id] = {};
        }
        //這代表還有第二層
        if(typeof totalData[content.id] != "undefined"){
            var ul = $("<ul>");
            $.map(CreatOtherMenuData(content.id, totalData, menuArr),function(v, dataIndex){
                ul.append(v);
                // return v;
            });
            liContent.append(ul);
           

        }
        menuArr[content.obj.sort] = liContent;
        otherMenuContent[content.id] = liContent;
        otherMenuArr.push(liContent);
        // console.log(content.id, liContent);  

    });
    delete totalData[otherLayerDataIndex];
    return otherMenuArr;
}