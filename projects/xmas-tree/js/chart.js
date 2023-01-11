const wrapper = d3.select("svg");

const bounds = wrapper.append("g");

const path = "M0,0v500h400V0H0z M209.829,388.311c1.674,15.667,3.349,31.333,5.023,47c-8.648,0-14.206,0-22.027,0c-0.927,0-2.901,0-6.855,0c1.674-15.667,3.349-31.333,5.023-47c-20.983,3.438-48.787,5.599-72.832,5c3.767-4,7.534-8,11.302-12c-2.093-0.333-4.186-0.667-6.279-1c2.511-3,5.023-6,7.534-9c-2.093-0.667-4.186-1.333-6.279-2c5.86-6.667,11.72-13.333,17.58-20c-4.423,0.843-14.313-4.529-15.069-7c17.198-14.16,20.837-18.337,20.092-19.001c-0.956,0.056-7.577-0.091-8.79-0.999c7.534-8.333,15.069-16.667,22.603-25c-4.475,0.009-12.757-2.057-16.324-4c2.511-2.667,5.023-5.333,7.534-8c-2.691,0.71-9.534-0.633-11.302-2c11.524-6.708,28.533-30.176,30.137-42c-2.085,1.546-13.224,1.565-16.324-1c4.419-3.308,10.859-11.783,12.557-17c-2.093,0-4.186,0-6.279,0c6.763-8.189,14.55-20.531,18.836-30c-3.426,1.213-12.581,1.301-16.324,0c7.856-8.389,17.658-24.191,21.347-35c-3.349,0-6.697,0-10.046,0c2.511-3.333,5.023-6.667,7.534-10c-3.349-0.333-6.697-0.667-10.046-1c8.684-6.559,19.713-27.534,19.464-37.5c-3.349,0.333-6.697,0.667-10.046,1c9.32-9.188,18.216-31.014,18.836-43.356c-0.047-0.937-0.052-1.826,0-2.644c0.052,0.818,0.047,1.707,0,2.644c0.62,12.343,9.514,34.166,18.836,43.356c-3.349-0.333-6.697-0.667-10.046-1c-0.25,9.962,10.78,30.944,19.464,37.5c-3.349,0.333-6.697,0.667-10.046,1c2.511,3.333,5.023,6.667,7.534,10c-3.349,0-6.697,0-10.046,0c3.688,10.807,13.492,26.613,21.347,35c-3.742,1.3-12.9,1.213-16.324,0c4.285,9.468,12.074,21.812,18.836,30c-2.093,0-4.186,0-6.279,0c1.697,5.215,8.14,13.693,12.557,17c-3.097,2.564-14.24,2.547-16.324,1c1.602,11.819,18.614,35.295,30.137,42c-1.768,1.367-8.61,2.71-11.302,2c2.511,2.667,5.023,5.333,7.534,8c-3.568,1.943-11.849,4.009-16.324,4c7.534,8.333,15.069,16.667,22.603,25c-1.235,0.893-7.805,1.086-8.79,1c-0.746,0.663,2.893,4.84,20.091,18.999c-0.748,2.485-10.65,7.83-15.068,7.001c5.86,6.667,11.72,13.333,17.58,20c-2.093,0.667-4.186,1.333-6.279,2c2.511,3,5.023,6,7.534,9c-2.093,0.333-4.186,0.667-6.279,1c3.767,4,7.534,8,11.302,12C258.625,393.91,230.801,391.748,209.829,388.311z"

const listeningPath = bounds.append("path")
    .attr("class", "listening-path")
    .attr("d", path)
    .style("transform", "translate(-118.2px,-65px)")

d3.select("#p1_5")
    .on("mousemove", function () {
        d3.select('#jewelry')
            .attr('display', 'block')
    })
    .on("mouseleave", function () {
        d3.select('#jewelry')
            .attr('display', 'none')
    });

d3.select("#p2_5")
    .on("mousemove", function () {
        d3.select('#trips')
            .attr('display', 'block')
    })
    .on("mouseleave", function () {
        d3.select('#trips')
            .attr('display', 'none')
    });

d3.select("#p3_5")
    .on("mousemove", function () {
        d3.select('#money')
            .attr('display', 'block')
    })
    .on("mouseleave", function () {
        d3.select('#money')
            .attr('display', 'none')
    });

d3.select("#p4_5")
    .on("mousemove", function () {
        d3.select('#clothes')
            .attr('display', 'block')
    })
    .on("mouseleave", function () {
        d3.select('#clothes')
            .attr('display', 'none')
    });

d3.select("#p5_5")
    .on("mousemove", function () {
        d3.select('#cosmetics')
            .attr('display', 'block')
    })
    .on("mouseleave", function () {
        d3.select('#cosmetics')
            .attr('display', 'none')
    });

const tooltip = d3.select('#tooltip');
function onMouseMove(e, d) {
    const mousePos = d3.pointer(e)
    const hoveredX = mousePos[0]
    //   const formatDate = d3.timeFormat("%d.%m.%Y")
    //   const getDistanceFromHoveredDate = d => Math.abs(
    //     xAccessor(d) - hoveredDate)
    //   const closestIndex = d3.leastIndex(datasetWeeks, (a, b) => (
    //     getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
    //   ))
    //   const closestDataPoint = datasetWeeks[closestIndex]
    //   const closestXValue = closestDataPoint
    // console.log(mousePos);
    d3.select('#p1_5')
        // .attr('mask', 'url(#mask)')
        .attr('fill', 'blue')
    //   const closestYValue = yAccessorLine(closestDataPoint)
    console.log(this);
    tooltip.select("#upper_line")
        .text(d3.select('#tooltip'))
    //   const formatHours = d => `Avg Week Hours: ${d3.format(".1f")(d)}`
    //   tooltip.select("#lower_line")
    //     .html(formatHours(closestYValue))

    //   const x = xScale(closestXValue)
    //     + dimensions.margin.left * .7
    //   const y = yScale(closestYValue)
    //     + dimensions.margin.top
    tooltip.style("transform", `translate(`
        + `calc( -36% + ${500 + window.innerWidth * .1}px),`
        + `calc(-100% + ${-100}px)`
        + `)`)
    //   tooltipCircle
    //     .attr("cx", xScale(closestXValue))
    //     .attr("cy", yScale(closestYValue))
    //     .style("opacity", 1)
    tooltip.style('opacity', 1);
};
function onMouseLeave() {
    tooltip.style("opacity", 0)
    d3.select('#p1_5')
        .attr('fill', "#FFBD00")
};