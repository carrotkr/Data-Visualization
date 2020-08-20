var margin = {top: 10, right: 20, bottom: 30, left: 50};
var width = 960 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

const svg = d3.select("svg");
// console.assert(svg.size() == 1);

// var svg = d3.select("body").append("svg")

svg.attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], 0.07);

var y = d3.scale.linear()
          .rangeRound([height, 0]);

var color = d3.scale.ordinal()
              .range(["#98abc5", "#8a89a6", "#7b6888",
                "Tan", "Peru", "SeaGreen", "MediumAquamarine"]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");
    // .tickformat(d3.format(".2s"));

// Control legend selections and hover.
var active_link = "0";

// Store legend classes to select bars in plotSingle().
var legend_class_array = [];

// Store original y-posn.
var y_orig;

d3.csv("Data_Visualization_1_RIAA.csv", function(error, data) {
  console.log(data)
  if (error) throw error;

  color.domain(d3.keys(data[0]).filter(function(key) {
                                        return key !== "Years";
                                      }));

  data.forEach(function(d) {
    var year = d.Years;
    var y0 = 0;

    d.format = color.domain().map(function(name) {
            return {year: year, name: name, y0: y0, y1: y0 += +d[name]}; });
    d.total_revenue = d.format[d.format.length - 1].y1;
  });

  // data.sort(function(a, b) { return b.total_revenue - a.total_revenue; });

  x.domain(data.map(function(d) {
                      return d.Years;
                    }));
  y.domain([0, d3.max(data, function(d) {
                              return d.total_revenue;
                            })]);

  svg.append("g")
      .attr("class", "x axis")
      // .attr('transform', 'translate(0,' + (this.yAxis(0)) + ')')
      .attr("transform", "translate(" + margin.left +", " + height + ")")
      .call(xAxis)
      // .attr("transform", "translate(margin.left," + "," + height - margin.bottom + ")")
      // .attr("transform", "translate(" margin.left "," + height - margin.bottom + ")")
      .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-90)");
      
  svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(" + margin.left + ")")
      .call(yAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        // .attr("dx", "-.8em")
        // .attr("dy", "-.55em")

  svg.append("text")
      .style("text-anchor", "end")
      .style("font-size", "11px")
      .attr("x", 100)
      .attr("y", 10)
      // .attr("dy", ".71em")
      .text("Revenue ($ Millions)");
      // .attr("transform", "rotate(-90)");

  var stacked_data = svg.selectAll(".stacked_data")
                        .data(data)
                        .enter().append("g")
                          .attr("class", "g")
                          .attr("transform",
                            "translate(" + margin.left + ", " + 0 + ")");
                          // .attr("transform", function(d) {
                          //   return "translate(" + "0" + ",0)";
                          // });
  console.log(stacked_data);

  stacked_data.selectAll("rect")
              .data(function(d) {
                return d.format; 
              })
              .enter().append("rect")
                .attr("x",function(d) {
                  return x(d.year);
                })
                .attr("y", function(d) {
                  return y(d.y1);
                })
                .attr("width", x.rangeBand())
                .attr("height", function(d) {
                  return y(d.y0) - y(d.y1);
                })
                .attr("class", function(d) {
                  // Remove spaces
                  classLabel = d.name.replace(/\s/g, '');
                  return "class" + classLabel;
                })
                .style("fill", function(d) {
                  return color(d.name);
                });

  stacked_data.selectAll("rect")
              .on("mouseover", function(d) {
                var revenue = d.y1 - d.y0;
                // var xPos = parseFloat(d3.select(this).attr("x"));
                // var yPos = parseFloat(d3.select(this).attr("y"));
                var height = parseFloat(d3.select(this).attr("height"))

                d3.select(this)
                  .attr("stroke", "black")
                  .attr("stroke-width", 2.0);

                svg.append("text")
                    .attr("x", 150)
                    .attr("y", 30)
                    .style("text-anchor", "start")
                    .style("font-size", "11px")
                    // .attr("x", xPos)
                    // .attr("y", yPos + height/2)
                    .attr("class", "tooltip")
                    .text(d.name + ": $" + revenue + " (M)");
              })
              .on("mouseout",function() {
                svg.select(".tooltip").remove();

                d3.select(this)
                  .attr("stroke", "pink")
                  .attr("stroke-width", 0.2);
              });

  var legend = svg.selectAll(".legend")
                  .data(color.domain().slice().reverse())
                  .enter().append("g")
                    .attr("class", function (d) {
                      // Remove spaces.
                      legend_class_array.push(d.replace(/\s/g, ''));
                      return "legend";
                    })
                    .attr("transform", function(d, i) {
                      return "translate(0," + i * 20 + ")";
                    });

  // Reverse order to match order in which bars are stacked.
  // legend_class_array = legend_class_array.reverse();

  legend.append("rect")
        .attr("x", width - 18 + margin.left)
        .attr("y", 18 + margin.top)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color)
        .attr("id", function (d, i) {
          return "id" + d.replace(/\s/g, '');
        })
        .on("mouseover",function() {
          if (active_link === "0") {
            d3.select(this).style("cursor", "pointer");
          }
          else {
            if (active_link.split("class").pop() === this.id.split("id").pop()) {
              d3.select(this).style("cursor", "pointer");
            }
            else {
              d3.select(this).style("cursor", "auto");
            }
          }
        })
        .on("click",function(d) {
          if (active_link === "0") { // Nothing selected, turn on this selection.
            d3.select(this)           
              .style("stroke", "black")
              .style("stroke-width", 2);

            active_link = this.id.split("id").pop();
            plot_single_format(this);

            // Gray out the others.
            for (i = 0; i < legend_class_array.length; i++) {
              if (legend_class_array[i] != active_link) {
                d3.select("#id" + legend_class_array[i])
                  .style("opacity", 0.3);
              }
            }  
          }
          else { // Deactivate.
            // Active square selected; turn it OFF.
            if (active_link === this.id.split("id").pop()) {
              d3.select(this)           
                .style("stroke", "none");

              // Reset.
              active_link = "0";

              // Restore remaining boxes to normal opacity.
              for (i = 0; i < legend_class_array.length; i++) {
                d3.select("#id" + legend_class_array[i])
                  .style("opacity", 1);
              }

              // Restore plot to original.
              plot_restore(d);
            }
          } // End active_link check.
        });

  legend.append("text")
        .attr("x", width - 24 + margin.left)
        .attr("y", 27 + margin.top)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "11px")
        .text(function(d) {
          return d;
        });

  svg.append("text")
        .attr("x", width + margin.left)
        .attr("y", 12)    
        // .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "end")
        .style("font-size", "11px")
        // .style("text-decoration", "underline")  
        .text("Format");
  
  svg.append("text")
        .attr("x", width + margin.left)
        .attr("y", 12 + margin.top)
        .attr("text-anchor", "end")
        .style("font-size", "11px")
        .text("(Click Rectangles to Highlight)");

  function plot_single_format(d) {      
    class_keep = d.id.split("id").pop();
    index = legend_class_array.indexOf(class_keep);    
   
    // Erase all but selected bars by setting opacity to 0.
    for (i = 0; i < legend_class_array.length; i++) {
      if (legend_class_array[i] != class_keep) {
        d3.selectAll(".class" + legend_class_array[i])
          .transition()
          .duration(700)          
          .style("opacity", 0.2);
      }
    }

    // // Lower the bars to start on x-axis.
    // y_orig = [];
    // stacked_data.selectAll("rect").forEach(function (d, i) {
    //   // Get height and y position of base bar and selected bar.
    //   h_keep = d3.select(d[index]).attr("height");
    //   y_keep = d3.select(d[index]).attr("y");

    //   // Store y_base in array to restore plot.
    //   y_orig.push(y_keep);

    //   h_base = d3.select(d[0]).attr("height");
    //   y_base = d3.select(d[0]).attr("y");    

    //   h_shift = h_keep - h_base;
    //   y_new = y_base - h_shift;

    //   // Reposition selected bars.
    //   d3.select(d[index])
    //     .transition()
    //     // .ease("bounce")
    //     .duration(1000)
    //     .delay(750)
    //     .attr("y", y_new);
    // })
  }

  function plot_restore(d) {
    stacked_data.selectAll("rect").forEach(function (d, i) {      
      // Restore shifted bars to original position.
      d3.select(d[index])
        .transition()
        .duration(700);
        // .attr("y", y_orig[i]);
    })

    // Restore opacity of erased bars
    for (i = 0; i < legend_class_array.length; i++) {
      if (legend_class_array[i] != class_keep) {
        d3.selectAll(".class" + legend_class_array[i])
          .transition()
          .duration(700)
          .delay(500)
          .style("opacity", 1);
      }
    }
  }
});