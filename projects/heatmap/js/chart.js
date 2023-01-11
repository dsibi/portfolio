async function drawChart() {
  // 1. Access Data
  const pathToData = './data/Toggl_time_entries_2022-01-01_to_2022-06-30.csv';
  let dataset = await d3.dsv(";", pathToData);

  let area = 'Useful Skills';
  let filteredArray = dataset.filter(row => row.Area == area);

  //создаем структуру данных
  const record = {
    area: area,
    date: '',
    duration: ''
  };

  //создаем пустой массив для хранения объектов
  let filteredArrayDuration = [];

  for (let i = 0; i < filteredArray.length; i++) {
    //создаем переменную для хранения текущих значений экз. объекта
    let currRecord = Object.create(record);
    currRecord.area = area;
    //разбиваем строку с датой и сохраняем ее в переменные, соответствующие дню, мес. и году
    const [day, month, year] = filteredArray[i]['Start date'].split('.');
    //присваеваем текущее значение даты
    currRecord.date = new Date(+year, +month - 1, +day);
    // //присваеваем текущее значение времени вместе с ранее сохраненной датой
    const [hours, minutes, seconds] = filteredArray[i]['Duration'].split(':');
    currRecord.duration = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    filteredArrayDuration.push(currRecord);
  }

  let filteredGroupedArray = filteredArrayDuration.reduce(function (allDates, date) {
    if (allDates.some(function (e) {
      return e.date.getTime() === date.date.getTime()
    })) {
      allDates.filter(function (e) {
        return e.date.getTime() === date.date.getTime()
      })[0].duration += +date.duration
    } else {
      allDates.push({
        area: date.area,
        date: date.date,
        duration: +date.duration
      })
    }
    return allDates
  }, []);

  const parseDate = d3.timeParse("%d.%m.%Y");
  // const dateAccessor = d => parseDate(d['Start date']);
  const dateAccessor = d => d.date;
  const xAccessor = d => d3.timeWeeks(firstDate, dateAccessor(d)).length
  const dayOfWeekFormat = d3.timeFormat("%-w")
  const yAccessor = d => +dayOfWeekFormat(dateAccessor(d))

  // 2. Chart Dimensions
  let dates = dataset.map(d => d['Start date']);
  function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  };
  let uniqueDates = dates.filter(onlyUnique);
  const numberOfWeeks = Math.ceil(uniqueDates.length / 7) + 1;

  let dimensions = {
    margin: {
      top: 30,
      right: 0,
      bottom: 30,
      left: 220,
    },
  };
  dimensions.width = window.innerWidth - dimensions.margin.left - dimensions.margin.right;
  dimensions.boundedWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.height = dimensions.boundedWidth * 7 / numberOfWeeks + dimensions.margin.top + dimensions.margin.bottom;
  dimensions.boundedHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // 3. Draw Canvas
  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width + 100)
    .attr("height", dimensions.height);

  const bounds = wrapper.append("g")
    .style("transform", `translate(${dimensions.margin.left + 20}px, ${dimensions.margin.top}px)`);

  // 4. Scales
  const barPadding = 0;
  const totalBarDimension = d3.min([
    dimensions.boundedWidth / numberOfWeeks,
    dimensions.boundedHeight / 7,
  ]);
  const barDimension = totalBarDimension - barPadding;

  // 5. Draw Data
  const monthFormat = d3.timeFormat("%b");
  //Months List
  const firstMonth = dateAccessor(filteredGroupedArray[0]);
  const firstMonthYear = firstMonth.getFullYear(), firstMonthMonth = firstMonth.getMonth();
  let firstDay = new Date(firstMonthYear, firstMonthMonth, 1);
  const lastMonth = dateAccessor(filteredGroupedArray[filteredGroupedArray.length - 1]);
  const lastMonthYear = lastMonth.getFullYear(), lastMonthMonth = lastMonth.getMonth();
  var lastDay = new Date(lastMonthYear, lastMonthMonth + 1, 0);
  const monthsList = d3.timeMonths(firstDay, lastDay);
  const firstDate = dateAccessor(filteredGroupedArray[0]);
  //Months Labels
  const months = bounds.selectAll(".month")
    .data(monthsList)
    .enter().append("text")
    .attr("class", "month")
    .attr("transform", d => `translate(${totalBarDimension * d3.timeWeeks(firstDate, d).length}, -10)`)
    .text(d => monthFormat(d))

  //Weeks Labels
  const dayOfWeekParse = d3.timeParse("%-e")
  const dayOfWeekTickFormat = d3.timeFormat("%-A")
  const labels = bounds.selectAll(".label")
    .data(new Array(7).fill(null).map((d, i) => i))
    .enter().append("text")
    .attr("class", "label")
    .attr("transform", d => `translate(-10, ${totalBarDimension * (d + 0.5)})`)
    .text(d => dayOfWeekTickFormat(dayOfWeekParse(d)))

  const drawDays = (metric) => {
    d3.select("#metric")
      .text(metric);
    const colorAccessor = d => d.duration;
    const colorRangeDomain = d3.extent(filteredGroupedArray, colorAccessor);
    const colorRange = d3.scaleLinear()
      .domain(colorRangeDomain)
      .range([0, 1])
      .clamp(true);
    const colorGradient = d3.interpolateHcl("#ecf0f1", "#5758BB");
    const colorScale = d => colorGradient(colorRange(d) || 0);

    // d3.select("#legend-min")
    //   .text(colorRangeDomain[0])
    // d3.select("#legend-max")
    //   .text(colorRangeDomain[1])
    // d3.select("#legend-gradient")
    //   .style("background", `linear-gradient(to right, ${new Array(10).fill(null).map((d, i) => (
    //     `${colorGradient(i / 9)} ${i * 100 / 9}%`
    //   )).join(", ")
    //     })`);

    const days = bounds.selectAll(".day")
      .data(filteredGroupedArray, d => d.date);

    const newDays = days.enter().append("rect");

    const allDays = newDays.merge(days)
      .attr("class", "day")
      .attr("x", d => totalBarDimension * xAccessor(d))
      .attr("width", barDimension)
      .attr("y", d => totalBarDimension * yAccessor(d))
      .attr("height", barDimension)
      .style("fill", d => colorScale(colorAccessor(d)))

      //Clipping mask
      // .attr("mask", "url(#donutMask)");

    // const oldDots = days.exit()
    //   .remove();

    // const path = "M2.98,492.76c-23.61-53.6,94.82-213.5,287-282,175.91-62.7,221.93,19.51,397-40C873.88,107.22,940.29-26.87,998.98,4.76c48.89,26.35,47.47,143.45,12,225-52.38,120.42-180.31,166.32-224,182-194.35,69.73-296.78-27.75-419,64-56.77,42.62-57.47,80.76-132,118-81.78,40.86-183.08,45.97-199,15-5.33-10.36,2.94-16.91,1-41-3.16-39.23-28.11-59.36-35-75Z";

    // const defs = bounds.append("defs")

    // const mask = defs.append("mask")
    //   .attr("id", "donutMask")

    // mask.append("path")
    // .attr("d", path)
    //   .attr("fill", "white")
  }

  let areas = dataset.map(d => d['Area']);
  let metrics = areas.filter(onlyUnique);
  let selectedMetricIndex = 0;
  drawDays(metrics[selectedMetricIndex]);

  // const button = d3.select("#heading")
  //   .append("button")
  //   .text("Change metric")

  // button.node().addEventListener("click", onClick)
  // function onClick() {
  //   selectedMetricIndex = (selectedMetricIndex + 1) % (metrics.length - 1)
  //   drawDays(metrics[selectedMetricIndex])
  // }

  // 6. Draw Peripherals

  //7. Set up interactions


};

drawChart();