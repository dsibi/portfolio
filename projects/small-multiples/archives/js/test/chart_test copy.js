//1. Access data
async function drawChart() {
  const pathToData = './data/chart.csv'
  let dataset = await d3.dsv(";", pathToData);
  // console.log(data);

  // group the data
  let metrics = Array.from(
    d3.group(dataset, d => d.name_rus), ([key, value]) => ({ key, value })
  );
  // console.log(metrics);

  const xAccessor = Array.from(new Set(dataset.map(function (d) { return +d.element_number; })));
  const colorAccessor = d => +d.grade_of_execution;

  // Set the sizing metrics
  let dimensions = {
    width: 600,
    height: 300,
    margin: {
      top: 45,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.right - dimensions.margin.left;
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top - dimensions.margin.bottom;

  // Create the axes
  let xScale = d3.scaleSequential()
    .domain(xAccessor)
    .range([0, dimensions.boundedWidth])

  let yScale = d3.scaleLinear()
    .range([dimensions.height, 0])
    .nice();

  let xAxis = d3.axisBottom()
    .scale(xScale);

  const colorScale = d3.scaleSequential()
    .domain(d3.extent(dataset, colorAccessor))
    // .interpolator(d3.interpolatePiYG);
    .range(['#F79CD4', '#0FCFC0']);

  const minLegVal = colorScale.domain()[0];
  const maxLegVal = colorScale.domain()[1];

  // create a separate SVG object for each group
  // class each SVG with parameter from metrics
  let svg = d3.select('#wrapper')
    .selectAll('svg')
    .data(metrics)
    .enter()
    .append('svg')
    .attr("class", function (d) {
      // console.log(d.value[0].parameter)
      // console.log(d.value)
      // console.log(d.value[0])
      return d.value[0].name_rus;
    })
    .style('transform', `translate(${dimensions.margin.left}px,
      ${dimensions.margin.top}px)`);

  // loop over the data and create the bars
  metrics.forEach(function (d, i) {
    //console.log(d);
    //console.log(metrics);
    // reset yScale domain based on the set of the_value's for these metrics
    yScale.domain([0, d3.max(d.value, function (c) {
      // console.log(c);
      return +c.scores_of_panel;
    })]);
    // console.log(d.value);
    // select the right svg for this set of metrics
    // console.log("svg." + d.value[0].name_rus)

    d3.select("svg." + d.value[0].name_rus)
      .selectAll('.circle')
      .data(d.value) // use d.value to get to the the_value
      .enter()
      .append('circle')
      .attr('class', 'circles')
      // .attr('x', function (c) {
      //   console.log(c);
      //   return xScale(+c.element_number);
      // })
      // .attr('width', xScale.bandwidth())
      // .attr('y', function (c) { return yScale(+c.scores_of_panel); })
      // .attr('height', function (c) { return height - yScale(+c.scores_of_panel); })
      // .attr('fill', 'teal');
      .attr('cx', c => xScale(+c.element_number))
      .attr('cy', c => yScale(+c.scores_of_panel))
      .attr('r', 6)
      .attr("fill", c => colorScale(colorAccessor(c)));

    // call axis just on this SVG
    // otherwise calling it 5 times for 5 metrics...
    // d3.select("svg." + d.value[0].parameter)
    //   .append('g')
    //   .attr('transform', 'translate(0,' + height + ')')
    //   .call(xAxis)

  });
}

drawChart();