
var chartData = null;
var pageChartObject={};
//載入折線圖,長條圖
google.load('visualization', '1.1', {packages: ['corechart','bar','timeline']});


function createChart(options,processArray){
    if(typeof processArray == 'undefined' && typeof options.url != 'undefined'){
        $.ajax({
            url: options.url,
            type: options.urlMethod,
            data: options.sendData,
            dataType: "JSON",
            async: false,
            success: function(rs){
                if(typeof options.resultIndex != 'undefined' && options.resultIndex){
                    if(typeof rs[options.resultIndex] != 'undefined'){
                        rs = rs[options.resultIndex];
                        if(rs.length > 0){
                            setDraw(options,rs);
                        }else{
                            $("#"+options.drawItemID).html("Chart Data is Empty!");
                        }
                    }else{
                        resetChart(options.drawItemID);
                        $("#"+options.drawItemID).html("Chart Data is Empty!");
                    }
                }else{
                    resetChart(options.drawItemID);
                    $("#"+options.drawItemID).html("Chart Data is Empty!");
                }
            }
        });
    }else{
        setDraw(options,processArray);
    }
    
}
//*****這裡是處理ＢＡＲ的部分
function resetData(chartData,options){
    var titleArr = [];
    //底部項目名稱
    titleArr[0] = options.bottomTitle;
    //options.annotation於圖表中顯示各方數字，預設是false
    if(typeof options.annotation == "undefined"){
        options.annotation = false;
    }
    
    var contentArr = [];
    //對應的ＩＮＤＥＸ暫存陣列
    var worksidIndexArr = [];
    //內容數據
    var tmpContentTitleArr = [], tmpContentArr = [];
    $.each(chartData,function(i,v){
        //console.log(i,v);
        if(!checkInArray(v.supply_name,titleArr)){
            worksidIndexArr[v.suid] = titleArr.length;
            titleArr[titleArr.length] = v.supply_name;
        }
        if(!checkInArray(v.work_type,tmpContentTitleArr)){
            tmpContentArr[v.worksid] = [];
            tmpContentArr[v.worksid][0] = v.work_type
            tmpContentTitleArr[tmpContentTitleArr.length] = v.work_type;
        }
        tmpContentArr[v.worksid][putData(worksidIndexArr,v.suid)] = parseInt(v.w_count);
    });
    //console.log(chartData,titleArr,tmpContentArr);
    //開始組合
    var relData = [], totalItem = 0;
    relData[0] = titleArr;
    totalItem = titleArr.length;
    //圖片上顯示的數字，是true才補
    if(options.annotation){
        titleArr[titleArr.length] = { role: 'annotation' };
    }
    for(var worksid in tmpContentArr){
        /*if(tmpContentArr[worksid].length != totalItem){
            
        }*/
        //將不對稱的部份補上0
        //加總內容
        var tmpCount = 0;
        for(i=1;i <= totalItem-1;i++){
            if(typeof tmpContentArr[worksid][i] == "undefined"){
                tmpContentArr[worksid][i] = 0;
            }
            tmpCount += tmpContentArr[worksid][i];
        }
        //圖片上顯示的數字，是true才顯示，永遠放在最後一個
        if(options.annotation){
            if(tmpContentArr[worksid][tmpContentArr[worksid].length-1] == 0){
                tmpContentArr[worksid][tmpContentArr[worksid].length-1] = 0.0001;
            }
            tmpContentArr[worksid][tmpContentArr[worksid].length] = tmpCount;
        }
        relData[relData.length] = tmpContentArr[worksid];
    }
    return relData;
}

function checkInArray(data,Arr){
    for(var key in Arr){
        if(Arr[key] == data){
            return true;
        }
    }
    return false;
}

function putData(worksidIndexArr,suid){
    for(var key in worksidIndexArr){
        if(key == parseInt(suid)){
            return parseInt(worksidIndexArr[key]);
        }
    }
    return false;
}

//＊＊＊＊＊bar的部分結束

function setDraw(options,dataArr){
    var resetDataArr;
    if(options.drawType == "ColumnChart"){
        resetDataArr = resetData(dataArr,options);
    }else{
        resetDataArr = dataArr;
    }
    drawChart(options,resetDataArr);
}

function drawChart(options,dataArr) {
    var drawAreaWidth = $("#"+options.drawItemID).width(),
    drawAreaHeight = $("#"+options.drawItemID).height();
    
    if(drawAreaWidth == 0){
        drawAreaWidth = null;
    }

    if(drawAreaHeight == 0){
        drawAreaHeight = null;
    }
    //console.log(drawAreaWidth);
    var chart, 
    data = google.visualization.arrayToDataTable(dataArr),
    chartOptions = {
        //curveType: 'function',
        legend: { position: 'bottom' },
        width: drawAreaWidth,
        height: drawAreaHeight,
        pointSize: 4,
        //pointsVisible: true,
        hAxis:{},
        vAxis: {
          title: options.unitTitle
        },
        annotations:{
           // startup: true,
            alwaysOutside: true
        },
        //timeline: { showRowLabels: false },
       // curveType: 'function',
        legend: { position: 'bottom' }
    },
    drawItemID = document.getElementById(options.drawItemID);

    if(typeof options.bottomTitle != 'undefined'){
       chartOptions.hAxis.title = options.bottomTitle;
    }

    if(typeof options.chartsHelp != 'undefined'){
       chartOptions.legend.position = options.chartsHelp;
    }

    if(typeof options.ganttColor != 'undefined'){
       chartOptions.colors = options.ganttColor;
    }

    switch(options.drawType){
        case "LineChart":
            chart = new google.visualization.LineChart(drawItemID);
        break;
        case "ColumnChart":
            chart = new google.visualization.ColumnChart(drawItemID);
            chartOptions.isStacked = true;
        break;
        case "TimeLine":
            chart = new google.visualization.Timeline(drawItemID);
            chartOptions.avoidOverlappingGridLines=false;
        break;
        default:
            chart = new google.visualization.ColumnChart(drawItemID);
        break;
    }
    chart.draw(data, chartOptions);
    pageChartObject[options.drawItemID] = chart;
}

function resetChart(itemID){
    if(typeof pageChartObject[itemID] != 'undefined'){
        pageChartObject[itemID].clearChart();
        delete pageChartObject[itemID];
    }
}
