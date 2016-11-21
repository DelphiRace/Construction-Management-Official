function dataChart(option){
    if(typeof option.data == "undefined"){
        return;
    }
    var object = "#"+option.item;
    $(object).empty();
    var objWidth = $(object).width();
    var objHeight = $(object).height();
    if(objWidth == 0){
        objWidth = 300;
    }

    if(objHeight == 0){
        objHeight = 300;
    }

    // var data = [['1月',2000,1500,180],['2月',1920,400,20],['3月',120,3000,300],['4月',1289,1050,70],['5月',700,1000,0],['5月',877,150,16]];
    var data = option.data;
    // console.log(max);
    var color = [];
    if(typeof option.color == "undefined"){
        for(var i = 0; i< data[1].length; i++){
            color.push( getRandomColor() );
        }
    }else{
        if(color.length < data[1].length){
            for(var i = 0; i<color.length; i++){
                color.push( getRandomColor() );
            } 
        }else{
            color = option.color;
        }
    }
    // console.log(color);

    //取得最大數
    var maxVal = getHighestVal(data);

    var roots = d3.select(object);
    var svg = roots.append("svg");
    svg.attr({
        width: objWidth,
        height: objHeight
    });
    // 相關設定
    var margin = {left: 15, right: 15, top: 10, bottom: 10};
    // 預留空間-寬(不要碰到邊框)
    var objMarginWidth = objWidth - margin.left - margin.right;
    // 預留空間-高(不要碰到邊框)
    var objMarginHeight = objHeight - margin.top - margin.bottom;
    // 計算整體寬度的等分
    var dataLength = data.length;
    var contentWidth = objMarginWidth/dataLength;
    // 計算整體寬度的等分-結束

    //預定線粗
    var lineWidth = 1.5;
    //預定點大小
    var pointWidth = lineWidth * 2 + 2;
    // console.log(option.title);
    // var x = d3.scale.ordinal().range([0, objMarginWidth]).rangeRoundBands([0, objMarginWidth], .1);
    // var x = d3.scale.ordinal().rangeRoundBands([0, objMarginWidth], .1);
    var x = d3.scale.ordinal().rangeRoundBands([0, objMarginWidth], .1);
    // console.log(x.domain);
    x.domain(data.map(function(d,i){ 
            // return option.title[i]; 
            return d[0];
        })
    );
    var y = d3.scale.linear().range([objMarginHeight, 0]).domain([0, maxVal]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(1).ticks(10).tickFormat("");
    var yAxis = d3.svg.axis().scale(y).orient('left').tickSize(1);
    var t = null;
    var yAxisGroup = null,
    xAxisGroup = null;
    t = svg.transition().duration(1000);

    // y ticks and labels
    if (!yAxisGroup) {
        yAxisGroup = svg.append('svg:g')
            .attr('class', 'yTick')
            .attr("transform", "translate(35,"+margin.bottom+")")
            .call(yAxis).selectAll('text')
            .attr({
                'fill':'#000',
                'stroke':'none',
            }).style({
                'font-size':'11px'
            });
    }else {
        t.select('.yTick').call(yAxis);
    }

    // x ticks and labels
    if (!xAxisGroup) {
        // console.log(xAxis);
        xAxisGroup = svg.append('svg:g')
            .attr('class', 'xTick')
            .attr("transform", "translate(35,"+(objMarginHeight)+")")
            .call(xAxis);
    }else {
        t.select('.xTick').call(xAxis);
    }

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
      // svg.append('g')
      //  .call(axisXGrid)
      //  .attr({
      //   'fill':'none',
      //   'stroke':'rgba(0,0,0,.1)',
      //   'transform':'translate(35,'+(objMarginHeight)+')' 
      //  });

      svg.append('g')
       .call(axisYGrid)
       .attr({
        'fill':'none',
        'stroke':'rgba(0,0,0,.1)',
        'transform':'translate(35,'+margin.bottom+')'
       });

    // 線
    var line = d3.svg.line()
    // .interpolate("basis")
    .x(function(d,i){
        return getX((i+1),contentWidth,margin.left);
        // return x(d[0]);
    })
    .y(function(d){
        // console.log(d,i);
        return getY(d,maxVal,objMarginHeight,margin.top);
    });

    for(var i = 0; i < (data[1].length); i++){
        var polyline = svg.append("g").append("path");
        var tmpArr = [];
        $.each(data,function(index,content){
            // console.log(index,content);
            tmpArr.push(content[i]);
        });
        // console.log(tmpArr);

        polyline.attr({
            "d":line(tmpArr),
            transform: "translate(20,0)"
        }).style({
            fill: "none",
            // stroke: "#ffaa00",
            stroke: color[i],
            "stroke-width": lineWidth,
            "stroke-opacity": 1
        });
    }
    // 線結束

    // 點
    var pointArr = [];
    $.each(data,function(i,content){
        var tmpArr = $.grep(content, function(d,i){
            // if(i > 0){
                if(d == null){
                    d = 0;
                }
                return d.toString();
            // }
        });

        pointArr = $.merge(pointArr, tmpArr);
    });
    // console.log(pointArr);
    var circle = svg.selectAll("circle").data(pointArr);
    var circleSet = circle.enter().append("circle");
    circle.exit().remove();

    circleSet.attr({
        cx: function(d,i) {
            var thisWidthVal = Math.ceil((i+1)/(data[1].length));
            // console.log(d);
            return getX(thisWidthVal,contentWidth,margin.left);
        },
        cy: function(d,i) {
            
            return getY(d,maxVal,objMarginHeight, margin.top);
        },
        r: pointWidth,
        transform: "translate(20,0)"
    }).style({
        // fill: "#ffaa00",
        fill: function(d,i){
            var colorIndex = i % (data[1].length);
            return color[colorIndex];
        },
        "fill-opacity": 1,
        // stroke: "#ffffff"
    });
    // 點結束


    // 
    // svg.exit().remove(); /* 刪除「沒有資料可配對的物件」*/

    // roots.text(function(d,i) {
    //     return i + " / " + d[0];
    // });
    // svg.style("height", "20px");
    // svg.style("background", "red");
    // svg.style("margin", "5px");
    // polyline.style("width", function(d,i) {
    //     return (d[1] * 10)+"px";
    // });
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
    var thisVal;
    var max = 0;
    $.each(data, function (i,v){
        if(pointIndex){
            thisVal = v[index];
        }else{
            var processArr = $.grep(v,function (el) { 
                // console.log(typeof el);
                if(typeof el == "number"){
                    return el;
                }
            });
            // console.log(processArr);
            thisVal = Math.max.apply(Math, processArr);
            // console.log(thisVal);

        }
        max = (max < thisVal) ? thisVal : max;
        // console.log(max);
    }); 
    // console.log(max);
    return max; 
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