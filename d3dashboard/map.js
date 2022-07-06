function createMap(width, height) {
  d3.select("#map")
      .attr("width", width)
      .attr("height", height)
    .append("text")
      .attr("x", width / 2)
      .attr("y", "1em")
      .attr("font-size", "1.5em")
      .style("text-anchor", "middle")
      .classed("map-title", true);
}

function drawMap(geoData, climateData, year, dataType) {
  var map = d3.select("#map");

  var projection = d3.geoMercator()
                     .scale(110)
                     .translate([
                       +map.attr("width") / 2,
                       +map.attr("height") / 1.4
                     ]);

  var path = d3.geoPath()
               .projection(projection);

  d3.select("#year-val").text(year);

  geoData.forEach(d => {
    var countries = climateData.filter(row => row.countryCode === d.id);
    var name = '';
    if (countries.length > 0) name = countries[0].country;
    d.properties = countries.find(c => c.year === year) || { country: name }; // ensure the data exist
  });

  // add color scales 

  var colors = ["#f1c40f", "#e67e22", "#e74c3c", "#c0392b"];

  var domains = {
    refugees: [100, 1000, 10000, 100000],
    asylum: [100, 1000, 10000, 100000],
    IDPs: [100, 1000, 10000, 100000],
    others: [100, 1000, 10000, 100000],

  };

  var mapColorScale = d3.scaleLinear()
                        .domain(domains[dataType])
                        .range(colors);

  var update = map.selectAll(".country")
                  .data(geoData);

  update
    .enter()
    .append("path")
      .classed("country", true)
      .attr("d", path)
      .on("click", function() {
        // update the barchart
        var currentDataType = d3.select("input:checked")
                                .property("value");
        var country = d3.select(this);
        var isActive = country.classed("active");
        var countryName = isActive ? "" : country.data()[0].properties.country;
        drawBar(climateData, currentDataType, countryName);
        highlightBars(+d3.select("#year").property("value"));
        d3.selectAll(".country").classed("active", false);
        country.classed("active", !isActive);
      })
    .merge(update)
      .transition()
      .duration(750)
      .attr("fill", d => {
        var val = d.properties[dataType];
        return val ? mapColorScale(val) : "#ccc";
      });

// title based on the keys

  d3.select(".map-title")
      .text(year)
      .style("font-size", "150px");
}






















