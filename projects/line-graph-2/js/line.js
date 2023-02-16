async function drawLineChart() {

  // 1. Access data
  const pathToJSON = './data/time_entries.csv'
  let rawDataset = await d3.dsv(";", pathToJSON);
  // console.log(rawDataset);

  //создаем структуру данных
  const record = {
    date: '',
    duration: ''
  };

  //создаем пустой массив для хранения объектов
  let dataset = [];

  for (let i = 0; i < rawDataset.length; i++) {
    //создаем переменную для хранения текущих значений экз. объекта
    let currRecord = Object.create(record);
    //разбиваем строку с датой и сохраняем ее в переменные, соответствующие дню, мес. и году
    const [day, month, year] = rawDataset[i]['Start date'].split('.');
    //присваеваем текущее значение даты
    currRecord.date = new Date(+year, +month - 1, +day);
    // //присваеваем текущее значение времени вместе с ранее сохраненной датой
    const [hours, minutes, seconds] = rawDataset[i]['Duration'].split(':');
    currRecord.duration = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);
    dataset.push(currRecord);
  }

  // //конвертация в фомат даты
  // //js подход
  // const [day, month, year] = dataset[0].date.split('.');
  // let results = new Date(+year, +month - 1, +day)
  // // в цикле
  // for (let i = 0; i < dataset.length; i++) {
  //   const [day, month, year] = dataset[i].date.split('.');
  //   dataset[i].date = new Date(+year, +month - 1, +day)
  // }
  // //d3 подход
  // const parseTime = d3.timeParse("%d.%m.%Y");
  // let resultsD3 = parseTime(dataset[0].date);

  dataset.forEach(function (element) {
    let timeString = element.duration.toLocaleTimeString();
    let timeEl = timeString.split(':');
    element.durationSeconds = (+timeEl[0]) * 60 * 60 + (+timeEl[1]) * 60 + (+timeEl[2]);
  });

  var groupedDataset = [];
  dataset.reduce(function (res, value) {
    if (!res[value.date]) {
      res[value.date] = { date: value.date, totalDurationSeconds: 0 };
      groupedDataset.push(res[value.date])
    }
    res[value.date].totalDurationSeconds += value.durationSeconds;
    return res;
  }, {});

  const xAccessor = d => d.date;
  const formatHours = d3.format(".2f");
  const yAccessor = d => +formatHours(d['totalDurationSeconds'] / 3600);

  // const dateParser = d3.timeParse("%d.%m.%Y")
  // const xAccessor = d => dateParser(d.date)
  const yAccessorLine = d => d['meanDurationHours'];
  // console.log(xAccessor(groupedDataset[0]));
  // console.log(yAccessor(groupedDataset[0]));

  let datasetWeeks = downsampleData(groupedDataset, xAccessor, yAccessor);
  // console.log(datasetWeeks);
  // console.log(xAccessor(datasetWeeks[30]));
  // console.log(yAccessorLine(datasetWeeks[10]));
  const vacation = [
    {
      name: 'vacation',
      start: new Date('2022-06-16'),
      end: new Date('2022-06-26'),
    },
  ];
  
  // console.log(vacation[0].end);

  // // 2. Chart Dimensions
  let dimensions = {
    width: window.innerWidth * 0.8,
    height: 400,
    margin: {
      top: 15,
      right: 40,
      bottom: 40,
      left: 40,
    },
  }
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // 3. Draw Canvas
  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`);

  // 4. Scales
  const xScale = d3.scaleTime()
    .domain(d3.extent(groupedDataset, xAccessor))
    .range([0, dimensions.boundedWidth]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(groupedDataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice();

  const meanHours = d3.mean(groupedDataset, yAccessor);

  bounds.append('line').attr('class', 'mean');

  const meanLine = bounds.select('.mean')
    .attr('x1', 0)
    .attr('x2', dimensions.boundedWidth)
    .attr('y1', yScale(meanHours))
    .attr('y2', yScale(meanHours));

  //areas
  bounds.selectAll('.ministers')
    .data(vacation)
    .enter().append('rect')
    .attr('x', d => xScale(d.start))
    .attr('width', d => xScale(d.end) - xScale(d.start))
    .attr('y', 0)
    .attr('height', dimensions.boundedHeight)
    .attr("class", d => `minister ${d.name}`)
    .style("fill", '#D4E1ED')
    .style("opacity", .3);

  bounds.append('line').attr('class', 'vacation_start');
  bounds.append('line').attr('class', 'vacation_end');

  bounds.select('.vacation_start')
    .attr('x1', xScale(vacation[0].start))
    .attr('x2', xScale(vacation[0].start))
    .attr('y1', dimensions.boundedHeight)
    .attr('y2', 0);

  bounds.select('.vacation_end')
    .attr('x1', xScale(vacation[0].end))
    .attr('x2', xScale(vacation[0].end))
    .attr('y1', dimensions.boundedHeight)
    .attr('y2', 0);

  const vacationLabel = bounds
    .append('text')
    .attr('class', 'vacation_text')
    .attr('x', -dimensions.boundedHeight/2)
    .attr('y', xScale(vacation[0].start)+17)
    .text(`Vacation`);

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale);

  const xAxis = bounds.append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .call(xAxisGenerator);

  // 5. Draw Data
  //dots
  const dots = bounds.selectAll(".dot")
    .data(groupedDataset)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(xAccessor(d)))
    .attr("cy", d => yScale(yAccessor(d)))
    .attr("r", 2)
    .attr("class", "dot");

  //line
  const lineGenerator = d3.line()
    .x(function (d) {
      // console.log(xScale(xAccessor(d)))
      return xScale(xAccessor(d))
    })
    .y(d => yScale(yAccessorLine(d)))
    .curve(d3.curveCatmullRom.alpha(.5));
    // .curve(d3.curveMonotoneX);

  const line = bounds.append("path")
    .attr("class", "line")
    .attr("d", lineGenerator(datasetWeeks))

  // 6. Draw Peripherals
  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(7);

  const yAxis = bounds.append("g")
    .attr("class", "y-axis")
    .call(yAxisGenerator);

  // const yAxisLabel = yAxis.append("text")
  //   .attr("class", "y-axis-label")
  //   .attr("x", -dimensions.boundedHeight / 2)
  //   .attr("y", -dimensions.margin.left +35)
  //   .html("Hours");

  const yAxisLabel = yAxis.append("text")
    .attr("class", "y-axis-label")
    .attr("x", 25)
    .attr("y", 10)
    .html("Hours");

  const meanLabel = bounds
    .append('text')
    .attr('class', 'mean_text')
    .attr('x', 487)
    .attr('y', yScale(meanHours) + 15)
    .text(`Mean Daily Hours:${d3.format(".1f")(meanHours)}`);

  // 7. Set Up Interactions
  // const listeningRect = bounds.append("rect")
  //   .attr("class", "listening-rect")
  //   .attr("width", dimensions.boundedWidth)
  //   .attr("height", dimensions.boundedHeight)
  //   .on("mousemove", onMouseMove)
  //   .on("mouseleave", onMouseLeave);

  // const tooltip = d3.select('#tooltip');
  // function onMouseMove(e, d) {
  //   const mousePos = d3.pointer(e)
  //   const hoveredDate = xScale.invert(mousePos[0])
  //   const formatDate = d3.timeFormat("%d.%m.%Y")
  //   const getDistanceFromHoveredDate = d => Math.abs(
  //     xAccessor(d) - hoveredDate)
  //   const closestIndex = d3.leastIndex(datasetWeeks, (a, b) => (
  //     getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
  //   ))
  //   const closestDataPoint = datasetWeeks[closestIndex]
  //   const closestXValue = xAccessor(closestDataPoint)
  //   const closestYValue = yAccessorLine(closestDataPoint)
  //   tooltip.select("#upper_line")
  //     .text(formatDate(closestXValue))
  //   const formatHours = d => `Avg Week Hours: ${d3.format(".1f")(d)}`
  //   tooltip.select("#lower_line")
  //     .html(formatHours(closestYValue))

  //   const x = xScale(closestXValue)
  //     + dimensions.margin.left * .7
  //   const y = yScale(closestYValue)
  //     + dimensions.margin.top
  //   tooltip.style("transform", `translate(`
  //     + `calc( -36% + ${x + window.innerWidth * .1}px),`
  //     + `calc(-100% + ${y}px)`
  //     + `)`)
  //   tooltipCircle
  //     .attr("cx", xScale(closestXValue))
  //     .attr("cy", yScale(closestYValue))
  //     .style("opacity", 1)
  //   tooltip.style('opacity', 1);
  // };
  // function onMouseLeave() {
  //   tooltip.style("opacity", 0)
  //   tooltipCircle.style("opacity", 0)
  // };
  // const tooltipCircle = bounds.append("circle")
  //   .attr('class', 'tooltipCircle')
  //   .attr("r", 4);
}
drawLineChart()

function downsampleData(data, xAccessor, yAccessor) {
  const weeks = d3.timeWeeks(xAccessor(data[0]), xAccessor(data[data.length - 1]))

  return weeks.map((week, index) => {
    const weekEnd = weeks[index + 1] || new Date()
    const days = data.filter(d => xAccessor(d) > week && xAccessor(d) <= weekEnd)
    const meanTotalDurationHours = d3.mean(days, yAccessor)
    const meanDurationHours = meanTotalDurationHours === undefined ? 0 : d3.mean(days, yAccessor)
    return {
      date: week,
      meanDurationHours: meanDurationHours
    }
  })
};