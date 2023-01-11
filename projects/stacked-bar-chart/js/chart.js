//1. Access data
async function drawChart() {
    //? dataset?
    const pathToData = './data/chart_m_eng.csv'
    let dataset = await d3.dsv(";", pathToData)
    const yAccessor = d => d.name;
    // array1.sort();
    // console.log(array1);
    // console.log(dataset.length);
    // console.log(xAccessor(dataset[0]));
    // console.log(yAccessor(dataset[0]));

    dataset.sort(function (a, b) {
        let sumA = +a['Skate Canada'] + (+a['Skate America']) + (+a['Grand Prix de France']) + (+a['MK John Wilson Trophy'])
            + (+a['NHK Trophy']) + (+a['Grand Prix of Espoo']);
        let sumB = (+b['Skate Canada'] + (+b['Skate America']) + (+b['Grand Prix de France']) + (+b['MK John Wilson Trophy'])
            + (+b['NHK Trophy']) + (+b['Grand Prix of Espoo']));
        if (sumA != sumB) {
            return sumB - sumA
        }
        return ((+b['КП_ПП_ЗКМ'] + (+b['КП_ПП_БС']) + (+b['КП_ПП_И']) + (+b['КП_ПП_МЗ']) + (+b['КП_ПП_ВП'])
            + (+b['КП_ПП_ПК']))
            - (+a['КП_ПП_ЗКМ'] + (+a['КП_ПП_БС']) + (+a['КП_ПП_И']) + (+a['КП_ПП_МЗ']) + (+a['КП_ПП_ВП'])
                + (+a['КП_ПП_ПК'])))
    });

    let list = ['Skate Canada', 'Skate America', 'Grand Prix de France', 'MK John Wilson Trophy', 'NHK Trophy', 'Grand Prix of Espoo'];

    //170 СТРОКА

    // let colorScale = d3.scaleOrdinal()
    //     .domain(list)
    //     .range(["#344e5e",
    //         "#5f312d",
    //         "#142a25",
    //         "#483056",
    //         "#3c4a27"]);

    let colorScale = d3.scaleOrdinal()
        // let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(list)
        .range(["#6030aa",
            "#6f9f38",
            "#c44ebc",
            "#cb5f2e",
            "#7171d6",
            "#cf416e"]);

    let dimensions = {
        width: window.innerWidth * .5,
        height: 550,
        margin: {
            top: 20,
            right: 70,
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
        .attr('width', dimensions.width + 10)
        .attr('height', dimensions.height)

    const bounds = wrapper.append('g')
        .attr('class', 'chart')
        .style('transform', `translate(${dimensions.margin.left + 70}px,
        ${dimensions.margin.top}px)`);

    // bounds.append('g').attr('class', 'bars')
    bounds.append('g')
        .attr('class', 'y-axis')

    //4. Create scales
    const yScale = d3.scaleBand()
        .domain(dataset.map(yAccessor))
        .range([0, dimensions.boundedHeight]);

    const xScale = d3.scaleLinear()
        // .domain([0, d3.max(dataset, yAccessor)])
        //? variable?
        .domain([0, 36])
        .range([0, dimensions.boundedWidth])
        .nice();
    // console.log("yScale.domain()[3]", yScale.domain()[0]);
    // console.log("yScale.domain()", yScale.domain());
    // console.log("yScale.range()", yScale.range());
    // console.log("yScale(yAccessor(dataset[2]))", yScale(yAccessor(dataset[0])));
    // console.log("xScale.domain()", xScale.domain());
    // console.log("xScale.range()", xScale.range());
    // console.log("xScale(0)", xScale(0));
    // console.log("xScale(18)", xScale(18));

    // //5. Draw data
    let stackGen = d3.stack()
        .keys(list)
    // .value(function(d, key) {
    //     console.log(d)
    //     return d[key]})
    // .order(d3.stackOrderAscending)
    // console.log(stackGen.value());
    let stackedSeries = stackGen(dataset)
    // .reverse();
    // console.log(stackedSeries);
    // console.log(stackedSeries[0].key);

    let bar_groups = bounds.selectAll('.chart')
        .data(stackedSeries)
        .enter()
        .append('g')
        .attr('id', function (d, i) {
            // console.log(d);
            return `bar_groups_${i}`
        })
        .style('fill', (d) => colorScale(d.key));

    let bars = bar_groups.selectAll("g")
        .data(function (d) {
            // console.log(d);
            return d;
        })
        .enter()
        .append("g")
        .attr('class', 'bars')

    bars.append('rect')
        .attr('height', 20)
        .attr('x', function (d, i) {
            // console.log(d);
            // console.log(d.data[list[0]]);
            // console.log(d.data[stackedSeries[0].key]);
            // console.log(xScale(d[0]));
            // console.log(stackedSeries[i]);
            // console.log(xScale(d[0]));
            return xScale(d[0]);
        })
        .attr('y', (d) => yScale(d.data.name) + 10)
        .attr('width', (d) => xScale(d[1]) - xScale(d[0]))

    bars.append('text')
        .attr('class', 'points')
        .attr('x', function (d, i) {
            // console.log(d);
            return xScale(d[0]) + 5;
        })
        .attr('y', (d) => yScale(d.data.name) + 24)
        .text(function (d, i, n) {
            let idx = n[i]['parentElement']['parentElement'].id.slice(-1);
            let stage_name = list[idx];
            let objKeys = Object.keys(d.data);
            let sp_fs_idx = objKeys.indexOf(stage_name) + 1
            let sp_fs_points = objKeys[sp_fs_idx]
            // console.log(d.data[sp_fs_points]);
            // console.log(Object.keys(d.data).indexOf("Grand Prix de France") + 1);
            // console.log(d.data.indexOf('name'));
            // console.log(d.data.indexOf("Skate Canada"));
            let rank_idx = objKeys.indexOf(stage_name) - 1
            // console.log(d.data);
            // console.log(rank_idx);
            let rank_pos = objKeys[rank_idx]
            // console.log(d.data[rank_pos]);
            return d.data[stage_name] == '' ? '' :
                d.data[rank_pos] > 7 ? '' : `${d.data[sp_fs_points]} / ${d.data[rank_pos].slice(0, -2)} / ${d[1] - d[0]}`
        })

    bars.append('text')
        .attr('class', 'stage_name')
        .attr('x', function (d, i, n) {
            // console.log(d.data[list[i]] == undefined);
            // console.log(n[i]['parentElement']['parentElement']);
            // console.log(Object.keys(d.data).find(key => d.data[key] === 'Grand Prix de France'));
            return xScale(d[0]) + 5;
        })
        .attr('y', (d, i) => yScale(d.data.name) + 6)
        .text((d, i, n) => {
            let idx = n[i]['parentElement']['parentElement'].id.slice(-1);
            // console.log(idx);
            // console.log(d);
            // console.log(list[idx]);
            return d[1] > 0 && d[1] < 9 || d[0] == 10 ? '' : d.data[list[idx]] == '' ? '' : list[idx]
        })

    bars.append('text')
        .attr('class', 'total_score')
        .attr('x', function (d) {
            return xScale(d[1]) + 5;
        })
        .attr('y', (d) => yScale(d.data.name) + 24)
        .text(function (d, i, n) {
            let idx = n[i]['parentElement']['parentElement'].id.slice(-1);
            // console.log(n[i]['parentElement']['parentElement'].id);
            let stage_name = list[idx];
            // console.log(stage_name);
            // console.log(idx);
            let sum_sp_fs_points = (+d.data.КП_ПП_ЗКМ) + (+d.data.КП_ПП_БС) + (+d.data.КП_ПП_И) + (+d.data.КП_ПП_МЗ)
                + (+d.data.КП_ПП_ВП) + (+d.data.КП_ПП_ПК);
            // console.log( `${sum_sp_fs_points.toFixed(2)} / ${d[1]}`);
            // console.log(d.data[stage_name]);
            return d.data[stage_name] == '' ? '' : `${sum_sp_fs_points.toFixed(2)} / ${d[1]}`
        })

    // sel.selectAll('.total_score')
    //     .data(dataset)
    //     .enter()
    //     .append("text")
    //     .attr('class', 'total_score')
    //     .text(d => `${(+d['Этап 1'] + (+d['Этап 2']))}`)
    //     .attr('x', function (d) {
    //         // console.log(d);
    //         // console.log(d['Этап 2']);
    //         // console.log(xScale(d['Этап 2']));
    //         return xScale((+d['Этап 1'] + (+d['Этап 2']))) + 3;
    //     })
    //     .attr('y', d => yScale(yAccessor(d)) + 24)
    //     .style('fill', "black")





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
    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
        .tickSizeOuter(0)
        .tickSizeInner(0)
        .tickPadding(10)

    const yAxis = bounds.select('.y-axis')
        .call(yAxisGenerator)
        .selectAll('.y-axis text')
        .call(function (t) {
            // console.log(t);
            t.each(function (d) { // for each one
                // console.log(d);
                let self = d3.select(this);
                // console.log(self);
                let s = self.text().split(' ');  // get the text and split it
                // console.log(s);
                self.text(''); // clear it out
                self.append("tspan") // insert two tspans
                    .attr("x", -15)
                    .attr("dy", -11)
                    .text(s[0]);
                self.append("tspan")
                    .attr("x", -15)
                    .attr("dy", "1.3em")
                    .text(s[1]);
            })
        });

    // const xAxisLabel = xAxis
    //     .select('.x-axis-label')
    //     .attr('x', dimensions.boundedWidth / 2)
    //     .attr('y', dimensions.margin.bottom - 3)

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