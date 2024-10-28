var width = 960,
    height = 500;

var svgPosition;

var tooltip = d3.select(".tooltip");

function updateWindow(){
    svgPosition = $("svg").offset(); // This actually shouldn't change

    width = $(window).width() - $(".right-sidebar").outerWidth()
	   - $(".left-sidebar").outerWidth() - 20;
    height = $(window).height() - $(".header").outerHeight()
	   - $(".footer").outerHeight() - 20;
    // Not sure on why the 5 is needed

    svg.attr("width", width).attr("height", height);
}
window.onresize = updateWindow;


var projection = d3.geo.albers();

projection.translate([-width*1.5, height*2]);
projection.scale(height * 20);

var path = d3.geo.path()
    .projection(projection)
    .pointRadius(1.5);

var zoom = d3.behavior.zoom()
	   .translate(projection.translate())
	   .scale(projection.scale())
	   .scaleExtent([height, 60 * height])
	   .on("zoom", zoomed);

var svg = d3.select("#svg").append("svg")
	   .attr("width", width)
	   .attr("height", height)
	   .call(zoom);

updateWindow();

var dataHospital;

function loadHospitalData(callback) {
    d3.csv("data/Hospital_General_Information (w Geo Coding).csv",
		 function(d) {
			// Fix Data --> Split address from hospital / nest?
			d = _.unique(d, false, function(i) {
			    return i.Lat + " " + i.Long;});
			
			d.forEach(function(x) {
			    x.Lat = Number(x.Lat);
			    x.Long = Number(x.Long);
			});
			dataHospital = d;
			callback(null);
		 });
}

queue()
    .defer(d3.json, "data/us.json")
    .defer(loadHospitalData)
    .await(ready);


function ready(error, us, airports, x) {
    svg.append("path")
        .datum(topojson.feature(us, us.objects.land))
        .attr("class", "land")
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states,
    					    function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);
    
   
    svg.selectAll(".point")
    	   .data(dataHospital)
    	   .enter().append("circle")
    	   .attr("class", "points")
    	   .attr("cx", function(d) {
    		  return projection([d.Long, d.Lat])[0];})
    	   .attr("cy", function(d) {
    	   	  return projection([d.Long, d.Lat])[1];})
    	   .attr("stroke", "black")
    	   .attr("fill", "black")
    	   .attr("r", 1.0);
        
    var p = svg.selectAll(".voronoi");
    p = p.data(d3.geom.voronoi(dataHospital.map(function(d) {
    		  return projection([d.Long, d.Lat]);})));
    p.enter().append("path")
            .attr("class", "voronoi");
    p.attr("d", function(d) { return "M" + d.join("L") + "Z"; });
    p.style("fill", "aliceblue");
    
    p.attr("fill-opacity", 0)
        .style("stroke-opacity", 0.5);
    
    p.on("mouseover", function(d, i){
	   // console.log(dataHospital[i]["Hospital Name"]);
	   var mouse = d3.mouse(svg.node()).map( function(d) {
		  return parseInt(d); } );

	   tooltip.classed("hidden", false)
		  .html(dataHospital[i]["Hospital Name"])
		  .attr("style",
			   "left:"+(mouse[0]+25+svgPosition.left) + "px;" +
			   "top:"+(mouse[1]+svgPosition.top) + "px;");

	   if(mouse[0] > width / 2)
		  tooltip.attr("style",
					"left:"+(mouse[0]-25-$(".tooltip").width()
						    +svgPosition.left)
					 + "px;top:"+(mouse[1]+svgPosition.top)+"px;");
	   
	   d3.select(this).attr("fill-opacity", 0.5);});
    
    p.on("mouseout", function(){
	   d3.select(this).attr("fill-opacity", 0);});

    p.on("click", function(d, i) {
	   populateInfo(dataHospital[i]);
    });
    
    p.exit().remove();
    
}


function zoomed() {
    projection.translate(d3.event.translate).scale(d3.event.scale);
    svg.selectAll(".land").attr("d", path);
    svg.selectAll(".states").attr("d", path);

    svg.selectAll(".points")
	   .attr("cx", function(d) {
		  return projection([Number(d.Long), Number(d.Lat)])[0];})
	   .attr("cy", function(d) {
	   	  return projection([Number(d.Long), Number(d.Lat)])[1];});

    svg.selectAll(".voronoi")
	   .data(d3.geom.voronoi(dataHospital.map(function(d) {
    		  return projection([d.Long, d.Lat]);})))
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; });
}
