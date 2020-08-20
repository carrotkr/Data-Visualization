var height = 600;
var width = 960;
var projection = d3.geoMercator();
var map = void 0;
var sf_map = void 0;

var path = d3.geoPath().projection(projection);

var svg = d3.select("#map")
          .append("svg")
          .attr("width", width)
          .attr("height", height);

// Define quantize scale to sort data values into buckets of color.
// var color = d3.scaleQuantize()
//               .range(["rgb(237,248,233)", "rgb(186,228,179)",
//                 "rgb(116,196,118)","rgb(49,163,84)","rgb(0,109,44)"]);
//                 // Colors derived from ColorBrewer,
//                 //  by Cynthia Brewer, and included in
//                 //  https://github.com/d3/d3-scale-chromatic

// const color = d3.scaleQuantile()
//   .range([
//     'rgb(247,251,255)',
//     'rgb(222,235,247)', 
//     'rgb(198,219,239)', 
//     'rgb(158,202,225)',
//     'rgb(107,174,214)',
//     'rgb(66,146,198)',
//     'rgb(33,113,181)',
//     'rgb(8,81,156)',
//     'rgb(8,48,107)',
//     'rgb(3,19,43)'
//   ]);

var color = d3.scaleLinear()
.range(['PapayaWhip', 'SandyBrown']);

// Set tooltips
var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>"
              + d.properties.name + "<br></span>";
            })
svg.call(tip);

d3.csv("Data_Visualization_3_IFPI.csv").then(function(data) {
  var dataset = d3.nest()
                .key(function(d) {
                  return d.Market;
                })
                .entries(data);

  console.log("dataset", dataset);
  console.log(dataset[0].key);
  console.log(dataset[0].values[0].Retail_Value);
  console.log(dataset.length);

  // Set input domain for color scale.
  color.domain([
          d3.min(dataset, function(d) { return d.values[0].Retail_Value; }), 
          d3.max(dataset, function(d) { return d.values[0].Retail_Value; })
        ]);

  d3.json('world_map.geojson').then(function(json) {
    // Merge data and GeoJSON.
    // Loop through once for each tree data value.
    for (var i = 0; i < dataset.length; i++) {
      // Grab neighborhood name.
      var data_country = dataset[i].key;
      console.log(data_country);

      // Grab data value, and convert from string to float.
      var data_value = parseFloat(dataset[i].values[0].Retail_Value);
      console.log(data_value);
        
      // Find the corresponding neighborhood inside GeoJSON.
      for (var j = 0; j < json.features.length; j++) {
        var json_neighborhood = json.features[j].properties.name;
        console.log(data_country);
        
        if (data_country == json_neighborhood) {
          // Copy the data value into the JSON.
            json.features[j].properties.value = data_value;
            console.log(json.features[j].properties.value); 

          // Stop looking through the JSON.
          break;
        }
      }   
    }

    var b, s, t;
    projection.scale(1).translate([0, 0]);
    var b = path.bounds(json);
    var s = 1.6 / Math.max((b[1][0] - b[0][0]) / width,
                          (b[1][1] - b[0][1]) / height);
    var t = [(width - s * (b[1][0] + b[0][0])) / 2,
            (height - s * (b[1][1] + b[0][1])) / 2];
    projection.scale(s).translate(t);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
          
    map = svg.append('g')
              .attr('class', 'boundary');
    sf_map = map.selectAll('path').data(json.features);

    sf_map.enter()
            .append('path')
            .attr('d', path)
            .style("fill", function(d) {
              // Get data value.
              var value = d.properties.value;
                
              if (value) {
                // If value exists.
                return color(value);
              } else {
                // If value is undefined.
                return "#ccc";
              }
            })
            // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          tip.show(d);

          d3.select(this)
            .style("opacity", 1)
            .style("stroke","white")
            .style("stroke-width",3);
        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
            .style("opacity", 0.8)
            .style("stroke","white")
            .style("stroke-width",0.3);
        });
            
    sf_map.attr('fill', '#eee');

    sf_map.exit().remove();
  });
});