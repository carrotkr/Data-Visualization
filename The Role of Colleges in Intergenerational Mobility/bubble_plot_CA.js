// Set svg size and plot margins.
const width = 960;
const height = 500;
const margin = {
  top: 10,
  bottom: 35,
  left: 35,
  right: 15
};

// Select svg.
const svg = d3.select("#ca");
console.assert(svg.size() == 1);

// Set svg size.
svg.attr("width", width);
svg.attr("height", height);

// Add plot region.
const plot = svg.append("g").attr("id", "plot");

/*
 * Returns a translate string for the transform attribute.
 */
function translate(x, y) {
  return "translate(" + String(x) + "," + String(y) + ")";
}

// Transform region by margin.
plot.attr("transform", translate(margin.left, margin.top));

/*
 * Setup scales with ranges and the domains we set from tableau
 *  defined globally for access within other functions.
 */
const xScale = d3.scaleLinear()
  .range([0, width - margin.left - margin.right])
  .domain([20000, 180000]);

const yScale = d3.scaleLinear()
  .range([height - margin.top - margin.bottom, 0])
  .domain([-0.5, 10.5]);

// area = pi r*r
// Do not linearly scale the radius.
const sizeScale = d3.scaleSqrt()
  .range([1, 30])
  .domain([0, 9000]);

// RdYlBu scheme is available both in tableau and d3.
const colorScale = d3.scaleDiverging(d3.interpolateRdYlGn)
  .domain([-20, 0, 50]);

// Since we do not need the data for our domains,
//  we can draw our axis/legends right away.
drawAxis();
drawTitles();
drawColorLegend();
drawCircleLegend();

// Load data and trigger draw.
d3.csv("mrc_table_1.csv", convert).then(draw);

/*
 * Converts values as necessary and discards unused columns.
 */
function convert(row) {
  let keep = {}

  // Name of college.
  keep.name = row.name;
  // State.
  keep.state = row.state;
  // Average number of kids per cohort.
  keep.count = parseInt(row.count);
  // Mobility rate (joint probability of parents in bottom quintile
  //  and child in top quintile of the income distribution).
  keep.mobility = parseFloat(row.mr_kq5_pq1);
  // Median parent household income (rounded to nearest $100).
  keep.income = parseFloat(row.par_median);
  keep.trend = parseFloat(row.trend_bottom40);

  switch(row.name.toLowerCase()) {
    case "university of san francisco":
    case "san francisco state university":
    case "san francisco community college district":
    case "stanford university":
    case "harvey mudd college":
    case "university of california, berkeley":
    case "california state university, los angeles":
      keep.label = true;
      break;
    default:
      keep.label = false;
  }

  return keep;
}

function draw(data) {
  console.log("loaded:", data.length, data[0]);

  // filter for only california universities
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  data = data.filter(row => row.state === "CA");
  console.log("filter:", data.length, data[0]);

  // sort by count so small circles are drawn last
  data.sort((a, b) => b.count - a.count);
  console.log("sorted:", data.length, data[0]);

  drawBubble(data);
  drawLabels(data);
}

/*
 * Draw bubbles.
 */
function drawBubble(data) {
  let bubbles = plot.append("g")
    .attr("id", "bubbles")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle");

  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
  bubbles.attr("cx", d => xScale(d.income));
  bubbles.attr("cy", d => yScale(d.mobility));
  bubbles.attr("r",  d => sizeScale(d.count));

  bubbles.style("stroke", "black");
  bubbles.style("fill", d => colorScale(d.trend));
}

/*
 * draw labels for pre-selected bubbles
 */
function drawLabels(data) {
  let labels = plot.append("g")
    .attr("id", "labels")
    .selectAll("text")
    .data(data)
    .enter()
    .filter(d => d.label)
    .append("text");

  labels.text(d => d.name);

  labels.attr("x", d => xScale(d.income));
  labels.attr("y", d => yScale(d.mobility));

  labels.attr("text-anchor", "middle");
  labels.attr("dy", d => -(sizeScale(d.count) + 4));
}

// https://beta.observablehq.com/@tmcw/d3-scalesequential-continuous-color-legend-example
function drawColorLegend() {
  let legendWidth = 200;
  let legendHeight = 20;

  let legend = svg.append("g").attr("id", "color-legend");

  legend.attr("transform", translate(width - margin.right - legendWidth, margin.top))

  let title = legend.append("text")
    .attr("class", "axis-title")
    .attr("dy", 12)
    .text("Change in Income*");

  // Draw the rectangle, but it won't have a fill just yet.
  let colorbox = legend.append("rect")
    .attr("x", 0)
    .attr("y", 12 + 6)
    .attr("width", legendWidth)
    .attr("height", legendHeight);

  // We need to create a linear gradient for our color legend.
  // This defines a color at a percent offset.
  // https://developer.mozilla.org/en-US/docs/Web/SVG/Element/linearGradient

  // this is easier if we create a scale to map our colors to percents

  // get the domain first (we do not want the middle value from the diverging scale)
  let colorDomain = [d3.min(colorScale.domain()), d3.max(colorScale.domain())];

  let percentScale = d3.scaleLinear()
    .range([0, 100])
    .domain(colorDomain);

  // We have to first add gradients.
  let defs = svg.append("defs");

  // add a stop per tick
  defs.append("linearGradient")
    .attr("id", "gradient")
    .selectAll("stop")
    .data(colorScale.ticks())
    .enter()
    .append("stop")
    .attr("offset", d => percentScale(d) + "%")
    .attr("stop-color", d => colorScale(d));

  // draw the color rectangle with the gradient
  colorbox.attr("fill", "url(#gradient)");

  // now we need to draw tick marks for our scale
  // we can create a legend that will map our data domain to the legend colorbox
  let legendScale = d3.scaleLinear()
    .domain(colorDomain)
    .range([0, legendWidth]);

  let legendAxis = d3.axisBottom(legendScale)
  legendAxis.tickValues(colorScale.domain());
  legendAxis.tickSize(legendHeight);
  legendAxis.tickSizeOuter(0);

  let axisGroup = legend.append("g")
    .attr("id", "color-axis")
    .attr("transform", translate(0, 12 + 6))
    .call(legendAxis);

  // Tighten up the tick labels a bit so they don't stick out.
  axisGroup.selectAll("text")
    .each(function(d, i) {
      // set the first tick mark to anchor at the start
      if (i == 0) {
        d3.select(this).attr("text-anchor", "start");
      }
      // set the last tick mark to anchor at the end
      else if (i == legendAxis.tickValues().length - 1) {
        d3.select(this).attr("text-anchor", "end");
      }
    });

  // How many more lines of code it took to generate the legend
  //  than the base visualization!
}

/*
 * this demonstrates d3-legend for creating a circle legend
 * it is made to work with d3v4 not d3v5 however
 */
function drawCircleLegend() {
  let legendWidth = 200;
  let legendHeight = 20;

  let legend = svg.append("g").attr("id", "circle-legend");

  legend.attr("transform", translate(width - margin.right - legendWidth, margin.top + 75))

  // https://d3-legend.susielu.com/#size-linear
  var legendSize = d3.legendSize()
    .scale(sizeScale)
    .shape('circle')
    .cells(4)
    .ascending(true)
    .shapePadding(7)
    .labelOffset(10)
    .labelFormat("d")
    .title('Average Cohort Size')
    .orient('horizontal');

  legend.call(legendSize);

  // fix the title spacing
  legend.select("text.legendTitle").attr("dy", -6);
}

function drawTitles() {
  let xMiddle = margin.left + midpoint(xScale.range());
  let yMiddle = margin.top + midpoint(yScale.range());

  // test middle calculation
  // svg.append("circle").attr("cx", xMiddle).attr("cy", yMiddle).attr("r", 5);

  let xTitle = svg.append("text")
    .attr("class", "axis-title")
    .text("Median Parent Household Income");

  xTitle.attr("x", xMiddle);
  xTitle.attr("y", height);
  xTitle.attr("dy", -4);
  xTitle.attr("text-anchor", "middle");

  // it is easier to rotate text if you place it in a group first
  // https://developer.mozilla.org/en-US/docs/Web/CSS/transform-function/rotate

  let yGroup = svg.append("g")
    // set the position by translating the group
    .attr("transform", translate(4, yMiddle));

  let yTitle = yGroup.append("text")
    .attr("class", "axis-title")
    .text("Mobility Rate");

  // keep x, y at 0, 0 for rotation around the origin
  yTitle.attr("x", 0);
  yTitle.attr("y", 0);

  yTitle.attr("dy", "1.75ex");
  yTitle.attr("text-anchor", "middle");
  yTitle.attr("transform", "rotate(-90)");
}

/*
 * create axis lines
 */
function drawAxis() {
  let xAxis = d3.axisBottom(xScale).ticks(9, "s").tickSizeOuter(0);
  let yAxis = d3.axisLeft(yScale).ticks(6).tickSizeOuter(0);;

  svg.append("g")
    .attr("id", "x-axis")
    .attr("class", "axis")
    .attr("transform", translate(margin.left, height - margin.bottom))
    .call(xAxis);

  svg.append("g")
    .attr("id", "y-axis")
    .attr("class", "axis")
    .attr("transform", translate(margin.left, margin.top))
    .call(yAxis);
}

/*
 * calculates the midpoint of a range given as a 2 element array
 */
function midpoint(range) {
  return range[0] + (range[1] - range[0]) / 2.0;
}