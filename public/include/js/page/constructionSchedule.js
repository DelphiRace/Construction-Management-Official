$(function(){   

    //第二種，自己抓取ＤＡＴＡ處理後交由ＡＰＩ繪製
    var dataSample = getChartsData();
    //console.log(dataSample);
    var options = {
      drawItemID: 'lineCharts',
      unitTitle: dataSample.ChartHead.ChartAxisUnit.AxisY,
      //bottomTitle: dataSample.ChartHead.ChartAxisUnit.AxisX,
      chartsHelp: "right", //top,left,right,bottom; 預設為bottom
      drawType:"LineChart", //drawType 可使用 ColumnChart、LineChart、TimeLine
      annotation: true //default是false
    };
    var setTitleArr = ["Data",dataSample.ChartLine.PlanLine,dataSample.ChartLine.RealLine];
    var dataArr = processData(setTitleArr,dataSample.ChartContent);
    createChart(options,dataArr);
    //結束第二種

    //甘特圖
    var dataSample = getGanttChartsData();
    var setTitleArr = ["Name","sDate","eDate"];
    var dataArr = processGanttData(setTitleArr,dataSample.ChartContent);
    var options = {
      drawItemID: 'ganttCharts',
      drawType:"TimeLine", 
      ganttColor: dataArr.colors
    };
    createChart(options,dataArr.reData);
    //結束甘特圖
});

function getChartsData(){
	var chartsData;

	    $.ajax({
	    url: configObject.WebAPI+'/Construction/wsConstruction.asmx/GetScheduleChart_JSON',
	    type: "GET",
	    dataType: "xml",
	    async: false,
	    success: function(rs){
	        chartsData = $.parseJSON($(rs).find("string").text());
	    }
	});
	return chartsData;
}

	//甘特圖
function getGanttChartsData(){
	var chartsData;
	$.ajax({
	    url: configObject.WebAPI+'/Construction/wsConstruction.asmx/GetGanttChart_JSON',
	    type: "GET",
	    dataType: "xml",
	    async: false,
	    success: function(rs){
	        chartsData = $.parseJSON($(rs).find("string").text());
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