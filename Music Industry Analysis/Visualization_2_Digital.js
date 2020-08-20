var margin = {top: 30, right: 20, bottom: 30, left: 50};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var digitial_bar = d3.select("#digitial")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var svg2 = d3.append("svg");
// var margin = {top: 20, right: 20, bottom: 30, left: 50};
// var width = +svg2.attr("width") - margin.left - margin.right;
// var height = +svg2.attr("height") - margin.top - margin.bottom;

var x = d3.scaleBand().rangeRound([0, width]).padding(0.05),
    y = d3.scaleLinear().rangeRound([height, 0]);

// var g2 = svg2.append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("Data_Visualization_2_IFPI.csv")
    .then((data) => {
      return data.map((d) => {
        d.Digital_Value = +d.Digital_Value;

        return d;
      });
    })
    .then((data) => {
      x.domain(data.map(function(d) { return d.Market; }));
      y.domain([0, d3.max(data, function(d) { return d.Digital_Value; })]);
      
      digitial_bar.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      digitial_bar.append("g")
        .attr("class", "axis axis--y")
        // .call(d3.axisLeft(y).ticks(10, "%"))
        .call(d3.axisLeft(y))
        // .append("text")
        //   .attr("transform", "rotate(-90)")
        //   .attr("y", 6)
        //   .attr("dy", "0.71em")
        //   .attr("text-anchor", "end")
        //   .text("Frequency");

      digitial_bar.append("text")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .attr("x", 50)
        .attr("y", -10)
        // .attr("dy", ".71em")
        .text("Revenue ($ Millions)");
        // .attr("transform", "rotate(-90)");

      digitial_bar.selectAll(".bar")
        .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.Market); })
          .attr("y", function(d) { return y(d.Digital_Value); })
          .attr("width", x.bandwidth())
          .attr("height", function(d) { return height - y(d.Digital_Value); });

      digitial_bar.selectAll(".bar")
        .on("mouseover", function(d) {
          var digital_revenue = d.Digital_Value;
          // var xPos = parseFloat(d3.select(this).attr("x"));
          // var yPos = parseFloat(d3.select(this).attr("y"));
          var height = parseFloat(d3.select(this).attr("height"))

          d3.select(this)
            .attr("stroke", "black")
            .attr("stroke-width", 2.0);

          digitial_bar.append("text")
            .attr("x", 370)
            .attr("y", 10)
            .style("text-anchor", "start")
            .style("font-size", "11px")
            // .attr("x", xPos)
            // .attr("y", yPos + height/2)
            .attr("class", "tooltip")
            .text(d.Market + ": $" + digital_revenue + " (M)");
        })
        .on("mouseout",function() {
          digitial_bar.select(".tooltip").remove();

          d3.select(this)
            .attr("stroke", "pink")
            .attr("stroke-width", 0.2);
        });
    })
    .catch((error) => {
        throw error;
    });