  //點擊事件
  $(function() {
	$("#plusItem").click(function(){
		onClickNewMaterial();
	});
  });
  //跳出頁面
function onClickNewMaterial(){
	$( "#dialog" ).remove();//預防有此ID 先清除
	$( '<div>' ).prop("id","dialog").appendTo("body");//新增一個ID到BODY
	$.get("new-material.html", function(page){//取得位置並顯示到ID裡
		$(page).appendTo("#dialog" );
		$( "#dialog" ).dialog({//跳出視窗的設定
			width: 600,
			draggable: true,
			modal: true,
			resizable: false,//鎖定視窗

		});
		//叫單位
		selectEvent("Unit/getUnitList" , {typeID_a:0} , "unit" , "unitID");

		selectEvent("Eng/GetEngSingleList" , {type:"b"} , "name" , "engID_b");
		$(".ui-dialog-titlebar").hide();//隱藏原有的TITLEBAR
	});
		
}
var APIURL="http://211.21.170.18:8080/waDataBase/api/";

function selectEvent(apiMethod , data , dataIndex , unitID){
	$.ajax({
	        url: APIURL+apiMethod,
	        type:"GET",
	        data:data,  
	        dataType:"JSON",

	        success: function(rs){
	                
	                showMethod(rs["data"], dataIndex , unitID);
	        },
	        error:function(xhr, ajaxOptions, thrownError){ 
	        }
	});
}
function showMethod(Data , dataIndex , unitID){
		//var unitStyles=$.parseHTML(unitData);
		//$(unitStyles).appendTo("#unitID");
		$.each(Data ,function(Key , Val){
			// console.log(unitKey , unitVal);
			selectOptionPut(unitID,Val["uid"],Val[dataIndex]);
		});

}
function dataSave(){
	var materialStr = getUserInput("warnPage");
	
	$.ajax({
	        url: APIURL+"Materiel/setMaterielInsert",
	        type:"GET",
	        data:materialStr,  
	        dataType:"JSON",

	        success: function(rs){
	                
	                closeWarnPage();
	                getList(1,true);
	                console.log(rs);
	        },
	        error:function(xhr, ajaxOptions, thrownError){ 
	        }
	});
}