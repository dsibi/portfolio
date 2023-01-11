async function drawChart() {
    const pathToData = './data/chart2.csv';
    let dataset = await d3.dsv(";", pathToData);
    const yAccessor = d => d.name;
    // const dataset = [{ item: 'item1', stage1: '18', stage2: '18', stage1_name: 'name1', stage2_name: 'name2' },
    // { item: 'item2', stage1: '12', stage2: '16', stage1_name: 'name4', stage2_name: 'name2' },
    // { item: 'item3', stage1: '10', stage2: '10', stage1_name: 'name1', stage2_name: 'name3' },
    // { item: 'item4', stage1: '18', stage2: '', stage1_name: 'name4', stage2_name: '' },
    // { item: 'item5', stage1: '16', stage2: '', stage1_name: 'name1', stage2_name: '' }]
    let dimensions = {
        width: window.innerWidth * .5,
        height: 300,
        margin: {
            top: 20,
            right: 15,
            bottom: 40,
            left: 60,
        },
    }
    dimensions.boundedWidth = dimensions.width
        - dimensions.margin.right - dimensions.margin.left;
    dimensions.boundedHeight = dimensions.height
        - dimensions.margin.top - dimensions.margin.bottom;
    const wrapper = d3.select('#wrapper')
        .append('svg')
        .attr('width', dimensions.width + 10)
        .attr('height', dimensions.height)
    const bounds = wrapper.append('g')
        .attr('class', 'chart')
        .style('transform', `translate(${dimensions.margin.left + 70}px,
        ${dimensions.margin.top}px)`);
    bounds.append('g').attr('class', 'bars')
    bounds.append('g')
        .attr('class', 'y-axis')
    const yScale = d3.scaleBand()
        .domain(dataset.map(function (d) { return d.name; }))
        .range([0, dimensions.boundedHeight]);
    const xScale = d3.scaleLinear()
        .domain([0, 36])
        .range([0, dimensions.boundedWidth])
        .nice();
    let list = ['Золотой конек Москвы', 'Идель', 'Бархатный сезон'];
    let colorScale = d3.scaleOrdinal()
        .domain([list])
        .range(["#F65289", "#75B5C1", 'green']);
    // console.log(colorScale('stage1'));
    // let stageList = ['name1', 'name2', 'name3', 'name4']
    // let stageColorScale = d3.scaleOrdinal()
    //     .domain([stageList])
    //     .range(["#F65289", "blue", 'black', 'green']);
    // console.log(stageColorScale('name1'));
    let stackGen = d3.stack()
        .keys(list)
    let stackedSeries = stackGen(dataset);
    // .reverse();
    // console.log(stackedSeries);
    let sel = bounds.select('g')
        .selectAll('g.series')
        .data(stackedSeries)
        .join('g')
        .classed('series', true)
        .style('fill', function (d, i) {
            // let stage = d[i][0] == 0 ? d[i].data.stage1_name : d[i].data.stage2_name
            // console.log(d);
            // return stageColorScale(stage)
            return colorScale(d)
        })
    sel.selectAll('rect')
        .data((d) => d)
        .join('rect')
        .attr('height', 20)
        .attr('x', function (d) {
            return xScale(d[0]);
        })
        .attr('y', (d) => yScale(d.data.name) + 10)
        .attr('width', (d) => xScale(d[1]) - xScale(d[0]));
    sel.selectAll('.stage1_name')
        .data(dataset)
        .enter()
        .append("text")
        .attr('class', 'stage1_name')
        .text(d => `${d['stage1_name']}`)
        .attr('x', 3)
        .attr('y', d => yScale(yAccessor(d)) + 6)
        .style('fill', "black")

    // sel.selectAll('.stage2_name')
    //     .data(dataset)
    //     .enter()
    //     .append("text")
    //     .attr('class', 'stage2_name')
    //     .text(d => `${d['stage2_name']}`)
    //     .attr('x', function (d) {
    //         return xScale(d['stage1']) + 3;
    //     })
    //     .attr('y', d => yScale(yAccessor(d)) + 6)
    //     .style('fill', "black")
};

drawChart();