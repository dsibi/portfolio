async function drawRadar() {

    // 1. Access data
    const pathToData = './data/radar.csv';
    let dataset = await d3.dsv(";", pathToData);

    // group the data
  let judge = Array.from(
    d3.group(dataset, d => d.id), ([key, value]) => ({ key, value })
  );

    const metrics = [
        "3A",
        "3Lz+3T",
        "FCSp4",
        "3F",
        "LSp3",
        "StSq3",
        "CCoSp4",
    ];

    // for (let index = 0; index < metrics.length; index++) {
    //     dataset = dataset.map(function (item) {
    //         item[metrics[index]] = parseInt(item[metrics[index]], 10)
    //         return item;
    //     });
    // };

    const judgeAccessor = d => d.judges;
    // dataset = dataset.sort((a, b) => judgeAccessor(a) < judgeAccessor(b));

    // 2. Create chart dimensions

    const width = 400;
    let dimensions = {
        width: width,
        height: width,
        radius: width / 2,
        margin: {
            top: 80,
            right: 80,
            bottom: 80,
            left: 80,
        },
    }
    dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
    dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom
    dimensions.boundedRadius = dimensions.radius - ((dimensions.margin.left + dimensions.margin.right) / 2)

    // 3. Draw canvas

    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

    // 4. Create scales

    const metricScales = metrics.map(metric => (
        d3.scaleLinear()
            .domain([0, 5])
            .range([0, dimensions.boundedRadius])
            .nice()
    ))

    // 6. Draw peripherals
    // We're drawing our axes early here so they don't overlap our radar line
    const NUM_OF_LEVEL = 5;
    const genTicks = levels => {
        const ticks = [];
        const step = 5 / levels;
        for (let i = 0; i <= levels; i++) {
            const num = step * i;
            if (Number.isInteger(step)) {
                ticks.push(num);
            }
            else {
                ticks.push(num.toFixed(2));
            }
        }
        return ticks;
    };

    const ticks = genTicks(NUM_OF_LEVEL);

    const axis = bounds.append("g")

    const gridCircles = d3.range(6).map((d, i) => (
        axis.append("circle")
            .attr("cx", dimensions.boundedRadius)
            .attr("cy", dimensions.boundedRadius)
            .attr("r", dimensions.boundedRadius * (i / 5))
            .attr("class", "grid-line")
    ));

    const gridLines = metrics.map((metric, i) => {
        const angle = i * ((Math.PI * 2) / metrics.length) - Math.PI * 0.5
        return axis.append("line")
            .attr("x1", dimensions.boundedWidth / 2)
            .attr("x2", Math.cos(angle) * dimensions.boundedRadius + dimensions.boundedWidth / 2)
            .attr("y1", dimensions.boundedHeight / 2)
            .attr("y2", Math.sin(angle) * dimensions.boundedRadius + dimensions.boundedWidth / 2)
            .attr("class", "grid-line")
    });

    const gridLabels = ticks.map((tick, i) => {
        const x = dimensions.boundedRadius;
        const y = 5-dimensions.boundedRadius*(i/5)+dimensions.boundedRadius;
        return axis.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("class", "grid-text")
            .text(tick)
    });

    const labels = metrics.map((metric, i) => {
        const angle = i * ((Math.PI * 2) / metrics.length) - Math.PI * 0.5
        const x = Math.cos(angle) * (dimensions.boundedRadius * 1.1) + dimensions.boundedWidth / 2
        const y = Math.sin(angle) * (dimensions.boundedRadius * 1.1) + dimensions.boundedHeight / 2
        return axis.append("text")
            .attr("x", x)
            .attr("y", y)
            .attr("class", "metric-label")
            .style("text-anchor",
                i == 0 || i == metrics.length / 2 ? "middle" :
                    i < metrics.length / 2 ? "start" :
                        "end"

            )
            .text(metric)
    });

    // 5. Draw data

    const line = bounds.append("path")
        .attr("class", "line")

    const drawLine = (judge) => {
        const lineGenerator = d3.lineRadial()
            .angle((metric, i) => i * ((Math.PI * 2) / metrics.length))
            .radius((metric, i) => metricScales[i](+judge[metric] || 0))
            .curve(d3.curveLinearClosed)

        const line = bounds.select(".line")
            .datum(metrics)
            .attr("d", lineGenerator)
            .style("transform", `translate(${dimensions.boundedRadius}px, ${dimensions.boundedRadius}px)`)
    };

    let activeJudgeIndex = 0;
    const title = d3.select("#title");

    const updateChart = () => {
        title.text(judgeAccessor(dataset[activeJudgeIndex]))
        drawLine(dataset[activeJudgeIndex]);
    }
    updateChart();
}

drawRadar();