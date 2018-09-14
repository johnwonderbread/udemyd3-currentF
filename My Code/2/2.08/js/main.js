/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.8 - Activity: Your first visualization!
*/

d3.json("data/buildings.json").then(function (data) {
    data.forEach(function (d) {
        d.height = +d.height;
        console.log(d);
    });

    let svg = d3.select("#chart-area").append("svg")
        .attr("width", "400")
        .attr("height", "400");

    const x = d3.scaleBand() 
        .domain(["Burj Khalifa", "Shanghai Tower", "Abraj Al-Bait Clock Tower", "Ping An Finance Center", "Lotte World Tower"])
        .range([0,400])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    console.log(x("Burj Khalifa"))

    const y = d3.scaleLinear()
        .domain([0, 828])
        .range([0, 400]);

    let building = svg.selectAll("building")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", 20)
        .attr("x", function(d) {
            return x(d.name);
        })
        .attr("width", x.bandwidth)
        .attr("height", function (d) {
            return y(d.height);
        })
        .attr("fill", "grey")
});
