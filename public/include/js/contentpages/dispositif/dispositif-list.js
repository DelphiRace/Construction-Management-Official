// 起始筆數
var start = 0;
// 每頁顯示筆數
var row = 10;
$(function(){
	getContructList();
	//$.get().done();
});

function addNewContent(modifyData, uid){
	if(modifyData == undefined){
		modifyData = {};
	}
	// {
	// 	page:{},
	// 	itemValue:{},
	// 	start: int or string,
	// 	putArea: string,
	//	startHide: string,
	//	backAction: function,
	//	nextBtnAction: {
	// 		a: function,
	// 		....
	// 	},
	//	breadcrumbs:{
	//		mean:{
	// 			name1: "mean value",
	// 			name2: "mean value",
	//		},
	// 		cancelClick:"name1,name2, ...", //string
	// 		select: "name1" //default first object name
	// 	}
	// }
	var pageObject = {
		page:{
			numbers: "contract/numbers",
			contract_name: "contract/contract-name",
			dispositif_people: "contract/dispositif-people",
			units: "contract/units",
			payment: "contract/payment",
			penalty: "contract/penalty"
		},
		modifyData: modifyData,
		putArea: "modifyArea",
		startHide: "mainContent",
		dataClass: "userInput",
		selectData: {
			dispositif_people:{
				partyA: function( object ){
					var sendObj = {
						api: "V201604/Su/waSuSupply/api/ctrlSuSupply/GetData_SuSupply",
						data: {}
					}
					$.getJSON(wrsUrl,sendObj,function(rs){
						// console.log(rs);
						if(rs.status){
							$.each(rs.data,function(index, content){
								selectOptionPut( $(object), content.uid, content.name);
							});
							if(modifyData.partyA != undefined){
								$(object).val(modifyData.partyA);
							}
							// console.log($(object));
						}
					});
				}
			}
		},
		dataOption:{
			dateFormat: "yy-mm-dd",
			onSelect: function(dateText, inst) {
				var dateTmp = dateText.split("-");
				var dateStr = "民國"+(parseInt(dateTmp[0]) - 1911) + "年"+dateTmp[1]+"月"+dateTmp[2]+"日";
				$(this).val(dateStr);
			}
		},
		backAction:function(){
			
		},
		nextBtnAction:{
			numbers: function(nowItem,nextItem){
				
				if(nextItem != null){
					nowItem.hide();
					itemFade( nextItem ,true);
				}
			},
			contract_name: function(nowItem,nextItem){
				
				if(nextItem != null){
					nowItem.hide();
					itemFade( nextItem ,true);
				}
			},
			dispositif_people: function(nowItem,nextItem){
				
				if(nextItem != null){
					nowItem.hide();
					itemFade( nextItem ,true);
				}
				
			},
			units: function(nowItem,nextItem){
				
				if(nextItem != null){
					nowItem.hide();
					itemFade( nextItem ,true);
				}
				
			},
			payment: function(nowItem,nextItem){
				
				if(nextItem != null){
					nowItem.hide();
					itemFade( nextItem ,true);
				}
				
			},
			penalty: function(nowItem,nextItem){
				
				if(nextItem != null){
					nowItem.hide();
					itemFade( nextItem ,true);
				}
				console.log("end");
				
			},
		},
		preBtnAction:{
			numbers: function(nowItem,preItem){
				
				if(preItem != null){
					nowItem.hide();
					itemFade( preItem ,true);
				}
			},
			contract_name: function(nowItem,preItem){
				
				if(preItem != null){
					nowItem.hide();
					itemFade( preItem ,true);
				}
			},
			dispositif_people: function(nowItem,preItem){
				
				if(preItem != null){
					nowItem.hide();
					itemFade( preItem ,true);
				}
				
			},
			units: function(nowItem,preItem){
				
				if(preItem != null){
					nowItem.hide();
					itemFade( preItem ,true);
				}
				
			},
			payment: function(nowItem,preItem){
				
				if(preItem != null){
					nowItem.hide();
					itemFade( preItem ,true);
				}
				
			},
			penalty: function(nowItem,preItem){
				
				if(preItem != null){
					nowItem.hide();
					itemFade( preItem ,true);
				}
				console.log("end");
				
			},
		},
		finishBtnAction: function( data, finishClose ){
			data.partyB = 1;
			var isNull = false;
			$.each(data,function(i,content){
				if($.trim(content) == ""){
					isNull = true;
				}
			});
			if(!isNull){
				// console.log(uid);
				if(uid == undefined){
					insertDispositif(data);
				}else{
					// console.log("T");
					updateDispositif(data, uid);
				}
				// getContructList();
				finishClose();
			}
			// console.log(data);
		},
		breadcrumbs:{
			mean:{
				numbers: "新增契約編號",
				contract_name: "工程資料",
				dispositif_people: "契約相關人員",
				units: "相關單位",
				payment: "付款條件",
				penalty: "罰則"
			},
			//cancelClick:"numbers"
		}
	};
	elfguide(pageObject);
}

function getContructList(){
	// 先清空
	$("#contentList").empty();
	loader($("#contentList"));
	var sendObj = {
	    api: mainDocAPI,
	    data:{
	      start: start,
	      count: row
	    }
	};
	$.getJSON(wrsUrl,sendObj,function(rs){
		$("#contentList").empty();
		if(rs.status){
			var option = {
				styleKind:"list",
				style:"1grid-modify"
			};
			getStyle(option,function(listStyle){
				$.each(rs.data,function(index, content){
					var listStyleObj = $.parseHTML(listStyle);
					$(listStyleObj).addClass("dataContent");
					$(listStyleObj).find(".list-items").eq(0).text(content.name);
					$(listStyleObj).appendTo($("#contentList"));
					// 編輯事件
					$(listStyleObj).find(".fa-pencil-square-o").click(function(){
						var sendObj = {
							api: "waDataBase/api/Main/getMainContent",
							data:{
								uid: content.uid 
							}
						}
						// console.log(sendObj);
						$.getJSON(wrsUrl, sendObj, function(mContent){
							if(mContent.status){
								addNewContent(mContent.data[0],content.uid);
							}
							console.log(mContent);
						});
					});
					// 刪除事件
					$(listStyleObj).find(".fa-trash-o").click(function(){

					});
				});
				$("#contentList").find(".dataContent").last().removeClass("list-items-bottom");
			});
		}else{
			putEmptyInfo( $("#contentList") );
		}
		// console.log(rs);
	}).fail(function(){
		putEmptyInfo( $("#contentList") );
	});

	
	// putEmptyInfo( $("#contentList") );
}

function insertDispositif(data){
	var sendObj = {
		api: "waDataBase/api/Main/setMainInsert",
		data:data
	}
	// console.log(sendObj,JSON.stringify(data));
	// return;
	$.post(wrsUrl, sendObj,function(rs){
		// 成功之後，執行畫面重整
		rs = $.parseJSON(rs);
		if(rs.status){
			getContructList();
		}
		console.log(rs);
	});

	// $.post("http://211.21.170.18:8080/waDataBase/api/Main/setMainInsert",data,function(rs){
	// 	console.log(rs);
	// });
}

function updateDispositif(data, uid){
	data.uid = uid;
	var sendObj = {
		api: "waDataBase/api/Main/setMainModify",
		data:data
	}
	$.post(wrsUrl, sendObj,function(rs){
		// console.log(rs);
		// 成功之後，執行畫面重整
		rs = $.parseJSON(rs);
		if(rs.status){
			getContructList();
		}
		
	});
	
}