// We assume the following global variables are defined:
//   svg, plot
//   xScale, yScale
//   config
 
// Draw white plot background.
// Useful for debugging before we draw the heatmap.
var drawBackground = function() {
  plot.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", config.plot.width)
    .attr("height", config.plot.height)
    .style("fill", "white");
};

// Draws the x and y axis.
// https://github.com/mbostock/d3/wiki/SVG-Axes#axis
var drawAxes = function() {
  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom")
    .tickPadding(0);
    // .tickFormat(function(d) {
    //   if (d.getMonth() < 3) {
    //     return d.getFullYear();
    //   }
    // });

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left")
    .tickPadding(0);

  plot.append("g")
    .attr("id", "x-axis")
    .attr("class", "axis")
    .attr("transform", translate(0, config.plot.height))
    .call(xAxis);

  plot.append("g")
    .attr("id", "y-axis")
    .attr("class", "axis")
    .call(yAxis);
};

// Draws the heatmap.
// Not too complicated due to how we nested the data
//  but, it can be tricky to figure out which scale to use where.
var drawHeatmap = function() {
  // Create a group per row.
  var rows = plot.append("g")
    .attr("id", "heatmap")
    .attr("class", "cell")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function(d) {
      return translate(0, yScale(d["name"]));
    });

  // Create rect per column.
  var cells = rows.selectAll("rect")
    .data(function(d) {
      return d.values;
    })
    .enter()
    .append("rect")
    .attr("x", function(d) {
      return xScale(d.category);
    })
    .attr("y", 0)
    .attr("width", xScale.rangeBand())
    .attr("height", yScale.rangeBand())
    .style("fill", function(d) {
      return colorScale(d.value);
    });
};

// Draw plot title in upper left margin.
// Will center the text in the margin.
var drawTitle = function() {
  var title = svg.append("text")
    .text("Heatmap")
    .attr("id", "title")
    .attr("x", config.margin.left)
    .attr("y", 0)
    .attr("dx", 0)
    .attr("dy", "18px")
    .attr("text-anchor", "left")
    .attr("font-size", "18px");

  // Shift text so it is centered in plot area.
  var bounds = title.node().getBBox();
  var yshift = (config.margin.top - bounds.height) / 2;
  title.attr("transform", translate(0, yshift));
};

// Draw a color legend at top of plot.
// This is ridiculously hard for the amount of pixels we are drawing,
//  but it is also ridiculously important another approach is
//  to threshold our values

var drawLegend = function() {
  // map our color domain to percentage stops for our gradient
  // we know min is 0% and max is 100%
  // but we have to find where the average falls between there
  var percentScale = d3.scale.linear()
    .domain(d3.extent(colorScale.domain()))
    .rangeRound([0, 100]);

  // Setup gradient for legend.
  // http://bl.ocks.org/mbostock/1086421
  svg.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .selectAll("stop")
    .data(colorScale.domain())
    .enter()
    .append("stop")
    .attr("offset", function(d) {
      return "" + percentScale(d) + "%";
    })
    .attr("stop-color", function(d) {
      return colorScale(d);
    });

  // create group for legend elements
  // will translate it to the appropriate location later
  var legend = svg.append("g")
    .attr("id", "legend");
    // .attr("transform", translate(
    //   config.svg.width - config.margin.right - config.legend.width,
    //   (config.margin.top - config.legend.height) / 2)
    // );

  // draw the color rectangle with gradient
  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", config.legend.width)
    .attr("height", config.legend.height)
    .attr("fill", "url(#gradient)");

  // create another scale so we can easily draw an axis on the color box
  var legendScale = d3.scale.linear()
    .domain(percentScale.domain())
    .range([0, config.legend.width]);

  // use an axis generator to draw axis under color box
  var legendAxis = d3.svg.axis()
    .scale(legendScale)
    .orient("bottom")
    .innerTickSize(4)
    .outerTickSize(4)
    .tickPadding(4)
    .tickValues(colorScale.domain());

  // draw it!
  legend.append("g")
    .attr("id", "color-axis")
    .attr("class", "legend")
    .attr("transform", translate(0, config.legend.height))
    .call(legendAxis)

  // calculate how much to shift legend group to fit in our plot area nicely
  var bounds = legend.node().getBBox();
  var xshift = config.svg.width - bounds.width;
  var yshift = (config.margin.top - bounds.height) / 2;
  legend.attr("transform", translate(xshift, yshift));
};