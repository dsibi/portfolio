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

    const ministersData = [
        {
            name: 'Sergei Shoigu',
            start: new Date('2012-11-06'),
            end: new Date('2021-01-01'),
        },
        {
            name: 'Anatoly Serdyukov',
            start: new Date('2007-02-15'),
            end: new Date('2012-11-06'),
        },
        {
            name: 'Sergei Ivanov',
            start: new Date('2006-01-01'),
            end: new Date('2007-02-15'),
        },
    ];
    const ministerAccessor = d => d.name;

    // 2. Create chart dimensions
    let dimensions = {
        width: document.getElementById('wrapper').offsetWidth,
        height: 250,
        margin: {   
            top: 10,
            right: 25,
            bottom: 25,
            left: 40,
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

    //Color scale
    var colorScale = d3.scaleOrdinal()
        .domain(d3.extent(ministersData, ministerAccessor))
        .range(d3.schemeSet2);

    // 5. Draw data
    //areas
    const ministers = bounds.selectAll('.ministers')
        .data(ministersData)
        .enter().append('rect')
        .attr('x', d => xScale(d.start))
        .attr('width', d => xScale(d.end) - xScale(d.start))
        .attr('y', 0)
        .attr('height', dimensions.boundedHeight)
        .attr("class", d => `minister ${d.name}`)
        .style("fill", d => colorScale(d.name))
        .style("opacity", .3);

    //graph
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

    const medianLine = bounds.selectAll('.median')
        .attr('x1', 0)
        .attr('x2', dimensions.boundedWidth)
        .attr('y1', yScale(medianSpending))
        .attr('y2', yScale(medianSpending))

    const medianLabel = bounds.append('text')
        .attr('x', dimensions.boundedWidth)
        .attr('y', yScale(medianSpending))
        .text('Median')
        .attr('fill', '#71BFD3')
        .style('font-size', '12px')
        .style('text-anchor', 'end')

    const ministerNames = bounds.selectAll(".minister-name")
        .data(ministersData)
        .enter().append("text")
        // .attr("x", d => xScale(d.start) + ((xScale(d.end) - xScale(d.start)) / 2))
        .attr("x", -10)
        .attr("y", d => xScale(d.start) + 15)
        .text(d => `${d.name}`)
        .attr("class", "minister-name");

    // 7. Set up interactions
    const listeningRect = bounds.append("rect")
        .attr("class", "listening-rect")
        .attr("width", dimensions.boundedWidth)
        .attr("height", dimensions.boundedHeight)
        .on("mousemove", onMouseMove)
        .on("mouseleave", onMouseLeave);
    let tooltip = bounds.append('g')
        .attr('id', 'tooltip');
    let bg = tooltip.append('text')
        .attr('class', 'bg');
    bg.append('tspan')
        .attr('id', 'ul_bg')
        .attr('x', 0)
        .attr('dy', 0);
    bg.append('tspan')
        .attr('id', 'll_bg')
        .attr('x', 0)
        .attr('dy', 13); //offset from prev line
    let fg = tooltip.append('text')
        .attr('class', 'fg');
    fg.append('tspan')
        .attr('id', 'ul_fg')
        .attr('x', 0)
        .attr('dy', 0);
    fg.append('tspan')
        .attr('id', 'll_fg')
        .attr('x', 0)
        .attr('dy', 13);
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
        const x = xScale(closestXValue)
            + dimensions.margin.left * .7
        const y = yScale(closestYValue)
            + dimensions.margin.top
        tooltip.select('#ul_bg')
            .text(formatDate(closestXValue))
        tooltip.select('#ul_fg')
            .text(formatDate(closestXValue))
        const formatMoney = d => `₽${d3.format(".1f")(d)}B`
        tooltip.select("#ll_bg")
            .text(formatMoney(closestYValue))
        tooltip.select("#ll_fg")
            .text(formatMoney(closestYValue))
        tooltip.style("transform", `translate(`
            + `calc( -4% + ${x + document.getElementById('wrapper').offsetWidth * .0001}px),`
            + `calc( 5% + ${y}px)`
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
