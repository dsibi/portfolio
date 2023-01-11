//1. Access data
async function drawChart() {
  const pathToData = './data/chart.csv'
  let dataset = await d3.dsv(";", pathToData)

  const formatBudget = d3.format(".2f")
  function xAccessor(d) { return +formatBudget(d.budget / 1000000) };
  const yAccessor = d => +d.vote_count;
  const colorAccessor = d => +d.vote_average;
  // console.log(xAccessor(dataset[498]));
  // console.log(typeof xAccessor(dataset[499]));
  // console.log(typeof yAccessor(dataset[0]));

  //2. Create chart dimensions
  // const width = d3.min([window.innerWidth * .9, window.innerHeight * .9]);
  // const width=Math.min(window.innerWidth*.9,window.innerHeight*.9);
  // console.log(width);
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

  //4. Create scales
  function shiftDoimain(accessor, shiftNum) {
    let baseDomain = d3.extent(dataset, accessor);
    baseDomain[0] -= shiftNum;
    return baseDomain;
  }
  const xScale = d3.scaleLog()
    .domain(shiftDoimain(xAccessor, .2))
    .range([0, dimensions.boundedWidth])
  // .nice();
  // console.log(xScale.domain());
  // console.log(xScale.nice());
  const yScale = d3.scaleLog()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();
  // console.log(yScale.domain()[1]);
  // console.log(yScale.range());
  // console.log(yScale(yAccessor(dataset[0])));
  const colorScale = d3.scaleLog()
    .domain(d3.extent(dataset, colorAccessor))
    .range(['#0696BB', '#EA621F']);
  const minLegVal = colorScale.domain()[0];
  const maxLegVal = colorScale.domain()[1];
  // console.log(colorScale.domain());

  //5. Draw data
  let dots = bounds.selectAll('circle')
    .data(dataset)
    .enter()
    .append('circle')
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .attr('r', 3)
    .attr("fill", d => colorScale(colorAccessor(d)));

  //voronoi
  const delaunay = d3.Delaunay.from(
    dataset,
    d => xScale(xAccessor(d)),
    d => yScale(yAccessor(d))
  )

  const voronoi = delaunay.voronoi()
  voronoi.xmax = dimensions.boundedWidth;
  voronoi.ymax = dimensions.boundedHeight;
  bounds.selectAll('.voronoi')
    .data(dataset)
    .enter()
    .append('path')
    .attr('class', 'voronoi')
    .attr('d', (d, i) => voronoi.renderCell(i))

    console.log(delaunay);

  //6. Draw peripherals
  const axes = wrapper.append('g')
    .attr('class', 'axes')
    .style('transform', `translate(${dimensions.margin.left}px,
      ${dimensions.margin.top}px)`);
  const xAxisGenerator = d3.axisBottom()
    .scale(xScale);
  const xAxis = axes.append('g')
    .attr('class', 'xAxis')
    .call(xAxisGenerator)
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);
  // console.log(xAxis._groups[0]);
  const xAxisLabel = xAxis.append('text')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 3)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .html('Budget ($M)');
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4);
  const yAxis = axes.append('g')
    .attr('class', 'yAxis')
    .call(yAxisGenerator);
  const yAxisLabel = yAxis.append('text')
    .attr('x', -dimensions.boundedHeight / 2)
    .attr('y', -dimensions.margin.left + 15)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .html('Vote Count (votes)')
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");
  // console.log(yAxisLabel._groups[0][0]);

  // Map legend
  const legendWidth = 120;
  const legendHeight = 16;
  const legendGroup = wrapper.append('g')
    .attr(
      'transform',
      `translate(${dimensions.width - legendWidth},${dimensions.width < 800
        ? dimensions.boundedHeight - 30
        : dimensions.boundedHeight * 0.8
      })`
    );
  const legendTitle = legendGroup.append('text')
    .attr('y', -23)
    .attr('class', 'legend-title')
    .text('IMDb RATING');
  const legendByline = legendGroup.append('text')
    .attr('y', -9)
    .attr('class', 'legend-byline')
    .text('Weighted average vote (wav)');
  const defs = wrapper.append('defs');
  const legendGradientId = 'legend-gradient';
  const gradient = defs.append('linearGradient')
    .attr('id', legendGradientId)
    .selectAll('stop')
    .data(colorScale.range())
    .enter()
    .append('stop')
    .attr('stop-color', d => d)
    .attr('offset', (d, i) => `${i*100}%`);
  const legendGradient = legendGroup.append('rect')
    .attr('x', -legendWidth / 2)
    .attr('height', legendHeight)
    .attr('width', legendWidth)
    .style('fill', `url(#${legendGradientId})`);
  const legendValueRight = legendGroup.append('text')
    .attr('class', 'legend-value')
    .attr('x', legendWidth / 2 + 8)
    .attr('y', legendHeight / 2)
    .text(`${d3.format('.1f')(maxLegVal)}`);
  const legendValueLeft = legendGroup.append('text')
    .attr('class', 'legend-value')
    .attr('x', -legendWidth / 2 - 8)
    .attr('y', legendHeight / 2)
    .text(`${d3.format('.1f')(minLegVal)}`)
    .style('text-anchor', 'end');

  //7. Set up interactions
  const onMouseOut = () => {
    tooltip.style("opacity", 0)
    d3.selectAll(".tooltipDot").remove();
  }

  bounds.selectAll('.voronoi')
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut)

  const tooltip = d3.select('#tooltip')

  function onMouseOver(e, d) {
    const dayDot = bounds.append('circle')
      .attr('class', 'tooltipDot')
      .attr('cx', xScale(xAccessor(d)))
      .attr('cy', yScale(yAccessor(d)))
      .attr('r', 5)
      .style('fill', '#6D398B')
      .style('pointer-events', 'none')
    const formatDataX = d3.format(".0f");
    tooltip.select("#upper_line")
      .text(d.original_title);
    tooltip.select("#middle_line")
      .text("Budget: $" + formatDataX(xAccessor(d)) + "M");
    const formatDataY = d3.format(',');
    tooltip.select("#lower_line")
      .text(formatDataY(yAccessor(d)) + " votes, " + colorAccessor(d) + " wav");
      // vote_average
    // const dateParser = d3.timeParse('%Y-%m-%d');
    // const formatDate = d3.timeFormat('%B %A %-d, %Y');
    // tooltip.select("#date")
    //   .text(formatDate(dateParser(d.date)));
    const x = xScale(xAccessor(d)) + dimensions.margin.left * .9;
    const y = yScale(yAccessor(d)) + dimensions.margin.top;
    // console.log(x);
    tooltip.style("transform", `translate(`
      + `calc( -50% + ${x + window.innerWidth * .1}px),`
      + `calc(-100% + ${y}px)`
      + `)`);
    // console.log(e.currentTarget)
    tooltip.style("opacity", .9);
  }
}

drawChart();