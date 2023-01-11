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

d3.dsv(";", "./data/chart.csv").then(function (data) {

    // group the data: I want to draw one line per group
    const sumstat = d3.group(data, d => d.name_rus)
    // nest function allows to group the calculation per level
    // of a factor
    console.log(sumstat);

    let metrics = Array.from(
        d3.group(data, d => d.name_rus), ([key, value]) => ({ key, value })
    );
    //   console.log(metrics);

    // What is the list of groups?
    allKeys = new Set(data.map(d => d.name_rus))
    // console.log(allKeys);

    // Add an svg element for each group. The will be one beside each other and will go on the next row when no more room available
    const svg = d3.select("#wrapper")
        .selectAll("uniqueChart")
        .data(sumstat)
        .enter()
        .append("svg")
        .attr("width", dimensions.boundedWidth + dimensions.margin.left + dimensions.margin.right)
        .attr("height", dimensions.boundedHeight + dimensions.margin.top + dimensions.margin.bottom)
        .append("g")
        .attr("transform",
            `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    const xScale = d3.scaleSequential()
        .domain(d3.extent(data, function (d) { return +d.element_number; }))
        .range([0, dimensions.boundedWidth])
    const xAxisGenerator = d3.axisBottom()
        .scale(xScale);
    const xAxis = svg.append('g')
        .attr('class', 'xAxis')
        .call(xAxisGenerator)
        .style("transform", `translateY(${dimensions.boundedHeight}px)`);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return +d.scores_of_panel; })])
        .range([dimensions.boundedHeight, 0])
        .nice();
    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
        .ticks(4);
    const yAxis = svg.append('g')
        .attr('class', 'yAxis')
        .call(yAxisGenerator);

    const colorScale = d3.scaleSequential()
        .domain(d3.extent(data, function (d) { return +d.grade_of_execution; }))
        // .interpolator(d3.interpolatePiYG);
        .range(['#F79CD4', '#0FCFC0'])

    const minLegVal = colorScale.domain()[0];
    const maxLegVal = colorScale.domain()[1];

    // svg
    //     .append("path")
    //     .attr("fill", "none")
    //     .attr("stroke", 'blue')
    //     .attr("stroke-width", 1.9)
    //     .attr("d", function (d) {
    //         // console.log(x(d.year))

    //         return d3.line()
    //             .x(function (d) {
    //                 // console.log(xScale(d.element_number))
    //                 return xScale(+d.element_number);
    //             })
    //             .y(function (d) { return yScale(+d.scores_of_panel); })
    //             (d[1])
    //     })

    svg.append('circle')
        .attr('cx', function (d) {
            console.log(d[1]);
            return xScale(+d.element_number)
        })
        .attr('cy', d => yScale(+d.scores_of_panel))
        .attr('r', 6)
        .attr("fill", d => colorScale(+d.grade_of_execution));
});