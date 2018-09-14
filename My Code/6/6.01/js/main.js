/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var margin = {top: 50, left: 80, bottom: 100, right: 20}

var width = 800 - margin.left - margin.right; 
var height = 500 - margin.top - margin.bottom;

var time = 0;
var interval;
var formattedData;

var g = d3.select("#chart-area") 
.append("svg")
	.attr("width", width + margin.left + margin.right) 
	.attr("height", height + margin.top + margin.bottom)
.append("g") 
	.attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

	// X scale
var x = d3.scaleLog() 
	.base(10)
	.domain([142, 150000])
	.range([0, width]);

	// Y scale
var y = d3.scaleLinear()
	.domain([0, 90])
	.range([height, 0]);

	// X label 
g.append("text") 
	.attr("y", height + 50)
	.attr("x", width / 2)
	.attr("font-size", "20px") 
	.attr("text-anchor", "middle")
	.text("GDP Per Capita ($)");

	// Y label 
g.append("text") 
	.attr("y", -40)
	.attr("x", - (height/2)) 
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.text("Life Expectancy (Years)");

	// Time label 
var timeLabel = g.append("text")
	.attr("y", height - 10)
	.attr("x", width - 80)
	.attr("font-size", "36px")
	.attr("opacity", "0.4")
	.text("1800");

	//X Axis Call
var xAxisCall = d3.axisBottom(x)
	.tickValues([400, 4000, 40000])
	.tickFormat(d3.format("$"));
g.append("g") 
	.attr("class", "x axis") 
	.attr("transform", "translate(0, " + height + ")") 
	.call(xAxisCall);

	//Y Axis Call
var yAxisCall = d3.axisLeft(y);
g.append("g")
	.attr("class", "y axis") 
	.call(yAxisCall);

//tooltip
var tip = d3.tip().attr('class', 'd3-tip')
	.html(function(d){
		var text = "<strong>Country:</strong> <span style='color:red'>" + d.country + "</span><br>";
		text += "<strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>" + d.continent + "</span><br>";
		text += "<strong>Life Expectancy:</strong> <span style='color:red'>" + d3.format(".2f")(d.life_exp) + "</span><br>";
		text += "<strong>GDP Per Capita:</strong> <span style='color:red'>" + d3.format("$,.0f")(d.income) + "</span><br>";
		text += "<strong>Population:</strong> <span style='color:red'>" + d3.format(",.0f")(d.population) + "</span><br>";
		return text;
	});
g.call(tip);

// area formula
var area = d3.scaleLinear()
	.range([25*Math.PI, 1500*Math.PI])
	.domain([2000, 1400000000]);

var continentColor = d3.scaleOrdinal(d3.schemePastel1);

var continents = ["europe", "asia", "americas", "africa"];

var legend = g.append("g")
	.attr("transform", "translate(" + (width - 10) + "," + (height - 125) + ")");

continents.forEach(function(continent, i){
	var legendRow = legend.append("g")
		.attr("transform", "translate(0, " + (i * 20) + ")");
	
	legendRow.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("fill", continentColor(continent));

	legendRow.append("text")
		.attr("x", -10)
		.attr("y", 10) 
		.attr("text-anchor", "end")
		.style("text-transform", "capitalize")
		.text(continent);
});

d3.json("data/data.json").then(function(data){

	//clean data
	formattedData = data.map(function(year){
		return year["countries"].filter(function(country){
			var dataExists = (country.income && country.life_exp && country.population);
			return dataExists;
		}).map(function(country){
			country.income = +country.income;
			country.life_exp = +country.life_exp;
			return country;
		})
	});

	//first run of the visualization 
	update(formattedData[0]);
})

$("#play-button")
	.on("click", function(){
		var button = $(this);
		if(button.text() == "Play"){
			button.text("Pause");
			interval = setInterval(step, 100);	
		} else  {
			button.text("Play");
			clearInterval(interval);
		}	
	})

$("#reset-button")
	.on("click", function(){
		time = 0;
		update(formattedData[0]);
	})

$("#continent-select")
	.on("change", function(){
		update(formattedData[time]);
	})

$("#date-slider").slider({
	max: 2014,
	min: 1800,
	step: 1, 
	slide: function(event, ui){
		time = ui.value - 1800; 
		update(formattedData[time]);
	}
})

function step(){
	// at the end of our data, loop back
	time = (time < 214) ? time+1 : 0 
	update(formattedData[time]);
}

function update(data){ 
	var t = d3.transition().duration(100);

	var continent = $("#continent-select").val();

	var data = data.filter(function(d){
		if (continent == "all") { return true; }
		else {
			return d.continent == continent;
		}
	})

	//join new data with old elements
	var circles = g.selectAll("circle")
		.data(data, function(d){
			return d.country;
		});

	//exit old elements
	circles.exit()
		.attr("class", "exit")
		.remove();
	
	// enter new data onto the screen
	circles.enter()
		.append("circle")
			.attr("class", "enter")
			.attr("fill", function(d){ return continentColor(d.continent); })
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide)
			.merge(circles)
			.transition(t) 
				.attr("cy", function(d){ return y(d.life_exp); })
				.attr("cx", function(d){ return x(d.income); })
				.attr("r", function(d){ return Math.sqrt(area(d.population) / Math.PI); });

	//update the time label			
	timeLabel.text(+(time + 1800))
	$("#year")[0].innerHTML = +(time + 1800)
	$("#date-slider").slider("value", +(time + 1800))
};


