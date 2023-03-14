const EDUCATION_DATA_JSON = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const COUNTIES__DATA_JSON = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

let educationData = {};

(async function () {
    const width = 960;
    const height = 580;


    const svg = d3.select('body')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    addLegend(svg);

    const pathGenerator = d3.geoPath();

    educationData = (await d3.json(EDUCATION_DATA_JSON));
    const countiesData = await d3.json(COUNTIES__DATA_JSON);

    const counties = topojson.feature(countiesData, countiesData.objects.counties);

    const id = d => d.fips;
    const value = d => d.bachelorsOrHigher;
    const featureId = d => d.id;
    const N = d3.map(educationData, id);
    const V = d3.map(educationData, value).map(d => d == null ? NaN : +d);
    const Im = new d3.InternMap(N.map((id, i) => [id, i]));
    const If = d3.map(counties.features, featureId);
    const domain = d3.extent(V);

    const range = d3.interpolateBlues;
    const color = d3.scaleSequential(domain, range);

    const tooltip = getTooltip(svg);

    const paths = svg
        .selectAll('path')
        .data(counties.features)
        .join('path')
        .attr('fill', (d, i) => color(V[Im.get(If[i])]))
        .attr('d', pathGenerator)
        .attr('class', 'county')
        .attr('data-fips', d => d.id)
        .attr('data-education', d => getEducationDataById(d.id)?.bachelorsOrHigher)
        .on('mousemove', tooltip.mousemove)
        .on('mouseleave', tooltip.mouseleave)
        .on('mouseover', tooltip.mouseover);

    const borders = topojson.mesh(countiesData, countiesData.objects.states, (a, b) => a !== b);

    svg.append('path')
        .attr('pointer-events', 'none')
        .attr('fill', 'none')
        .attr('stroke', '#59F')
        .attr('d', pathGenerator(borders));
})();

function addLegend(svg) {
    const tickWidth = 30;
    const range = d3.interpolateBlues;
    const color = d3.scaleSequential([0, 100], range);
    const colors = [];
    for (i = 0; i <= 100; i += 15) {
        colors.push(color(i));
    }

    const legend = svg.append('g')
        .attr('id', 'legend')
        .attr('transform', 'translate(600,40)')

    legend
        .selectAll('rect')
        .data(colors)
        .join('rect')
        .attr('x', (d, i) => i * tickWidth)
        .attr('y', 0)
        .attr('width', tickWidth)
        .attr('height', 10)
        .attr('fill', d => d);

    legend
        .selectAll('g')
        .data(colors)
        .join('g')
        .attr('transform', (d, i) => `translate(${i * tickWidth},10)`)
        .append('text')
        .text((d, i) => `${i * 15}%`)
        .attr('y', 16)
        .style('font-size', '10px')
}

function getTooltip() {
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
        const ed = getEducationDataById(d.id);
        const [x, y] = d3.pointer(event);
        const text = `${ed.area_name}, ${ed.state}: ${ed.bachelorsOrHigher}%`;

        tooltip
            .html(text)
            .style("left", x + "px")
            .style("top", y + 50 + "px")
            .attr('data-education', ed.bachelorsOrHigher);
    };

    return {
        mouseover,
        mouseleave,
        mousemove
    }
}

function getEducationDataById(id) {
    return educationData.find(d => d.fips === id);
}