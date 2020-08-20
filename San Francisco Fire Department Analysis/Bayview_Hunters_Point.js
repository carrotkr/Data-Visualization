function Bayview_Hunters_Point() {
	var WIDTH = 960;
	var HEIGHT = 500;

	// Set width and height of svg.
	d3.select('svg')
    	.style('width', WIDTH)
    	.style('height', HEIGHT);

	// Fetch data.
	d3.csv('Bayview_Hunters_Point.csv').then(function(csv_data) {
    var dataset = d3.nest()
      .key(function(d) {
      	return d.Arrival_DtTm;
      })
      .rollup(function(v) {
      	return v.length;
      })
      .entries(csv_data);

    console.log(dataset);

    // Select rectangles within svg.
    d3.select('svg').selectAll('rect')
        // Attach data to the rectangles.
        .data(dataset)
        // Find the data elements that are not attached to rectangles.
        .enter()
        // Append rectangles for each data not attached to a rectangle.
        .append('rect');

    // Create a linear scale.
	var yScale = d3.scaleLinear();
    // Set its visual range to 600->0.
    yScale.range([HEIGHT, 0]);
    // Get the minimum y data value by looking at the count property of each datum.
    var yMin = d3.min(dataset, function(datum, index){
        return datum.value;
    })
    console.log(yMin);
    // Get the maximum y data value by looking at the count property of each datum.
    var yMax = d3.max(dataset, function(datum, index){
        return datum.value;
    })
    // console.log(yMax);
    // Set the domain of yScale from yMin and yMax.
    yScale.domain([yMin-10, yMax]);
    d3.selectAll('rect')
        .attr('height', function(datum, index) {
        // Set the height of each rectangle by getting the count property of each datum
        //  converting it to a visual value, using yScale
        //  then subtract that value from HEIGHT.
            return HEIGHT-yScale(datum.value);
        });

	//-----Adjusting the horizontal and the vertical placement of the bars.-----//

	// Create the xScale.
    var xScale = d3.scaleLinear();
    // Set the range to 0->800.
    xScale.range([0, WIDTH]);
	// Set the domain from 0 to the number of data elements retrieved.
    xScale.domain([0, dataset.length]);
    // Select all rectangles.
    d3.selectAll('rect')
        .attr('x', function(datum, index) {
            // Set the x position of each rectangle
            //  by converting the index of the elemnt in the array to a point between 0->800.
            return xScale(index);
        });
    d3.selectAll('rect')
        .attr('y', function(datum, index){
            // Set the y position of each rectangle
            //  by converting the count property of the datum to a visual value.
            return yScale(datum.value);
        });

    //-----Making the width of the bars dynamic.-----//

    // Set the width of all rectangles to be the width of the SVG divided by the number of data elements.
    d3.selectAll('rect')
        .attr('width', WIDTH/dataset.length);

    //-----Interactivity.-----//

    d3.selectAll('rect')
        .append("title")
        .text(function(dataset) {
            return "Response Time: " + dataset.key + "(min)" + "\n"
                + "Count: " + dataset.value;
        });

    //-----Changing the color of the bar based on data.-----//

    var yDomain = d3.extent(dataset, function(datum, index) {
        // Set the y domain by getting the min/max
        //  and examining the count property of each datum.
        return datum.value;
    })

    // Create a linear scale.
    var colorScale = d3.scaleLinear();
    colorScale.domain(yDomain)
    // colorScale.range(['#00cc00', 'blue']) // The visual range goes from green->blue.
    colorScale.range(['#bbbbbb', '#595959'])

    d3.selectAll('rect')
        .attr('fill', function(datum, index) {
            // Set the fill of each rectangle
            //  by converting the count property of the datum to a color.
            return colorScale(datum.value)
        })
	});
}