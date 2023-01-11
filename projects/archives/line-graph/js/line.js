async function drawLineChart() {

  // 1. Access data
  const pathToJSON = './data/russian-army-budget.csv'
  let dataset = await d3.dsv(";", pathToJSON)

  const formatYear = year => d3.timeParse("%Y")(year)
  const xAccessor = d => formatYear(d.Year)
  const formatRubbles = d3.format(".2f")
  const yAccessor = d => +formatRubbles(d['Billion Rubles'])
  // console.log(d3.timeParse("%Y")(dataset[3].Year));
  // console.log(typeof d3.timeParse("%Y")(dataset[3].Year));
  // console.log(d3.timeFormat("%Y")(d3.timeParse("%Y")(dataset[3].Year)));
  // console.log(typeof d3.timeFormat("%Y")(d3.timeParse("%Y")(dataset[3].Year)));

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.8,
    height: 400,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  // 4. Create scales

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()
  // console.log(dataset);
  // console.log(d3.min(dataset, yAccessor));
  // console.log(d3.max(dataset, yAccessor));

  // Define a custom value for freezing using the Seattle weather dataset
  const medianSpending = formatRubbles(d3.median(dataset, yAccessor));
  const medianSpendingPlacement = yScale(medianSpending);
  // console.log(medianSpending);
  // console.log(medianSpendingPlacement);

  bounds.append('line').attr('class', 'median');

  const xScale = d3.scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
  // console.log(xScale.domain());

  // 5. Draw data

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))

  const line = bounds.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(dataset))

  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)

  const yAxis = bounds.append("g")
    .attr("class", "y-axis")
    .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
    .attr("class", "y-axis-label")
    .attr("x", -dimensions.boundedHeight / 2)
    .attr("y", -dimensions.margin.left + 11)
    .html("Defense Spending (₽ B)")

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .ticks(d3.timeYear.every(1))


  const xAxis = bounds.append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator)

  const xAxisLabel = xAxis.append("text")
    .attr("class", "x-axis-label")
    .attr("x", dimensions.boundedWidth / 2)
    .attr("y", dimensions.margin.bottom)
    .text("Year")

  const medianLine = bounds
    .selectAll('.median')
    .attr('x1', 0)
    .attr('x2', dimensions.boundedWidth)
    .attr('y1', yScale(medianSpending))
    .attr('y2', yScale(medianSpending))

  const medianLabel = bounds
    .append('text')
    .attr('x', dimensions.boundedWidth)
    .attr('y', yScale(medianSpending))
    .text('Median')
    .attr('fill', '#71BFD3')
    .style('font-size', '12px')
    .style('text-anchor', 'end')

  // 7. Set up interactions
  const listeningRect = bounds.append("rect")
    .attr("class", "listening-rect")
    .attr("width", dimensions.boundedWidth)
    .attr("height", dimensions.boundedHeight)
    .on("mousemove", onMouseMove)
    .on("mouseleave", onMouseLeave);

  const tooltip = d3.select('#tooltip');
  function onMouseMove(e, d) {
    const mousePos = d3.pointer(e)
    const hoveredDate = xScale.invert(mousePos[0])
    const formatDate = d3.timeFormat("%Y")
    const getDistanceFromHoveredDate = d => Math.abs(
      xAccessor(d) - hoveredDate)
    const closestIndex = d3.leastIndex(dataset, (a, b) => (
      getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    ))
    // console.log(closestIndex);
    const closestDataPoint = dataset[closestIndex]
    const closestXValue = xAccessor(closestDataPoint)
    const closestYValue = yAccessor(closestDataPoint)
    tooltip.select("#upper_line")
      .text(formatDate(closestXValue))
    const formatTemperature = d => `₽${d3.format(".1f")(d)}B`
    tooltip.select("#lower_line")
      .html(formatTemperature(closestYValue))

    //example for text-bg
    //       bounds.append('text')
    // .attr('class', 'test')
    // .style('stroke', 'rgb(255, 255, 255)')
    // .text('Medifdfdsfdsan')

    // bounds.append('text')
    // .attr('class', 'test')
    // // .style('stroke', 'rgb(255, 255, 255)')
    // .text('Medifdfdsfdsan')

    const x = xScale(closestXValue)
      + dimensions.margin.left*.7
    const y = yScale(closestYValue)
      + dimensions.margin.top
    tooltip.style("transform", `translate(`
      + `calc( -36% + ${x+ window.innerWidth*.1}px),`
      + `calc(-100% + ${y}px)`
      + `)`)
    tooltipCircle
      .attr("cx", xScale(closestXValue))
      .attr("cy", yScale(closestYValue))
      .style("opacity", 1)
    tooltip.style('opacity', 1);
    // console.log(e.currentTarget)
  };
  function onMouseLeave() {
    tooltip.style("opacity", 0)
    tooltipCircle.style("opacity", 0)
  };
  const tooltipCircle = bounds.append("circle")
    .attr("r", 4)
    .attr("stroke", "#245885")
    .attr("fill", "white")
    .attr("stroke-width", 2)
    .style("opacity", 0)
}
drawLineChart()
