/*
*    main.js
*    Mastering Data Visualization with D3.js
*    2.5 - Activity: Adding SVGs to the screen
*/

    let svg = d3.select("#chart-area").append("svg")
        .attr("width", 500)
        .attr("height", 500) 

    svg.append("rect")
        .attr("width", 50)
        .attr("height", 100) 
        .attr("fill", "blue")
    
    svg.append("circle") 
        .attr("cx", 20)
        .attr("cy", 20)
        .attr("r", 10)
        .attr("fill", "orange")
