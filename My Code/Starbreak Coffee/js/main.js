/*
*    Mastering Data Visualization with D3.js
*    Project 1 - Star Break Coffee
*/

var margin = {left:100, top:10, bottom:100, right:10};
var height = 400 - margin.top - margin.bottom;
var width = 600 - margin.left - margin.right;

d3.json("data/revenues.json").then(function(data){
        data.forEach(function(d) {
        d.revenue = +d.revenue;
        d.profit = +d.profit;
    });
    console.log(data);

const g = d3.select("#chart-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

//x label
g.append("text")
    .attr("y", height + 50)
    .attr("x", width / 2)
    .attr("class", "x axis-label")
    .attr("font-size", "14px")
    .attr("text-anchor", "middle")
    .text("Month");

//y label 
g.append("text") 
    .attr("y", - 60) // places label
    .attr("x", - (height / 2)) // places label
    .attr("class", "y axis-label")
    .attr("font-size", "14px") // sets font size
    .attr("text-anchor", "middle") // sets label position 
    .attr("transform", "rotate(-90)") // sets label rotation
    .text("Revenue"); // sets label text

//x scale
var x = d3.scaleBand()
    .domain(data.map(function(d){ return d.month; }))
    .range([0, width])
    .paddingInner(0.3)
    .paddingOuter(0.2);

//y scale
var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) {
        return d.revenue;
    })])
    .range([height, 0]);

var xAxisCall = d3.axisBottom(x)
    g.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxisCall)
//          .selectAll("text")
//          .attr("x", "-15")
//          .attr("text-anchor", "end")
//          .attr("transform", "rotate(-90)");

var yAxisCall = d3.axisLeft(y)
    .tickFormat(function(d){ return "$" + d; });
g.append("g")
    .attr("class", "y-axis")
    .call(yAxisCall);

var rects = g.selectAll("rect")
    .data(data)

rects.enter()
    .append("rect")
        .attr("y", function(d){ return y(d.revenue);} )
        .attr("x", function(d){ return x(d.month);} )
        .attr("width", x.bandwidth)
        .attr("height", function(d){ return height - y(d.revenue); })
        .attr("fill", "grey");

});