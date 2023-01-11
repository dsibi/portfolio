//1. Access data
async function drawChart() {
  const pathToData = './data/chart_pk_fs_m.csv'
  let dataset = await d3.dsv(";", pathToData)

  function xAccessor(d) { return +d.element_number };
  const yAccessor = d => +d.scores_of_panel;
  const colorAccessor = d => +d.grade_of_execution;
  const el_nameAccessor = d => d.element_name;

  // var uniqueNames = Array.from(new Set(dataset.map(function (d) { return d.name_rus; })));
  // console.log(uniqueNames);

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
  function shiftDomain(accessor, shiftNum) {
    let baseDomain = d3.extent(dataset, accessor);
    baseDomain[0] -= shiftNum;
    baseDomain[1] += shiftNum;
    return baseDomain;
  }

  const xScale = d3.scaleLinear()
    .domain(shiftDomain(xAccessor, 1))
    .range([0, dimensions.boundedWidth])

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(dataset, yAccessor)])
    .range([dimensions.boundedHeight, 0])
    .nice();

  const colorScale = d3.scaleSequential()
    .domain(d3.extent(dataset, colorAccessor))
    // .interpolator(d3.interpolatePiYG);
    .range(['#F79CD4', '#0FCFC0'])

  const minLegVal = colorScale.domain()[0];
  const maxLegVal = colorScale.domain()[1];
  // console.log(minLegVal);

  //5. Draw data
  let dots = bounds.selectAll('circle')
    .data(dataset)
    .enter()
    .append('g')
    .attr('class', 'circles')

  dots.append('circle')
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .attr('r', 6)
    .attr("fill", d => colorScale(colorAccessor(d)));

  //voronoi
  // const delaunay = d3.Delaunay.from(
  //   dataset,
  //   d => xScale(xAccessor(d)),
  //   d => yScale(yAccessor(d))
  // )

  // const voronoi = delaunay.voronoi()
  // voronoi.xmax = dimensions.boundedWidth;
  // voronoi.ymax = dimensions.boundedHeight;
  // bounds.selectAll('.voronoi')
  //   .data(dataset)
  //   .enter()
  //   .append('path')
  //   .attr('class', 'voronoi')
  //   .attr('d', (d, i) => voronoi.renderCell(i))

  //6. Draw peripherals
  //labels
  // dots.append("text")
  //   .attr('class', 'labels')
  //   .attr('x', d => xScale(xAccessor(d)))
  //   .attr('y', d => yScale(yAccessor(d) + 1))
  //   .text(d => d.element_name + d.scores_of_panel);

  dots.append("text")
    .attr('class', 'labels')
    .attr('x', d => xScale(xAccessor(d)))
    .attr('y', d => yScale(yAccessor(d) + 1.5))
    .text(d => d.element_name)
    .each(function (d) {
      this._current = d;
    })
    .append("tspan")
    .attr('class', 'labels_points')
    .attr('x', d => xScale(xAccessor(d)))
    .attr("dy", "1.1em")
    .text(function (d) {
      return d.scores_of_panel;
    })
    .each(function (d) {
      this._current = d;
    });

  arrangeLabels();

  //axes
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

  const xAxisLabel = xAxis.append('text')
    .attr('x', dimensions.boundedWidth / 2)
    .attr('y', dimensions.margin.bottom - 3)
    .attr('fill', 'black')
    .style('font-size', '1.4em')
    .html('Element Number');
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
    .html('Scores of Panel')
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");

  // Map legend
  const legendWidth = 100;
  const legendHeight = 16;
  const legendGroup = wrapper.append('g')
    .attr(
      'transform',
      `translate(${dimensions.width - legendWidth},${dimensions.width < 800
        ? dimensions.boundedHeight * .3
        : dimensions.boundedHeight * 0.1
      })`
    );
  const legendTitle = legendGroup.append('text')
    .attr('y', -23)
    .attr('class', 'legend-title')
    .text('GOE');
  const legendByline = legendGroup.append('text')
    .attr('y', -9)
    .attr('class', 'legend-byline')
    .text('Grade of Execution (for all elements)');
  const defs = wrapper.append('defs');
  const legendGradientId = 'legend-gradient';
  const gradient = defs.append('linearGradient')
    .attr('id', legendGradientId)
    .selectAll('stop')
    .data(colorScale.range())
    .enter()
    .append('stop')
    .attr('stop-color', d => d)
    .attr('offset', (d, i) => `${i * 100}%`);
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

  // .attr("transform", function (d, i) {
  //   let currenty = yScale(yAccessor(d));
  //   if (i > 0) {
  //     let previousy = yScale(yAccessor(dataset[i - 1]))
  //     if (Math.abs(currenty - previousy) < 5) {
  //       currenty - previousy > 0 ?
  //         currenty = currenty - 15 : currenty = currenty + 15
  //     }
  //   }
  //   return "translate(" + 0 + "," + currenty + ")";
  // })

  // function boundsExtension(obj) {
  //   let shiftOffset = 5;
  //   let boundedObj = {
  //     left: obj.left - shiftOffset,
  //     right: obj.right + shiftOffset,
  //     top: obj.top - shiftOffset,
  //     bottom: obj.bottom + shiftOffset
  //   };
  //   return boundedObj;
  // }

  // function arrangeLabels() {
  //   let move = 1;
  //   while (move > 0) {
  //     move = 0;
  //     dots.selectAll(".labels")
  //       .each(function () {
  //         let that = this,
  //           a = boundsExtension(this.getBoundingClientRect());
  //         // console.log(a);
  //         dots.selectAll(".labels")
  //           .each(function () {
  //             if (this != that) {
  //               let b = boundsExtension(this.getBoundingClientRect());
  //               if (((a.left > b.left && a.left < b.right) ||
  //                 (a.right > b.left && a.right < b.right)) &&
  //                 ((a.top < b.bottom && a.top > b.top) ||
  //                   (a.bottom < b.bottom && a.bottom > b.top))) {
  //                 d3.select(this).attr("transform", "translate(" + 0 + "," + -15 + ")")
  //                 // d3.select(that).attr("transform", "translate(" + 0 + "," + 40 + ")")
  //                 // a = boundsExtension(this.getBoundingClientRect());
  //               }
  //             }
  //           });
  //       });
  //   }
  // }

  function arrangeLabels() {
    let move = 1;
    while (move > 0) {
      move = 0;
      dots.selectAll(".labels")
        .each(function () {
          let that = this,
            a = this.getBoundingClientRect();
          // console.log(a);
          dots.selectAll(".labels")
            .each(function () {
              if (this != that) {
                let b = this.getBoundingClientRect();
                if (((a.left > b.left && a.left < b.right) ||
                  (a.right > b.left && a.right < b.right)) &&
                  ((a.top < b.bottom && a.top > b.top) ||
                    (a.bottom < b.bottom && a.bottom > b.top))) {
                  d3.select(this).attr("transform", "translate(" + 0 + "," + -5 + ")")
                  d3.select(that).attr("transform", "translate(" + 0 + "," + 40 + ")")
                  a = this.getBoundingClientRect();
                }
              }
            });
        });
    }
  }



  // const onMouseOut = () => {
  //   tooltip.style("opacity", 0)
  //   d3.selectAll(".tooltipDot").remove();
  // }

  // bounds.selectAll('.voronoi')
  //   .on('mouseover', onMouseOver)
  //   .on('mouseout', onMouseOut)

  // const tooltip = d3.select('#tooltip')

  // function onMouseOver(e, d) {
  //   const dayDot = bounds.append('circle')
  //     .attr('class', 'tooltipDot')
  //     .attr('cx', xScale(xAccessor(d)))
  //     .attr('cy', yScale(yAccessor(d)))
  //     .attr('r', 5)
  //     .style('fill', '#6D398B')
  //     .style('pointer-events', 'none')
  //   tooltip.select("#upper_line")
  //     .text(el_nameAccessor(d));
  //   tooltip.select("#middle_line")
  //     .text(yAccessor(d) + " points");
  //   tooltip.select("#lower_line")
  //     .text(colorAccessor(d) + " GOE");
  //   // vote_average
  //   // const dateParser = d3.timeParse('%Y-%m-%d');
  //   // const formatDate = d3.timeFormat('%B %A %-d, %Y');
  //   // tooltip.select("#date")
  //   //   .text(formatDate(dateParser(d.date)));
  //   const x = xScale(xAccessor(d)) + dimensions.margin.left * .9;
  //   const y = yScale(yAccessor(d)) + dimensions.margin.top;

  //   tooltip.style("transform", `translate(`
  //     + `calc( -50% + ${x + window.innerWidth * .1}px),`
  //     + `calc(-100% + ${y}px)`
  //     + `)`);
  //   tooltip.style("opacity", .9);
  // }
}

drawChart();