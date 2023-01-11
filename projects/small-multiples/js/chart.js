async function drawChart() {
  const pathToData = './data/chart_pk_fs_m.csv';
  let data = await d3.dsv(";", pathToData);
  // console.log(data);

  // put unique segments into the domain e.g. A, B, C
  let uniqueSegments = Array.from(new Set(data.map(function (d) { return +d.element_number; })));

  // group the data
  let metrics = Array.from(
    d3.group(data, d => d.id), ([key, value]) => ({ key, value })
  );
  // console.log(metrics);

  const maxPoints = d3.max(data, d => +d.scores_of_panel);
  // console.log(maxPoints);

  // Set the sizing metrics
  let dimensions = {
    width: 600,
    height: 300,
    margin: {
      top: 60,
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
  let xScale = d3.scaleLinear()
    .range([0, dimensions.boundedWidth])
    .domain(d3.extent(uniqueSegments));
  // console.log(dimensions.boundedWidth);

  let yScale = d3.scaleLinear()
    .range([dimensions.boundedHeight, 0]);

  // create a separate SVG object for each group
  // class each SVG with parameter from metrics
  let svg = d3.select('#wrapper').selectAll('svg')
    .data(metrics)
    .enter()
    .append('svg')
    .attr("class", function (d) { return d.value[0].id; })
    .attr('width', dimensions.width + 15)
    .attr('height', dimensions.height + 40)
  const axes = svg.append('g')
    .attr('class', 'axes')
    .style('transform', `translate(${dimensions.margin.left}px,
      ${dimensions.margin.top}px)`);

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .tickSize(0)
  // .ticks(7);
  .ticks(12);

  const xAxis = axes.append('g')
    .attr('class', 'xAxis')
    .call(xAxisGenerator)
    // .innerTickSize(-h)//for
    .style("transform", `translateY(${dimensions.boundedHeight}px)`);

  const xAxisLabel = xAxis.append('text')
    .attr('class', 'xAxisLabel')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 3)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .html('Номер элемента');

  // const yAxisGenerator = d3.axisLeft()
  //   .scale(yScale)
  //   .ticks(4);

  svg.append("text")
    .attr('class', 'name')
    .attr("y", -40)
    .attr("x", 0)
    .text(function (d) {
      // console.log(d.value[0].name_rus);
      return (d.value[0].name_rus + ' - ' + d.value[0].total_element_score)
    })
    .style('transform', `translate(${dimensions.margin.left}px,
        ${dimensions.margin.top}px)`);

  metrics.forEach(function (d, i) {
    // console.log(d);
    // set yScale domain based on the set of the_value's for these metrics
    yScale.domain([0, maxPoints]);

    const colorScale = d3.scaleSequential()
      .domain(d3.extent(d.value, c => +c.grade_of_execution))
      // .interpolator(d3.interpolatePiYG);
      // .range(['#F79CD4', '#0FCFC0']);
    .range(['#A50026', '#354B99']);
    // console.log(d);
    // console.log(colorScale.domain());

    // select the right svg for this set of metrics
    d3.select("svg." + d.value[0].id)
      .append('g')
      .style('transform', `translate(${dimensions.margin.left}px,
        ${dimensions.margin.top}px)`)
      .selectAll('.circle')
      .data(d.value) // use d.value to get to the the_value
      .enter()
      .append('circle')
      .attr('class', 'circles')
      .attr('cx', c => xScale(+c.element_number))
      .attr('cy', c => yScale(+c.scores_of_panel))
      .attr('r', 6)
      .attr("fill", c => colorScale(+c.grade_of_execution));

    d3.select("svg." + d.value[0].id)
      .append('g')
      .style('transform', `translate(${dimensions.margin.left}px,
        ${dimensions.margin.top}px)`)
      .selectAll('.labels')
      .data(d.value) // use d.value to get to the the_value
      .enter()
      .append("text")
      .attr('class', 'labels')
      .attr('x', c => xScale(+c.element_number))
      .attr('y', c => yScale(+c.scores_of_panel + 2))
      .text(c => c.element_name)
      .each(function (c) {
        this._current = c;
      })
      .append("tspan")
      .attr('class', 'labels_points')
      .attr('x', c => xScale(+c.element_number))
      .attr("dy", "1.1em")
      .text(function (c) {
        return c.scores_of_panel;
      })
      .each(function (c) {
        this._current = c;
      });

    arrangeLabels();

    // Map legend
    const legendWidth = 90;
    const legendHeight = 16;
    const legendGroup = d3.select("svg." + d.value[0].id)
      .append('g')
      .attr(
        'transform',
        `translate(${dimensions.width - legendWidth},${dimensions.width < 800
          ? dimensions.boundedHeight * .1
          : dimensions.boundedHeight * 0.1
        })`
      );
    // const legendTitle = legendGroup.append('text')
    //   .attr('y', -18)
    //   .attr('class', 'legend-title')
    //   .text('GOE');
    const legendByline = legendGroup.append('text')
      .attr('y', -5)
      .attr('class', 'legend-byline')
      .text('GOE (по всем элементам)');
    const defs = svg.append('defs');
    const legendGradientId = 'legend-gradient';
    const gradient = defs.append('linearGradient')
      .attr('id', legendGradientId)
      .selectAll('stop')
      .data(colorScale.range())
      .enter()
      .append('stop')
      .attr('stop-color', c => c)
      .attr('offset', (c, i) => `${i * 100}%`);
    const legendGradient = legendGroup.append('rect')
      .attr('x', -legendWidth / 2)
      .attr('height', legendHeight)
      .attr('width', legendWidth)
      .style('fill', `url(#${legendGradientId})`);
    const legendValueRight = legendGroup.append('text')
      .attr('class', function (c) {
        // console.log(colorScale.domain());
        return 'legend-value'
      })
      .attr('x', legendWidth / 2 + 5)
      .attr('y', legendHeight / 2 + 2)
      .text(`${d3.format('.2f')(colorScale.domain()[1])}`);

    const legendValueLeft = legendGroup.append('text')
      .attr('class', 'legend-value')
      .attr('x', -legendWidth / 2 - 5)
      .attr('y', legendHeight / 2 + 2)
      .text(`${d3.format('.2f')(colorScale.domain()[0])}`)
      .style('text-anchor', 'end');

    d3.selectAll('svg.' + d.value[0].id + ' .tick line')
      .attr("y2", tickCounter => yScale(d.value[tickCounter - 1].scores_of_panel) - dimensions.boundedHeight)
      .attr("stroke", "lightgrey")
      .attr("stroke-dasharray", "4")
      .attr("opacity", ".6");
  });

  function arrangeLabels() {
    let move = 1;
    while (move > 0) {
      move = 0;
      svg.selectAll(".labels")
        .each(function () {
          let that = this,
            a = this.getBoundingClientRect();
          // console.log(a);
          svg.selectAll(".labels")
            .each(function () {
              if (this != that) {
                let b = this.getBoundingClientRect();
                if (((a.left > b.left && a.left < b.right) ||
                  (a.right > b.left && a.right < b.right)) &&
                  ((a.top < b.bottom && a.top > b.top) ||
                    (a.bottom < b.bottom && a.bottom > b.top))) {
                  d3.select(this).attr("transform", "translate(" + 0 + "," + -5 + ")")
                  d3.select(that).attr("transform", "translate(" + 0 + "," + 45 + ")")
                  a = this.getBoundingClientRect();
                }
              }
            });
        });
    }
  }
}

drawChart();