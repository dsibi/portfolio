async function drawPie() {

    // 1. Access data
    const pathToCSV = './data/pres.csv'
    let dataset = await d3.dsv(";", pathToCSV)

    // 2. Create chart dimensions

    const width = 500
    let dimensions = {
        width: width,
        height: width,
        margin: {
            top: 60,
            right: 60,
            bottom: 60,
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

    const arcGenerator = d3.pie()
        .padAngle(0.005)
        .value(d => d.quant)

    const arcs = arcGenerator(dataset)

    const interpolateWithSteps = numberOfSteps => new Array(numberOfSteps).fill(null).map((d, i) => i / (numberOfSteps - 1))
    const colorScale = d3.scaleOrdinal()
        .domain(arcs.sort((a, b) => a.data.quant - b.data.quant).map(d => d.data.goods))
        .range(interpolateWithSteps(dataset.length).map(d3.interpolateLab("#a1d76a", "#e9a3c9")))

    const radius = dimensions.boundedWidth / 2
    const arc = d3.arc()
        .innerRadius(radius * 0.7) // set to 0 for a pie chart
        .outerRadius(radius)

    // 5. Draw data

    const centeredGroup = bounds.append("g")
        .attr("transform", `translate(${dimensions.boundedHeight / 2}, ${dimensions.boundedWidth / 2})`)

    centeredGroup.selectAll("path")
        .data(arcs)
        .enter().append("path")
        .attr("fill", d => colorScale(d.data.goods))
        .attr("d", arc)
        .append("title")
        .text(d => d.data.goods)

    const iconGroups = centeredGroup.selectAll("---")
        .data(arcs)
        .enter().append("g")
        .attr("transform", d => `translate(${arc.centroid(d)})`)

    let icon = iconGroups.append("g")
        .attr('id', (d, i) => `icon_${d.data.goods}`);

    function iconPosition(iconItem) {
        if (iconItem.goods == 'clothes') { return `translate(-14, -20) scale(0.45)` }
        else if (iconItem.goods == 'trips') { return `translate(-13, -23) scale(0.45)` }
        else if (iconItem.goods == 'jewelry') { return `translate(-9, -23) scale(0.45)` }
        else if (iconItem.goods == 'cosmetics') { return `translate(-9 , -21) scale(0.45)` }
        else { return `translate(-11, -20) scale(0.45)` }
    };

    // switch

    let goodsNames = Object.keys(iconPaths);

    for (let index = 0; index < goodsNames.length; index++) {
        let currentData = iconPaths[goodsNames[index]];
        if (Array.isArray(currentData))
            for (let j = 0; j < currentData.length; j++) {
                d3.select(`#icon_${goodsNames[index]}`).append('path').attr("d", currentData[j]).attr("transform", d => iconPosition(d.data))
            }
        else d3.select(`#icon_${goodsNames[index]}`).append('path').attr("d", currentData).attr("transform", d => iconPosition(d.data));
    }

    // 6. Draw peripherals

    bounds.append("text")
        .attr("class", "title")
        .text("Presents Rating")
        .attr("transform", `translate(${dimensions.boundedWidth / 2}, ${dimensions.boundedHeight / 2})`)

    bounds.append("text")
        .attr("class", "title-small")
        .text("For New Year 2023")
        .attr("transform", `translate(${dimensions.boundedWidth / 2}, ${dimensions.boundedHeight / 2 + 30})`)

    iconGroups.append("text")
        .attr("class", "label")
        .text(d => `${d.data.quant}%`)
        .attr("transform", d => `translate(0, 20)`)

}

drawPie();