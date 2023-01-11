//1. Access data
async function drawChart() {
  const pathToData = './data/chart.csv'
  let dataset = await d3.dsv(";", pathToData)
  // console.log(dataset[0]);

  const xAccessor = d => +d['Agricultural area (crops & grazing) (HYDE (2017))']/1000000;
  const yAccessor = d => d.length;
  // console.log(dataset[30]);
  // console.log(xAccessor(dataset[30]));
  // console.log(typeof yAccessor(dataset[0]));

  //2. Create chart dimensions
  // const width = d3.min([window.innerWidth * .9, window.innerHeight * .9]);
  // const width=Math.min(window.innerWidth*.9,window.innerHeight*.9);
  // console.log(width);
  let dimensions = {
    width: window.innerWidth * .5,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.right - dimensions.margin.left;
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top - dimensions.margin.bottom;

  //3. Draw canvas
  const wrapper = d3.select('#wrapper')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  const bounds = wrapper.append('g')
    .attr('class', 'chart')
    .style('transform', `translate(${dimensions.margin.left}px,
      ${dimensions.margin.top}px)`);

  bounds.append('g').attr('class', 'bins')
  bounds.append('line').attr('class', 'mean')
  bounds
    .append('g')
    .attr('class', 'x-axis')
    .style('transform', `translateY(${dimensions.boundedHeight}px)`)
    .append('text')
    .attr('class', 'x-axis-label')

  //4. Create scales
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice()

  const binsGenerator = d3
    .histogram()
    .domain(xScale.domain())
    .value(xAccessor)
    .thresholds(8)

  const bins = binsGenerator(dataset)

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(bins, yAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice()

  //5. Draw data
  const barPadding = 1

  let binGroups = bounds
    .select('.bins')
    .selectAll('.bin')
    .data(bins)

  binGroups.exit().remove()

  const newBinGroups = binGroups
    .enter()
    .append('g')
    .attr('class', 'bin')

  newBinGroups.append('rect')
  newBinGroups.append('text')

  // update binGroups to include new points
  binGroups = newBinGroups.merge(binGroups)

  const barRects = binGroups
    .select('rect')
    .attr('x', d => xScale(d.x0) + barPadding)
    .attr('y', d => yScale(yAccessor(d)))
    .attr('height', d => dimensions.boundedHeight - yScale(yAccessor(d)))
    .attr('width', d => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))

  // Add labels to bins with relevant days only; no need to call a 0 label - the bar will be empty
  const barText = binGroups
    .filter(yAccessor)
    .append('text')
    // Center the label horizontally above the bar
    .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    // Shift text up by 5 pixels to add a little gap
    .attr('y', d => yScale(yAccessor(d)) - 5)
    .text(yAccessor)
    // Use text-anchor to horizontally align our text instead of compensating for width
    .style('text-anchor', 'middle')
    // Color and style
    .attr('fill', 'darkgrey')
    .style('font-size', '12px')
    .style('font-family', 'sans-serif')

  const mean = d3.mean(dataset, xAccessor)

  const meanLine = bounds
    .selectAll('.mean')
    .attr('x1', xScale(mean))
    .attr('x2', xScale(mean))
    .attr('y1', 25)
    .attr('y2', dimensions.boundedHeight)

  const meanLabel = bounds
    .append('text')
    .attr('x', xScale(mean))
    .attr('y', 15)
    .text('mean')
    .attr('fill', 'maroon')
    .style('font-size', '12px')
    .style('text-anchor', 'middle')

  //6. Draw peripherals
  const xAxisGenerator = d3.axisBottom().scale(xScale)

  const xAxis = bounds.select('.x-axis').call(xAxisGenerator)

  const xAxisLabel = xAxis
    .select('.x-axis-label')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 3)
    .text('Agricultural Land Use (M ha)')

  //7. Set up interactions
  // Since we need to update our tooltip text and position when we hover over a bar, we need to use event listeners
  binGroups
    .select('rect')
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut)

  const tooltip = d3.select("#tooltip")
  function onMouseOver(e, datum) {
    const formatHumidity = d3.format(',')

    tooltip.select("#upper_line")
      .text(`${[formatHumidity(datum.x0), formatHumidity(datum.x1)].join(" - ")} million hectares`)

    tooltip.select("#lower_line").text(`Frequency: ${yAccessor(datum)}`)

    const xPositionOfBarInChart = xScale(datum.x0)
    const widthOfBarInChart = xScale(datum.x1) - xScale(datum.x0)
    const boundsMarginOfShiftToRight = dimensions.margin.left
    const x = xPositionOfBarInChart + (widthOfBarInChart / 2) + boundsMarginOfShiftToRight*.85
    const yPositionOfBarInChart = yScale(yAccessor(datum))
    const boundsMarginOfShiftDown = dimensions.margin.top
    const y = yPositionOfBarInChart + boundsMarginOfShiftDown
    tooltip.style("transform", `translate(calc(-50% + ${x + window.innerWidth*.25}px), calc(-100% + ${y}px))`)
    tooltip.style("opacity", 1)
  }
  function onMouseOut(e, datum) {
    tooltip.style("opacity", 0)
  }
}

drawChart();