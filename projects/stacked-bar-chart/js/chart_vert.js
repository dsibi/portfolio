//1. Access data
async function drawChart() {
    //? dataset?
    const pathToData = './data/chart1.csv'
    let dataset = await d3.dsv(";", pathToData)
    const xAccessor = d => d.name;
    // const yAccessor = d => +d.points;
    // console.log(dataset);
    // console.log(xAccessor(dataset[0]));
    // console.log(yAccessor(dataset[0]));

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

    bounds.append('g').attr('class', 'bars')
    bounds.append('g')
        .attr('class', 'x-axis')
        .style('transform', `translateY(${dimensions.boundedHeight}px)`)
        .append('text')
        .attr('class', 'x-axis-label')

    //4. Create scales
    const xScale = d3.scaleBand()
        .domain(dataset.map(function (d) { return d.name; }))
        .range([0, dimensions.boundedWidth]);

    const yScale = d3.scaleLinear()
        // .domain([0, d3.max(dataset, yAccessor)])
        //? variable?
        .domain([0, 60])
        .range([dimensions.boundedHeight, 0])
        .nice();
    // console.log("xScale.domain()[3]", xScale.domain()[3]);
    // console.log("xScale.domain()", xScale.domain());
    // console.log("xScale.range()", xScale.range());
    // console.log("xScale(xAccessor(dataset[4]))", xScale(xAccessor(dataset[4])));
    // console.log("yScale.domain()", yScale.domain());
    // console.log("yScale.range()", yScale.range());
    // console.log("yScale(0)", yScale(0));
    // console.log("yScale(18)", yScale(18));
    let list = ['Этап 1', 'Этап 2'];

    let colorScale = d3.scaleOrdinal()
        .domain([list])
        .range(["red", "yellow"]);

    // //5. Draw data
    let stackGen = d3.stack().keys(list);
    let stackedSeries = stackGen(dataset);
    // console.log(stackedSeries);
    // console.log(stackedSeries[0][0]);
    // console.log(stackedSeries[0][0][1]);

    let sel = bounds
        .select('g')
        .selectAll('g.series')
        .data(stackedSeries)
        .join('g')
        .classed('series', true)
        .style('fill', (d) => colorScale(d.key));

    sel.selectAll('rect')
        .data((d) => d)
        .join('rect')
        .attr('width', 40)
        .attr('y', function (d) {
            // console.log(d);
            // console.log(yScale(d[1]));
            return yScale(d[1]);
        })
        .attr('x', (d) => xScale(d.data.name))
        .attr('height', function (d) {
            console.log(d);
            // console.log(yScale(d[1]));
            return yScale(d[0]) - yScale(d[1])
        });

    // // Add labels to bins with relevant days only; no need to call a 0 label - the bar will be empty
    // const barText = binGroups
    //     .filter(yAccessor)
    //     .append('text')
    //     // Center the label horizontally above the bar
    //     .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
    //     // Shift text up by 5 pixels to add a little gap
    //     .attr('y', d => yScale(yAccessor(d)) - 5)
    //     .text(yAccessor)
    //     // Use text-anchor to horizontally align our text instead of compensating for width
    //     .style('text-anchor', 'middle')
    //     // Color and style
    //     .attr('fill', 'darkgrey')
    //     .style('font-size', '12px')
    //     .style('font-family', 'sans-serif')

    // const mean = d3.mean(dataset, xAccessor)

    // const meanLine = bounds
    //     .selectAll('.mean')
    //     .attr('x1', xScale(mean))
    //     .attr('x2', xScale(mean))
    //     .attr('y1', 25)
    //     .attr('y2', dimensions.boundedHeight)

    // const meanLabel = bounds
    //     .append('text')
    //     .attr('x', xScale(mean))
    //     .attr('y', 15)
    //     .text('mean')
    //     .attr('fill', 'maroon')
    //     .style('font-size', '12px')
    //     .style('text-anchor', 'middle')

    // //6. Draw peripherals
    const xAxisGenerator = d3.axisBottom().scale(xScale)

    const xAxis = bounds.select('.x-axis').call(xAxisGenerator)

    const xAxisLabel = xAxis
        .select('.x-axis-label')
        .attr('x', dimensions.boundedWidth / 2)
        .attr('y', dimensions.margin.bottom - 3)

    // //7. Set up interactions
    // // Since we need to update our tooltip text and position when we hover over a bar, we need to use event listeners
    // binGroups
    //     .select('rect')
    //     .on('mouseover', onMouseOver)
    //     .on('mouseout', onMouseOut)

    // const tooltip = d3.select("#tooltip")
    // function onMouseOver(e, datum) {
    //     const formatHumidity = d3.format(',')

    //     tooltip.select("#upper_line")
    //         .text(`${[formatHumidity(datum.x0), formatHumidity(datum.x1)].join(" - ")} million hectares`)

    //     tooltip.select("#lower_line").text(`Frequency: ${yAccessor(datum)}`)

    //     const xPositionOfBarInChart = xScale(datum.x0)
    //     const widthOfBarInChart = xScale(datum.x1) - xScale(datum.x0)
    //     const boundsMarginOfShiftToRight = dimensions.margin.left
    //     const x = xPositionOfBarInChart + (widthOfBarInChart / 2) + boundsMarginOfShiftToRight * .85
    //     const yPositionOfBarInChart = yScale(yAccessor(datum))
    //     const boundsMarginOfShiftDown = dimensions.margin.top
    //     const y = yPositionOfBarInChart + boundsMarginOfShiftDown
    //     tooltip.style("transform", `translate(calc(-50% + ${x + window.innerWidth * .25}px), calc(-100% + ${y}px))`)
    //     tooltip.style("opacity", 1)
    // }
    // function onMouseOut(e, datum) {
    //     tooltip.style("opacity", 0)
    // }
}

drawChart();