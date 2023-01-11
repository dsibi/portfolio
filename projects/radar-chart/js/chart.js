program_type = 'fs';

const NUM_OF_SIDES = program_type == 'fs' ? 12 : 7;
NUM_OF_LEVEL = 10,
    size = Math.min(window.innerWidth, window.innerHeight, 350),
    offset = Math.PI,
    polyangle = (Math.PI * 2) / NUM_OF_SIDES,
    r = 0.8 * size,
    r_0 = r / 2,
    center =
    {
        x: size / 2,
        y: size / 2
    };

async function getData() {
    const pathToData = './data/chart_radar_ru_' + program_type + '_w.csv';
    let dataset = await d3.dsv(";", pathToData);
    return dataset;
};

// group the data
let group_the_data = (dataset) => {
    let judges = Array.from(
        d3.group(dataset, d => d.id), ([key, value]) => ({ key, value })
    );
    return judges;
};

const tooltip = d3.select(".tooltip");

const genTicks = levels => {
    const ticks = [];
    const step = 10 / levels;
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

const createSVG = (dataset) => {
    //если отображаются не все спортсмены, то изменить i
    for (let index = 0; index < 20; index++) {
        let element = index + 1;
        const svg = d3.select("#j" + element)
            .selectAll('svg')
            .data([dataset[index]])
            .enter()
            .append("svg")
            .attr("class", function (d) { return d.value[0].id; })
            .attr("width", size)
            .attr("height", size);


        var g1 = svg.append("g");

        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        var filter = g1.append('defs').append('filter').attr('id', 'glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '1.5').attr('result', 'coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');




        let tss = parseFloat(+dataset[index].value[0].tss_sp + +dataset[index].value[0].total_segment_score).toFixed(2);
        const rank = program_type == 'fs' ?
            d3.select("#j" + element + " .rank")
                // .text('КП ' + dataset[index].value[0].tss_sp + ' + ПП ' +
                    .text(dataset[index].value[0].final_rank + ' place: SP ' + dataset[index].value[0].tss_sp + ' + FS ' +
                    dataset[index].value[0].total_segment_score + ' = ' + tss) :
            d3.select("#j" + element + " .rank")
                .text(dataset[index].value[0].rank);
        // const rank = d3.select("#j" + element + " .rank")
        //     .text(dataset[index].value[0].rank);
        const skater_name = d3.select("#j" + element + " .skater_name")
            .text(dataset[index].value[0].name_eng);
        const score = program_type == 'fs' ? d3.select("#j" + element + " .score")
            .text("Tech " + dataset[index].value[0].total_element_score + " + Comp " + dataset[index].value[0].total_component_score
                + " - Ded " + dataset[index].value[0].total_deductions + " = " + dataset[index].value[0].total_segment_score) :
            d3.select("#j" + element + " .score")
                .text("Tech " + dataset[index].value[0].total_element_score + " + Comp " + dataset[index].value[0].total_component_score
                    + " - Ded " + dataset[index].value[0].total_deductions + " = " + dataset[index].value[0].total_segment_score);
        const g = d3.select("svg." + dataset[index].value[0].id)
            .append("g");
        // const scale = d3.scaleLinear()
        //     .domain([0, 10])
        //     .range([0, r_0])
        //     .nice();
        generateAndDrawLevels(g, NUM_OF_LEVEL, NUM_OF_SIDES);
        // generateAndDrawLines(NUM_OF_SIDES);
        // drawAxis(g, ticks, NUM_OF_LEVEL);
        drawData(g, dataset[index].value, NUM_OF_SIDES);
        drawLabels(g, dataset[index].value, NUM_OF_SIDES);
    }
};

const generatePoint = ({ length, angle }) => {
    const point =
    {
        x: center.x + (length * Math.sin(offset - angle)),
        y: center.y + (length * Math.cos(offset - angle))
    };
    return point;
};

const drawPath = (points, parent) => {
    const lineGenerator = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    parent.append("path")
        .attr("d", lineGenerator(points))
        .style("filter", "url(#glow)");
};

const generateAndDrawLevels = (g, levelsCount, sideCount) => {

    for (let level = 10; level <= levelsCount; level++) {
        const hyp = (level / levelsCount) * r_0;

        const points = [];
        for (let vertex = 0; vertex < sideCount; vertex++) {
            const theta = vertex * polyangle;

            points.push(generatePoint({ length: hyp, angle: theta }));

        }
        const group = g.append("g").attr("class", "levels");
        var gradient = d3.select(".levels")
            .append("defs")
            .append("radialGradient")
            .attr("id", "svgGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "100%");
        gradient.append("stop")
            .attr('class', 'start')
            .attr("offset", "0%")
            .attr("stop-color", "red")
            .attr("stop-opacity", .3);
        gradient.append("stop")
            .attr('class', 'middle')
            .attr("offset", "50%")
            .attr("stop-color", "yellow")
            .attr("stop-opacity", .3);
        gradient.append("stop")
            .attr('class', 'end')
            .attr("offset", "100%")
            .attr("stop-color", "green")
            .attr("stop-opacity", .3);
        drawPath([...points, points[0]], group);
    }
};

const generateAndDrawLines = (sideCount) => {

    const group = g.append("g").attr("class", "grid-lines");
    for (let vertex = 1; vertex <= sideCount; vertex++) {
        const theta = vertex * polyangle;
        const point = generatePoint({ length: r_0, angle: theta });
        drawPath([center, point], group);
    }

};

const drawCircles = (g, points) => {
    const mouseEnter = d => {
        // console.log( d3.event );
        tooltip.style("opacity", 1);
        const { x, y } = d3.event;
        tooltip.style("top", `${y - 20}px`);
        tooltip.style("left", `${x + 15}px`);
        tooltip.text(d.value);
    };

    const mouseLeave = d => {
        tooltip.style("opacity", 0);
    };

    g.append("g")
        .attr("class", "indic")
        .selectAll("circle")
        .data(points)
        .enter()
        .append("circle")
        .attr("cx", d => +d.x)
        .attr("cy", d => +d.y)
        .attr("r", 4)
        .style("filter", "url(#glow)");
    // .on( "mouseenter", mouseEnter )
    // .on( "mouseleave", mouseLeave );

    let scores = g.append('g')
        // .style('transform', `translate(${dimensions.margin.left}px,
        // ${dimensions.margin.top}px)`)
        .selectAll('.labels')
        .data(points) // use d.value to get to the the_value
        .enter()
        .append("text")
        .attr('class', 'scores')
        .attr("x", d => +d.x + 15)
        .attr("y", d => +d.y)
        .text(d => d.value)
        .each(function (c) {
            this._current = c;
        });
};

const drawText = (text, point, isAxis, group) => {
    if (isAxis) {
        const xSpacing = text.toString().includes(".") ? 14 : 7;
        group.append("text")
            .attr("x", point.x - xSpacing)
            .attr("y", point.y + 5)
            .html(text);
    }
    else {
        group.append("text")
            .attr("x", point.x + 1)
            .attr("y", point.y)
            .html(text);
    }
};

const drawData = (g, dataset, n) => {
    const points = [];
    dataset.forEach((element, i) => {
        let max = element.element_name == 'ChSq1' ? 5.5 : +element.base_value * 1.5;
        max = max == 0 ? 1 : max;
        const scale = d3.scaleLinear()
            .domain([0, max])
            .range([0, r_0])
        const len = scale(element.scores_of_panel);
        const theta = i * (2 * Math.PI / n);
        points.push(
            {
                ...generatePoint({ length: len, angle: theta }),
                value: element.scores_of_panel
            });
    });

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const group = g
        .append("g").attr("class", "shape")
        .style("fill", function (d, i) {
            // console.log(d);
            return colorScale(i);
        })
        .style("fill-opacity", .3);

    drawPath([...points, points[0]], group);
    drawCircles(g, points);
};

const drawAxis = (g, ticks, levelsCount) => {
    const groupL = g.append("g").attr("class", "tick-lines");
    const point = generatePoint({ length: r_0, angle: 0 });
    // drawPath([center, point], groupL);

    const groupT = g.append("g").attr("class", "ticks");

    ticks.forEach((d, i) => {
        const r = (i / levelsCount) * r_0;
        const p = generatePoint({ length: r, angle: 0 });
        const points =
            [
                p,
                {
                    ...p,
                    x: p.x - 10
                }
            ];
        // drawPath(points, groupL);
        drawText(d, p, true, groupT);
    });
};

const drawLabels = (g, dataset, sideCount) => {
    const groupL = g.append("g").attr("class", "labels");
    for (let vertex = 0; vertex < sideCount; vertex++) {
        const angle = vertex * polyangle;
        const label = dataset[vertex].element_name;
        const point = generatePoint({ length: 0.9 * (size / 2), angle });
        drawText(label, point, false, groupL);
    }
};

getData().then((dataset) => {
    let result = group_the_data(dataset);
    createSVG(result);
});