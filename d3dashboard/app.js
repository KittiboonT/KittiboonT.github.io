


d3.queue()
  .defer(d3.json, "//unpkg.com/world-atlas@1.1.4/world/50m.json")
  .defer(d3.csv, "data.csv", function(row) { // change 1.
    return {
      continent: row.Continent, 
      country: row.Country, 
      countryCode: row["Country Code"], 
      refugees: +row["Refugees"],
      IDPs: +row["IDPs"],
      asylum: +row["Asylum-seekers"],                             
      stateless: +row["Stateless"],              
      others: +row["Others"],                          
      total: +row["Sum"],                           
      region: row.Region, 
      year: +row.Year
    }
  })

  .await(function(error, mapData, data) {
    if (error) throw error;

    var extremeYears = d3.extent(data, d => d.year); // collect max year
    var currentYear = extremeYears[0];
    var currentDataType = d3.select('input[name="data-type"]:checked')
                            .attr("value");
    var geoData = topojson.feature(mapData, mapData.objects.countries).features; // store json

    var width = +d3.select(".chart-container")
                   .node().offsetWidth;
    var height = 400;

    createMap(width, width * 4 / 5); // require wideth and height
    createBar(width, height);
    drawMap(geoData, data, currentYear, currentDataType);
    drawBar(data, currentDataType, "");

    // update when select

    d3.select("#year")
        .property("min", currentYear)
        .property("max", extremeYears[1])
        .property("value", currentYear)
        .on("input", () => {
          currentYear = +d3.event.target.value;
          drawMap(geoData, data, currentYear, currentDataType);
          highlightBars(currentYear);
        });

    // redraw the map
    
    d3.selectAll('input[name="data-type"]')
        .on("change", () => {
          var active = d3.select(".active").data()[0];
          var country = active ? active.properties.country : "";
          currentDataType = d3.event.target.value;
          drawMap(geoData, data, currentYear, currentDataType);
          drawBar(data, currentDataType, country);
        });

// Tooltips

    d3.selectAll("svg")
        .on("mousemove touchmove", updateTooltip);

    function updateTooltip() {
      var tooltip = d3.select(".tooltip");
      var tgt = d3.select(d3.event.target);
      var isCountry = tgt.classed("country");
      var isBar = tgt.classed("bar");
      var isArc = tgt.classed("arc");
      var dataType = d3.select("input:checked")
                       .property("value");
      var data;
      
      if (isCountry) data = tgt.data()[0].properties;
      if (isArc) {
        data = tgt.data()[0].data;
      }
      if (isBar) data = tgt.data()[0];
      tooltip // tooltip style
          .style("opacity", +(isCountry || isArc || isBar))
          .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 2) + "px")
          .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 10) + "px");
      if (data) {
        var dataValue = data[dataType] ?
          data[dataType].toLocaleString() :
          "Data Not Available";
        tooltip 
            .html(`
              <p>Country: ${data.country}</p>
              <p>${formatDataType(dataType)}: ${dataValue}</p>
              <p>Year: ${data.year || d3.select("#year").property("value")}</p>
              
            `)
      }
    }
  });

function formatDataType(key) {
  return key[0].toUpperCase() + key.slice(1).replace(/[A-Z]/g, c => "" + c);
}


















