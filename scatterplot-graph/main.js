const jsonUrl = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const width = 760;
const height = 400;

const scatterPlot = () => {
    let width;
    let height;
    let data;
    let margin;
    let xValue;
    let yValue;
    let radius;

    const getDateFromSeconds = (seconds) => {
        const date = new Date(1970, 0, 1);
        date.setSeconds(seconds);
        return date;
    }

    const my = (selection) => {
        const minDate = getDateFromSeconds(d3.min(data, yValue));
        const maxDate = getDateFromSeconds(d3.max(data, yValue));
        const formatTime = d3.timeFormat('%M:%S');

        const x = d3.scaleTime()
            .domain(d3.extent(data, xValue))
            .range([margin.left, width - margin.right])
            .nice();

        const y = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([margin.top, height - margin.bottom]);

        const marks = data.map((d) => {
            const date = getDateFromSeconds(yValue(d));

            return {
                x: x(xValue(d)),
                y: y(date),
                dataX: d.Year,
                dataY: date,
                fill: d.Doping ? 'red' : 'green',
                name: d.Name,
                nationality: d.Nationality
            }
        });

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
            const text = `${d.name} (${d.nationality}) <br>
                Year: ${d.dataX}, Time: ${formatTime(d.dataY)}`;

            tooltip
                .html(text)
                .attr('data-year', d.dataX)
                .style("left", x + "px")
                .style("top", y + 50 + "px");
        };

        selection
            .selectAll('circle')
            .data(marks)
            .join('circle')
            .attr('cx', d => d.x)
            .attr('cy', d => d.y)
            .attr('r', radius)
            .attr('class', 'dot')
            .attr('data-xvalue', d => d.dataX)
            .attr('data-yvalue', d => d.dataY)
            .attr('fill', d => d.fill)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave)
            .on('mouseover', mouseover);

        selection.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y')));

        selection.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y).tickFormat(formatTime));

        const legend = selection.append('g')
            .attr('id', 'legend');

        legend.append('rect')
            .attr('x', `${width - margin.right}`)
            .attr('y', 90)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', 'red');


        legend.append('text')
            .text('Riders with doping allegations')
            .attr('x', `${width - margin.right - 10}`)
            .attr('y', 100)
            .style('text-anchor', 'end');

        legend.append('rect')
            .attr('x', `${width - margin.right}`)
            .attr('y', 110)
            .attr('width', 10)
            .attr('height', 10)
            .attr('fill', 'green');

        legend.append('text')
            .text('No doping allegations')
            .attr('x', `${width - margin.right - 10}`)
            .attr('y', 120)
            .style('text-anchor', 'end');
    };

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

    my.xValue = function (_) {
        return arguments.length ? ((xValue = _), my) : xValue;
    };

    my.yValue = function (_) {
        return arguments.length ? ((yValue = _), my) : yValue;
    };

    my.radius = function (_) {
        return arguments.length ? ((radius = +_), my) : radius;
    };

    return my;
}

(async function () {
    const plot = scatterPlot()
        .width(width)
        .height(height)
        .margin({
            top: 20,
            right: 20,
            bottom: 20,
            left: 50
        })
        .radius(5)
        .xValue((d) => new Date(d.Year.toString()))
        .yValue((d) => d.Seconds)
        .data(await d3.json(jsonUrl));

    const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    svg.call(plot);
})();

