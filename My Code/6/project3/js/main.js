/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/

var margin = { left:80, right:100, top:50, bottom:100 },
    height = 500 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;
var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + 
        ", " + margin.top + ")");

var t = function() { return d3.transition().duration(1000); }

var parseTime = d3.timeParse("%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");
var bisectDate = d3.bisector(function(d) { return d.year; }).left; 

// Add the line for the first time
g.append("path")
    .attr("class", "line")
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("stroke-width", "3px");

// Labels
var xLabel = g.append("text")
    .attr("class", "x-axis label")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Period");

var yLabel = g.append("text")
    .attr("class", "y-axis label")
    .attr("y", - 50)
    .attr("x", - 170)
    .attr("transform", "rotate(-90)")
    .attr("font-size", "18px")
    .attr("text-anchor", "middle")
    .text("Price (USD)");

// Scales
var x = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

// Axis generators
var xAxisCall = d3.axisBottom()
var xAxis = g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");
var yAxisCall = d3.axisLeft()
    .ticks(6)
    .tickFormat(function(d) { return parseInt(d / 1000) + "k"; });
var yAxis = g.append("g")
    .attr("class", "y axis")

// Event Listener
$("#coin-select").on("change", update)
$("#var-select").on("change", update)

// JQuery Slider
$("#date-slider").slider({
    range: true, 
    max: parseTime("10/31/2017").getTime(),
    min: parseTime("5/12/2013").getTime(),
    step: 86400, // one day 
    values: [parseTime("01/01/2013"), parseTime("12/31/2017").getTime()],
    slide: function(event, ui){
        $("dateLabel1").text(formatTime(new Date(ui.values[0])));
        $("dateLabel2").text(formatTime(new Date(ui.values[1])));
        update();
    }
});

// Load data
d3.json("data/coins.json").then(function(data) {
    console.log(data);
    
    // Data cleaning
    filteredData = {};
    for (var coin in data) {
        if(!data.hasOwnProperty(coin)) {
            continue;
        } 
        filteredData[coin] = data[coin].filter(function(d){
            return !(d["price_usd"] == null)
        })
        filteredData[coin].forEach(function(d){
            d["price_usd"] = +d["price_usd"];
            d["24h_vol"] = +d["24h_vol"];
            d["market_cap"] = +d["market_cap"];
            d["date"] = parseTime(d["date"]);
        });
    }

    //run the visualization for the first time
    update();
});

function update() {
    var coin = $("#coin-select").val();
    var yValue = $("#var-select").val();
    var sliderValues = $("#date-slider").slider("values");
    var dataTimeFiltered = filteredData[coin].filter(function(d){
        return ((d.date >= sliderValues[0]) && (d.date <= sliderValues[1]))
    });

    // Fix for format values
    var formatSi = d3.format(".2s");
    function formatAbbreviation(x) {
        var s = formatSi(x);
        switch (s[s.length - 1]) {
        case "G": return s.slice(0, -1) + "B";
        case "k": return s.slice(0, -1) + "K";
        }
        return s;
    }

    // Update axes
    xAxisCall.scale(x);
    xAxis.transition(t()).call(xAxisCall);
    yAxisCall.scale(y);
    yAxis.transition(t()).call(yAxisCall);

    // Set scale domains
    x.domain(d3.extent(dataTimeFiltered, function(d) { return d.date; }));
    y.domain([0, d3.max(dataTimeFiltered, function(d) { return d[yValue]; }) * 1.005,
        d3.min(dataTimeFiltered, function(d){ return d[yValue]; }) / 1.005]);

    /******************************** Tooltip Code ********************************/

    var focus = g.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", 0)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7.5);

    focus.append("text")
        .attr("x", 15)
        .attr("dy", ".31em");

    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(dataTimeFiltered, x0, 1),
            d0 = dataTimeFiltered[i - 1],
            d1 = dataTimeFiltered[i],
            d = (d1 && d0) ? (x0 - d0.date > d1.date - x0 ? d1 : d0) : 0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d[yValue]) + ")");
        focus.select("text").text(function() { return d3.format("$,")(d[yValue].toFixed(2)); });
        focus.select(".x-hover-line").attr("y2", height - y(d[yValue]));
        focus.select(".y-hover-line").attr("x2", -x(d.date));
    }


    /******************************** Tooltip Code ********************************/

    // Line path generator
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d[yValue]); });

    // Update Line Path
    g.select(".line")
        .transition(t)
        .attr("d", line(dataTimeFiltered))

};

