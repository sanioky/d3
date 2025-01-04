const jsonUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const getMonthName = (monthNumber) => {
    const date = new Date();
    console.log(monthNumber);
    
    date.setMonth(monthNumber - 1);

    return date.toLocaleString('en-US', {
        month: 'long',
    });
}

const heatMap = () => {
    console.log('heatMap');
    let width;
    let height;
    let data;
    let margin;
    let colors;

    const my = (selection) => {
        const rectHeight = Math.round((height - margin.top - margin.bottom) / 12);
        const variance = data.monthlyVariance;
        const xValue = d => new Date(d.year, 1, 1);
        const yValue = d => d.month;
        const tValue = d => d.variance + data.baseTemperature;

        const x = d3.scaleTime()
            .domain(d3.extent(variance, xValue))
            .range([margin.left, width - margin.right]);

        const y = d3.scaleTime()
            .domain(d3.extent(variance, yValue))
            .range([margin.top, height - margin.bottom - rectHeight]);

        const t = d3.scaleQuantize()
            .domain([2.8, 12.8])
            .range(colors);

        const marks = variance.map(d => ({
            x: x(xValue(d)),
            y: y(yValue(d)),
            width: 5,
            height: rectHeight,
            fill: t(tValue(d)),
            month: yValue(d),
            year: xValue(d),
            temp: tValue(d)
        }));

        const tooltip = d3.select('body')
            .append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0);

        const mouseover = (event, d) => {
            tooltip.style("opacity", 1);
        };

        const mouseleave = (event, d) => {
            tooltip.style('opacity', 0);
        }

        const mousemove = (event, d) => {
            const [x, y] = d3.pointer(event);
            const text = `${d.year.getFullYear()} - ${getMonthName(d.month)}<br>
            ${d.temp.toFixed(1)}&#8451;`;

            tooltip
                .html(text)
                .attr('data-year', d.year.getFullYear())
                .style("left", x + "px")
                .style("top", y + 50 + "px");
        };

        selection
            .selectAll('rect')
            .data(marks)
            .join('rect')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', d => d.width)
            .attr('height', d => d.height)
            .attr('fill', d => d.fill)
            .attr('class', 'cell')
            .attr('data-month', d => d.month - 1)
            .attr('data-year', d => d.year.getFullYear())
            .attr('data-temp', d => d.temp)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave)
            .on('mouseover', mouseover);

        addAxes(selection, {
            xScale: x,
            yScale: y,
            rectHeight
        });

        addLegend(selection);
    };

    const addAxes = (selection, settings) => {
        selection.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${settings.yScale.range()[1] + settings.rectHeight})`)
            .call(d3.axisBottom(settings.xScale).tickFormat(d3.timeFormat('%Y')));

        const yAxisScale = d3.scaleTime()
            .domain([new Date("1970-01-01"), new Date("1970-11-01")])
            .range([margin.top + settings.rectHeight / 2, height - margin.bottom - settings.rectHeight / 2])
            .nice();

        selection.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yAxisScale).tickFormat(d3.timeFormat('%B')));
    }

    const addLegend = (selection) => {
        const rectSize = 25;

        selection
            .append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${(width - rectSize * colors.length) / 2},${height - margin.bottom + 40})`)
            .selectAll('rect')
            .data(colors)
            .join('rect')
            .attr('x', (d, i) => i * 25)
            .attr('y', 0)
            .attr('width', 25)
            .attr('height', 25)
            .attr('fill', d => d);
    }

    my.width = function (_) {
        return arguments.length ? ((width = +_), my) : width;
    }

    my.height = function (_) {
        return arguments.length ? ((height = +_), my) : height;
    };

    my.data = function (_) {
        return arguments.length ? ((data = _), my) : data;
    };

    my.margin = function (_) {
        return arguments.length ? ((margin = _), my) : margin;
    };

    my.colors = function (_) {
        return arguments.length ? ((colors = _), my) : colors;
    };

    return my;
}

(async function () {
    const width = 960;
    const height = 580;
    const hMap = heatMap()
        .width(width)
        .height(height)
        .margin({
            top: 20,
            right: 20,
            bottom: 120,
            left: 60
        })
        .data(await d3.json(jsonUrl))
        .colors(['#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027']);

    const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    svg.call(hMap);
})();

