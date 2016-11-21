

function getChartsData(){
	var chartsData;

	$.ajax({
	    //url: configObject.chartsWS+'/Construction/wsConstruction.asmx/GetScheduleChart_JSON',
	    url: configObject.WebAPI + '/Construction/wsConstruction.asmx/GetScheduleChart_JSON',
	    type: "GET",
	    dataType: "xml",
	    async: false,
	    success: function(rs){
	        chartsData = processJsonInXml(rs);
	    }
	});
	//sendRequest("post",'http://211.21.170.17:8080/Construction/wsConstruction.asmx/GetScheduleChart_JSON',{},"","xml","getResponses");
	return chartsData;
}

function getResponses(rsXml){
	var content = processJsonInXml(rsXml);
	console.log(content);
}

	//甘特圖
function getGanttChartsData(){
	var chartsData;
	$.ajax({
	    //url: configObject.chartsWS+'/Construction/wsConstruction.asmx/GetGanttChart_JSON',
	    url: configObject.WebAPI + '/Construction/wsConstruction.asmx/GetGanttChart_JSON',
	    type: "GET",
	    dataType: "xml",
	    async: false,
	    success: function(rs){
	        chartsData = processJsonInXml(rs);
	    }
	});
	//console.log(chartsData);
	return chartsData;
}

function processData(titleArray,data){
	var reData = [];
	reData[0] = titleArray;
	$.each(data,function(i,v){
	  //console.log(i,v);
	  reData[reData.length] = [v.sDate,v.dbPlan,v.dbReal];
	});
	return reData;
}

function processGanttData(titleArray,data){
	var reData = [];
	reData[0] = titleArray;
	var colorObject = {},colorArr = [];
	$.each(data,function(i,v){
	  var vObject = v.PlanDates;
	  $.each(vObject,function(ai,av){
	    reData[reData.length] = [av.Name,new Date(av.sDate+" 0:00"),new Date(av.sDate+" 23:59")];
	    
	    if(typeof colorObject[av.Name] == 'undefined'){
	      colorArr[colorArr.length] = (av.ChkType)?"#DA3636":"#2BD834";
	    }
	    colorObject[av.Name] = true;
	  });
	  if(v.RealDates && typeof v.RealDates!='undefined'){
	    var vObject = v.RealDates;
	    $.each(vObject,function(ai,av){
	      reData[reData.length] = [av.Name,new Date(av.sDate+" 0:00"),new Date(av.sDate+" 23:59")];

	      if(typeof colorObject[av.Name] == 'undefined'){
	        colorArr[colorArr.length] = (av.ChkType)?"#DA3636":"#2BD834";
	      }
	      colorObject[av.Name] = true;
	    });
	  }
	  
	});
	var totleObject = {};
	totleObject.reData = reData;
	totleObject.colors = colorArr;
	return totleObject;
}