// #ticksPadding #d3.group #ststs #tspan #extent #tooltip

async function drawBoxPlot() {

    // 1. Data Access
    const pathToCSV = './data/ultra_c.csv';
    let dataset = await d3.dsv(",", pathToCSV);

    let skatersByElements = Array.from(
        d3.group(dataset, d => d.name_eng), ([key, value]) => ({ key, value })
    );

    const xAccessor = d => d.name_eng;
    const yAccessor = d => +d.scores_of_panel;

    const skatersByElementsWithStats = skatersByElements.map((skater, idx) => {
        const skaterYValues = skater.value.map(yAccessor).sort((a, b) => a - b);
        const q1 = d3.quantile(skaterYValues, 0.25);
        const median = d3.median(skaterYValues);
        const q3 = d3.quantile(skaterYValues, 0.75);
        const iqr = q3 - q1;
        const [min, max] = d3.extent(skaterYValues);
        const rangeMin = d3.max([min, q1 - iqr * 1.5]);
        const rangeMax = d3.min([max, q3 + iqr * 1.5]);
        const outliers = skater.value.filter(d => yAccessor(d) < rangeMin || yAccessor(d) > rangeMax);
        const i = idx;

        return {
            ...skater,
            skater: skater.key, q1, median, q3, iqr, min, max, rangeMin, rangeMax, outliers, idx
        }
    });
    // console.log(skatersByElementsWithStats);

    // 2. Chart Dimensions
    const width = 1300;
    let dimensions = {
        width: width,
        height: width * 0.3,
        margin: {
            top: 50,
            right: 50,
            bottom: 30,
            left: 150,
        },
    };
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // 3. Draw Canvas

    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

    // 4. Create Scales
    //  Show the X scale
    const skaters = [...new Set(dataset.map(xAccessor))].sort();
    const xScale = d3.scaleBand()
        .range([0, dimensions.boundedWidth])
        .domain(skaters)
        .paddingInner(1)
        .paddingOuter(.5);

    // Show the Y scale
    const yScale = d3.scaleLinear()
        // .domain([0, d3.max(dataset, yAccessor)])
        .domain(d3.extent(dataset, yAccessor))
        .range([dimensions.boundedHeight, 0]);

    // const xScale = d3.scaleBand()
    //     .domain(skaters)
    //     .range([0, dimensions.boundedWidth]);
    // const yScale = d3.scaleLinear()
    //     .domain([
    //         0,
    //         d3.max(dataset, yAccessor),
    //     ])
    //     .range([dimensions.boundedHeight, 0])
    //     .nice();
    // const skaterAccessor = d => d.skater;
    // const binsGenerator = d3.bin()
    //     .value(skaterAccessor)
    //     .thresholds(skaters.length);
    // // console.log(binsGenerator.value()()[3]);
    // // console.log(binsGenerator.thresholds()());
    // const bins = binsGenerator(skatersByElementsWithStats);

    // 7. Set Up Interactions

    // -1- Create a tooltip div that is hidden by default:
    let tooltip = d3.select("#wrapper")
        .append("div")
        .attr("class", "tooltip")

    // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
    const formatData = d => d3.format(".2f")(d)
    let showMedian = function (e, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html("Median: " + formatData(d.median))
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let moveMedian = function (e, d) {
        tooltip
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let hideMedian = function (d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    let showIqr = function (e, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html('50% of marks: ' + formatData(d.q1) + '-' + formatData(d.q3))
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let moveIqr = function (e, d) {
        tooltip
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let hideIqr = function (d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    let showMin = function (e, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html('Min mark: ' + formatData(d.min))
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let moveMin = function (e, d) {
        tooltip
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let hideMin = function (d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    let showMax = function (e, d) {
        tooltip
            .transition()
            .duration(200)
        tooltip
            .style("opacity", 1)
            .html('Max mark: ' + formatData(d.max))
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let moveMax = function (e, d) {
        tooltip
            .style("left", (d3.pointer(e)[0]) + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let hideMax = function (d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    let moveOutliers = function (e, d) {
        const mousePos = d3.pointer(e);
        const hoveredSkater = xScale(xAccessor(d));
        tooltip
            .style("opacity", 1)
            .html('Outlier')
            .style("left", hoveredSkater + dimensions.margin.left + 70 + "px")
            .style("top", (d3.pointer(e)[1]) + 5 + "px")
    }
    let hideOutliers = function (d) {
        tooltip
            .transition()
            .duration(200)
            .style("opacity", 0)
    }

    // 5. Draw Data
    let boxWidth = 100;
    let boxWhisker = boxWidth * .1
    // Show the main vertical line
    const boundsSelection = bounds.selectAll("bounds")
        .data(skatersByElementsWithStats)
        .enter()
    boundsSelection.append("line")
        .attr('class', 'vertLines')
        .attr("x1", function (d) { return (xScale(d.key)) })
        .attr("x2", function (d) { return (xScale(d.key)) })
        .attr("y1", function (d) { return (yScale(d.rangeMin)) })
        .attr("y2", function (d) { return (yScale(d.rangeMax)) })

    boundsSelection.append("line")
        .attr("class", "horMinLines")
        .attr("x1", d => xScale(d.key) - boxWhisker)
        .attr("x2", d => xScale(d.key) + boxWhisker)
        .attr("y1", d => yScale(d.rangeMin))
        .attr("y2", d => yScale(d.rangeMin))
        .clone()
        .attr('stroke-opacity', 0).attr('stroke-width', 10)
        .on("mouseover", showMin)
        .on("mousemove", moveMin)
        .on("mouseleave", hideMin)

    boundsSelection.append("line")
        .attr("class", "horMaxLines")
        .attr("x1", d => xScale(d.key) - boxWhisker)
        .attr("x2", d => xScale(d.key) + boxWhisker)
        .attr("y1", d => yScale(d.rangeMax))
        .attr("y2", d => yScale(d.rangeMax))
        .clone()
        .attr('stroke-opacity', 0).attr('stroke-width', 10)
        .on("mouseover", showMax)
        .on("mousemove", moveMax)
        .on("mouseleave", hideMax)

    // rectangle for the main box
    boundsSelection.append("rect")
        .attr('class', 'boxes')
        .attr("x", function (d) { return (xScale(d.key) - boxWidth / 2) })
        .attr("y", function (d) { return (yScale(d.q3)) })
        .attr("height", function (d) { return (yScale(d.q1) - yScale(d.q3)) })
        .attr("width", boxWidth)
        .on("mouseover", showIqr)
        .on("mousemove", moveIqr)
        .on("mouseleave", hideIqr)

    // Show the median
    boundsSelection.append("line")
        .attr('class', 'medianLines')
        .attr("x1", function (d) { return (xScale(d.key) - boxWidth / 2) })
        .attr("x2", function (d) { return (xScale(d.key) + boxWidth / 2) })
        .attr("y1", function (d) { return (yScale(d.median)) })
        .attr("y2", function (d) { return (yScale(d.median)) })
        .clone()
        .attr('stroke-opacity', 0).attr('stroke-width', 10)
        .on("mouseover", showMedian)
        .on("mousemove", moveMedian)
        .on("mouseleave", hideMedian)

    // Show the outliers
    boundsSelection.append("g")
        .attr("transform", d => `translate(${xScale(d.key) + boxWidth / 2 - boxWidth / 2}, 0)`)
        .selectAll("circle")
        .data(d => d.outliers)
        .enter().append("circle")
        .attr("class", "outlier")
        .attr("cy", d => yScale(yAccessor(d)))
        .attr("r", 2)
        .clone()
        .attr('opacity', 0).attr("r", 5)
        .on("mousemove", moveOutliers)
        .on("mouseleave", hideOutliers)

    // // 6. Draw Peripherals

    boundsSelection.append("text")
        .attr("class", "label")
        .attr("transform", d => `translate(${xScale(d.key)}, -15)`)
        .call(function (t) {
            t.each(function (d) {
                let self = d3.select(this);
                let splitName = d.key.split(' ');  // get the text and split it
                self.append("tspan") // insert two tspans
                    .attr("x", 0)
                    .attr("dy", -10)
                    .text(splitName[0]);
                self.append("tspan")
                    .attr("x", 0)
                    .attr("dy", "1.2em")
                    .text(splitName[1]);
            })
        });

    // bounds.append("g").call(d3.axisLeft(yScale));
    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
    // .tickPadding([8]);

    const yAxis = bounds.append("g")
        .attr("class", "y-axis")
        .call(yAxisGenerator);

    const yAxisLabel = yAxis.append("text")
        .attr("class", "y-axis-label")
        .attr("x", -dimensions.boundedHeight / 2)
        .attr("y", -dimensions.margin.left + 120)
        .html("Points");
}

drawBoxPlot();