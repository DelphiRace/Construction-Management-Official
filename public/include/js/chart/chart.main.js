function createChart(option){
    // 整理資料
    var data = processData2ChartData(option.data, option.title);
    
    // 最大數設定
    var valMaxAndMin = getHighestVal(data);
    var maxVal = valMaxAndMin.max;
    if(typeof option.maxVal == "undefined" || option.maxVal < maxVal){
        option.maxVal = maxVal;
    }

    // 最小數設定
    var minVal = valMaxAndMin.min;
    if(typeof option.min == "undefined" || option.min < min){
        option.min = minVal;
    }

    // 整理資料 - 結束
    
    // 取得物件
    var object = "#"+option.item;
    // 清空
    $(object).empty();

    // 相關設定

    // 擷取物件寬高
    var objWidth = $(object).width();
    var objHeight = $(object).height();
    if(objWidth == 0){
        objWidth = 300;
    }

    if(objHeight == 0){
        objHeight = 300;
    }
    
    var margin = {left: 15, right: 15, top: 10, bottom: 10};
    
    if(typeof option.scroll == "undefined"){
        option.scroll = false;
    }

    // 相關設定 - 結束

    // 創建物件
    var roots = d3.select(object);

    var contentDiv = roots.append("div")
    .attr("class","contents");
    var contentGtag;
    // 設定捲動
    if(option.scroll){
        // 相關寬度設定
        var scrollWidthView = $(object).css("min-Width").replace("px","");
        if(scrollWidthView == 0){
            scrollWidthView = 300;
        }
        // console.log(scrollWidthView);
        contentDiv.style({
            "width": scrollWidthView+"px",
            "overflow": "scroll"
        });

        // 設定要擺入捲動視角的Ｙ軸標籤
        contentGtag = roots.append("div")
        .attr("class","y_axis_viewer")
        .style({
            "position": "absolute",
            "width": "100px",
        })
        .append("svg")
        .attr({
            "width": "1",
            height: objHeight
        }).style({
            "padding-left": "100%",
            "padding-top": "10%",
        });
        // 設定要擺入捲動視角的Ｙ軸標籤 - 結束
    }

    // 設定SVG
    var svg = contentDiv.append("svg");

    svg.attr({
        width: objWidth,
        height: objHeight
    }).style({
        "padding-left": "10%",
        "padding-right": "10%",
        "padding-top": "5%",
        "padding-bottom": "5%",
    });
    

    // 顯示資料視窗
    roots.append("div")
    .attr("class","infobox")
    .style({
        "display": "none",
        "border": "2px solid steelblue",
        "border-radius": "4px",
        "box-shadow": "#333333 0px 0px 10px",
        "margin": "180px auto",
        "padding": "5px 10px",
        "background": "rgba(255, 255, 255, 0.8)",
        "position": "absolute",
        "top": "0px",
        "left": "0px",
        "z-index": "10500",
        "font-weight": "bold"
    });

    option.chartCount = data.length;
    option.setAxis = false;
    option.roots = roots;
    option.objWidth = objWidth;
    option.objHeight = objHeight;
    option.margin = margin;
    option.object = object;
    // console.log(data);
    for(var i = 0; i< data.length; i++){
        if(i > 0 && option.setAxis == false){
            option.setAxis = true;
        }
        option.data = data[i];
        option.colorIndex = i;

        InitChart(option,svg, contentGtag);
    }
}

function InitChart(option,svg, contentGtag){
    if(typeof option.data == "undefined"){
        return;
    }
    // 資料設定
    var objWidth = option.objWidth;
    var objHeight = option.objHeight;

    // var data = [['1月',2000,1500,180],['2月',1920,400,20],['3月',120,3000,300],['4月',1289,1050,70],['5月',700,1000,0],['5月',877,150,16]];
    var data = option.data;
    // console.log(max);
    var color = [];
    if(typeof option.color == "undefined"){
        for(var i = 0; i< option.chartCount; i++){
            color.push( getRandomColor() );
        }
    }else{
        if(option.color.length < option.chartCount){
            for(var i = 0; i < option.chartCount - color.length; i++){
                color.push( getRandomColor() );
            }
        }else{
            color = option.color;
        }
    }
    // console.log(color);
    // 相關設定
    var margin = option.margin;
    // 預留空間-寬(不要碰到邊框)
    var objMarginWidth = objWidth - margin.left - margin.right;
    // 預留空間-高(不要碰到邊框)
    var objMarginHeight = objHeight - margin.top - margin.bottom;
    // 計算整體寬度的等分
    var dataLength = data.length;
    var contentWidth = objMarginWidth/dataLength;
    // 計算整體寬度的等分-結束

    //取得最大數
    var maxVal = option.maxVal;

    //取得最小數
    var minVal = option.min;

    //預定線粗
    var lineWidth = 1.5;
    //預定點大小
    var pointWidth = lineWidth * 2 + 2;
    var rangStart = .6;

    var chartPadding = 14;
    // console.log(chartPadding);
    // 設定結束
    

    // var x = d3.scale.ordinal().rangeRoundBands([0, objMarginWidth], rangStart);
    var x = d3.scale.ordinal().rangePoints([0, objMarginWidth]);

    var y = d3.scale.linear().rangeRound([objMarginHeight, 0]);

    x.domain(data.map(function(d,i){
        return d[0]; 
    }));
    y.domain([ minVal , maxVal ]);

    var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom").tickSize(1);

    var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left").tickSize(1);

    var lineGen = d3.svg.line()
    // .interpolate("basis")
    .x(function(d) {
        // return x(d[0])+ margin.left;
        // console.log(x(d[0]));
        return x(d[0]);
    })
    .y(function(d) {
        return y(d[1]);
    });

    
    //設定座標
    if(option.setAxis == false){
        // 座標與相關內容
        // x 軸
        svg.append("svg:g")
            .attr("class", "x_axis")
            .attr("transform", "translate(0," + objMarginHeight + ")")
            .call(xAxis)
            .selectAll('text')
            .attr({
                'fill':'#000',
                'stroke':'none',
                'y': 12
            })
            .style({
                // 'font-size':'15px',
                // "text-anchor": "end"
            });;

        // svg.append("svg:g")
        //     .attr("class", "y axis")
        //     // .attr("transform", "translate(" + (margin.left) + ",0)")
        //     .call(yAxis)
        //     .append("text")
        //     .attr("transform", "rotate(-90)")
        //     .attr("y", 6)
        //     .attr("dy", ".71em")
        //     .style("text-anchor", "end");
            // .text("ETFE");

        // Ｙ軸
        svg.append('svg:g')
            .attr('class', "y_axis")
            .call(yAxis)
            .selectAll('text')
            .attr({
                'fill':'#000',
                'stroke':'none',
                'x': "-8"
            }).style({
                'font-size':'12px',
                "text-anchor": "end"
            });
        // 座標與相關內容 - 結束

        // 相關輔助線  
        var axisXGrid = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(10)
          .tickFormat("")
          .tickSize(-objMarginHeight,0);

        var axisYGrid = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10)
          .tickFormat("")
          .tickSize(-objMarginWidth,0);

        // Axis Grid line
        svg.append('g')
           .call(axisXGrid)
           .attr({
            'fill':'none',
            'stroke':'rgba(0,0,0,.1)',
            'transform':"translate(0," + objMarginHeight + ")"
           });

        svg.append('g')
           .call(axisYGrid)
           .attr({
            'fill':'none',
            'stroke':'rgba(0,0,0,.1)',
           });
        // 相關輔助線 - 結束

        // 捲動視角
        if(option.scroll){
            contentGtag.append('svg:g')
                .attr('class', "y_axis")
                .call(yAxis)
                .selectAll('text')
                .attr({
                    'fill':'#000',
                    'stroke':'none',
                    'x': "-8"
                }).style({
                    'font-size':'12px',
                    "text-anchor": "end"
                });
            var offset =  $(option.object).find(".y_axis").offset();
            $(option.object).find(".y_axis_viewer").css({
                "top": Math.floor(offset.top) - 3 +"px",
                "left": Math.floor(offset.left) - 62 +"px",
            });
        }

       
    }
    // 設定座標結束

    // 線開始
    var items = svg.append("svg:g").attr('class', "chartItem");
    items.append('path')
        .attr('d', lineGen(data))
        .attr('stroke', color[option.colorIndex])
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    // 線結束

    // 點
    $.each(data,function(i,v){
        var circle = items.append("circle");
        circle.attr({
            cx: function() {
                // console.log(yAxis);
                return x(v[0]);
            },
            cy: function() {
                return y(v[1]);
            },
            r: pointWidth,
        }).style({
            // fill: "#ffaa00",
            fill: function(){
                return color[option.colorIndex];
            },
            "fill-opacity": 1,
            // stroke: "#ffffff"
        })
        .on("mouseover", function() { 
            // console.log(v[1]);
            showData(this, v[1], option.roots);
        })
        .on("mouseout", function(){ hideData(option.roots); });;
    });
    // 點結束   
}

function setOffset(main, trans){
    return main - trans;
}

function getX(val,blockWidth,marginLeft){
    var itemWidth = marginLeft;
    if(val > 1){
        itemWidth = blockWidth*val;
    }
    return itemWidth;
}

function getY(val,maxVal,height,marginTop){

    var itemHeight = 0;
    if(val > 0){
        itemHeight = height - ((height*val/maxVal) - marginTop);
    }else{
        itemHeight = height + marginTop;
    }
    return itemHeight;
}

function getHighestVal(data, index){
    var pointIndex = true;
    if(typeof index == "undefined"){
        pointIndex = false;
    }
    var thisVal,thisMin;
    var min;
    var max = 0;
    $.each(data, function (i,v){
        if(pointIndex){
            thisVal = v[index];
        }else{
            var processArr = []
            $.each(v, function(i, content){
                processArr.push(content[1]);
            });
            thisVal = Math.max.apply(Math, processArr);
            thisMin = Math.min.apply(Math, processArr);
        }
        max = (max < thisVal) ? thisVal : max;
        if( min == undefined){
            min = max;
        }
        min = (min > thisMin) ? thisMin : min;
        // console.log(max);
    }); 
    // console.log(max);
    return {max:max,min:min}; 
} 

// 亂數顏色
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
// 處理圖表相關陣列資料
function processData2ChartData(data, title){
    var dataArr = [];
    if(data[0].length > 1){
        for(var i = 0; i < data[0].length; i++){
          dataArr.push(processDataArray(data, i, title));
        }
    }
    return dataArr;
}

function processDataArray(data, processIndex, title){
  var dataArr = [];
  $.each(data,function(index,value){
    var tmpArr = $.grep(value,function(d,i){
      if(i == processIndex){
        return d.toString();
      }
    });
    tmpArr.splice(0,0,title[index]);
    dataArr.push(tmpArr);

  });
  return dataArr;
}

// 處理圖表相關陣列資料 - 結束

// 顯示點的相對應資訊
function showData(obj, d, roots) {

    var coord = d3.mouse(obj);
    var infobox = roots.select(".infobox");
    // console.log(infobox);
    // now we just position the infobox roughly where our mouse is
    infobox.style("left", (coord[0]) + 20 + "px" );
    infobox.style("top", (coord[1] - 175) + "px");
    // $(".infobox").html(d);
    roots.select(".infobox").text(d);
    roots.select(".infobox").style("display","block");
}

function hideData(roots) {
    // console.log(roots);
    roots.select(".infobox").style("display","none");
}
// 顯示點的相對應資訊 - 結束
