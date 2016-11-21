// option = {
//     areaID:"test",
//     data:[
//         { "letter":"A", "frequency":0.8167 },
//         // { "letter":"B", "frequency":0.01492 },
//         // { "letter":"D", "frequency":0.01492 },
//         // { "letter":"E", "frequency":0.01492 },
//         // { "letter":"F", "frequency":0.01492 },
//         // { "letter":"G", "frequency":0.01492 },
//         // { "letter":"H", "frequency":0.01492 },
//         // { "letter":"C", "frequency":0.01492 }
//     ]
// };

function barChart(option){
    var areaID = option.areaID;
    var data = option.data;
    // console.log(option);
    var margin = {top: 40, right: 20, bottom: 30, left: 40},
        width = parseInt(d3.select("#"+areaID).style("width"), 10) - margin.left - margin.right,
        height = parseInt(d3.select("#"+areaID).style("height"), 10) - margin.top - margin.bottom;
        $("#"+areaID).empty();
    // console.log(width);
    // var minVal = d3.min(data, function(d) { return d.frequency; });

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .7);

    var y = d3.scale.linear()
          .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(Math.max(height/50, 2));

    var svg = d3.select("#"+areaID).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var maxVal = d3.max(data, function(d) { return d.frequency; });
    // maxVal = maxVal + Math.ceil(maxVal/10);
    // console.log(maxVal);
    x.domain(
        data.map(function(d) {
            return d.letter; 
        })
    );

    y.domain(
        [0, maxVal]
    );

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
        // .append("text")
        //   .attr("transform", "rotate(-90)")
        //   .attr("y", 6)
        //   .attr("dy", ".71em")
        //   .style("text-anchor", "end")
        //   .text("Frequency");

    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        // .attr("width", "7%")
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); })
        .attr("fill", function(d) {
            // console.log(colorSelect());
            return "rgb("+colorSelect()+")";
         })
         .on("click", function(d) {
            console.log(d.frequency);
         });

    var textArea = svg.append('g')
        .attr({
            "class":"textArea",
        });
      //Create labels
        textArea.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function(d) {
                return d.frequency;
           })
           .attr("text-anchor", "middle")
           .attr("x", function(d, i) {
                // console.log(xScale(i),d,i);
                // console.log(svg.select(".bar").style("width"));
                return x(d.letter) + (x.rangeBand() / 2);
           })
           .attr("y", function(d) {
                return y(d.frequency) - 3;
           })
           .attr("font-family", "sans-serif")
           .attr("font-size", "11px")
           .attr("fill", "#000");
}

// d3.select(window).on('resize', function(){
//     barChart(option);
    
// });

function colorSelect(){
    var c1 = 255;
    var c2 = 50;
    var c3 = 0;
    var letters = [c1,c2,c1];
    // var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    // x.toString(16);
    // for (var i = 0; i < 3; i++ ) {
    //  console.log(Math.floor(Math.random() * 3));
    //     color += letters[Math.floor(Math.random() * 10)];
    // }
    var randomResult = Math.floor(Math.random() * 3);
    var colorStr = "";

    if(randomResult == 0){
        // var colors = letters[randomResult];
        colorStr += letters[randomResult] + ",";
        letters = [c2,c3];

        randomResult = Math.floor(Math.random() * 2);
        if(randomResult == 0){
            colorStr += letters[randomResult] + ",";
            colorStr += (Math.floor(Math.random() * (c1 - c2)) + c2);
        }else{
            colorStr += (Math.floor(Math.random() * (c1 - c2)) + c2) + ",";
            colorStr += c2;
        }
    }else if(randomResult == 1){
        colorStr += letters[randomResult] + ",";

        letters = [c1,c3];
        randomResult = Math.floor(Math.random() * 2);

        if(randomResult == 0){
            colorStr += letters[randomResult] + ",";
            colorStr += (Math.floor(Math.random() * (c1 - c2)) + c2);
        }else{
            colorStr += (Math.floor(Math.random() * (c1 - c2)) + c2) + ",";
            colorStr += c1;
        }
    }else{
        colorStr += (Math.floor(Math.random() * (c1 - c2)) + c2) + ",";

        letters = [c1,c2];
        randomResult = Math.floor(Math.random() * 2);

        if(randomResult == 0){
            colorStr += letters[randomResult] + ",";
            colorStr += c2;
        }else{
            colorStr += letters[randomResult]+ ",";
            colorStr += c1;
        }
    }
    // console.log();

    // console.log(colorStr);
    return colorStr;
}