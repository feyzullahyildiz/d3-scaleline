import * as d3 from 'd3';
import { D3ZoomEvent } from 'd3';
import haversine from 'haversine';

function setOnWindow(key, value) {
    window[key] = value;
}
setOnWindow('d3', d3);
// const dataset = [12, 31, 22, 17, 25, 18, 29, 14, 9];
interface RawPoint {
    x: number;
    y: number;
    z: number;
}
interface Point {
    x: number;
    y: number;
}
function convertDataForChart(raw: RawPoint[]): Point[] {
    let first = raw[0];
    let measure = 0;
    return raw.map(a => {
        measure += haversine({
            longitude: first.x,
            latitude: first.y,
        }, {
            longitude: a.x,
            latitude: a.y,
        });
        first = a;
        return {
            x: measure,
            y: a.z,
        }
    })
}
import('./data.json').then((a: any) => {
    const points = convertDataForChart(a.data[0])
    init(points);

})

function init(dataset: Point[]) {
    const margin = { top: 10, right: 30, bottom: 30, left: 160 }
    const width = 860 - margin.left - margin.right
    const height = 400 - margin.top - margin.bottom
    console.log('width, height', width, height)

    const svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
    svg.append('defs').append('svg:clipPath')
        .attr('id', 'clip')
        .attr('clipPathUnits', 'userSpaceOnUse')
        .append('svg:rect')
        .attr('width', width)
        .attr('height', height)
        // .attr('x', 0)
        // .attr('y', 0)
    const mainGroup = svg
        .attr('id', 'mainGroup')
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)


    // .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xScaleLinear = d3.scaleLinear()
        .domain([
            d3.min(dataset, (d) => d.x),
            d3.max(dataset, (d) => d.x),
        ])
        .range([0, width]);

    const yScaleLinear = d3.scaleLinear()
        .domain([
            d3.min(dataset, (d) => d.y) - 1,
            d3.max(dataset, (d) => d.y) + 1,
            // d3.min(dataset, (d) => d.y),
            // d3.max(dataset, (d) => d.y),
        ])
        .range([height, 0]);

    const line = d3.line<Point>()
        // .curve(d3.curveBasis)
        .x(d => xScaleLinear(d.x)).y(d => yScaleLinear(d.y));
    const basePath = mainGroup
        .append('path')
        .datum(dataset)
        .attr('fill', 'none')
        .attr('stroke', '#ff0000')
        .attr('stroke-width', 1)
        .attr('d', line)
        .attr('clip-path', 'url(#clip)');


    // soldaki tickleri açıyor
    const yAxis = d3.axisLeft(yScaleLinear).ticks(10);
    const yAxisGroup = mainGroup.append('g').call(yAxis);

    // alttaki tickleri açıyor...
    const xAxis = d3.axisBottom(xScaleLinear).ticks(10);
    const xAxisGroup = mainGroup.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

    setOnWindow('xScaleLinear', xScaleLinear);

    const pathGroup = mainGroup.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'transparent')

    const zoom = d3.zoom()
        // .scaleExtent([1, 10])
        // .translateExtent([[0, 0], [width, height]])
        .on('zoom', (e: D3ZoomEvent<any, any>) => {
            basePath
                .attr('transform', e.transform)
                .style('stroke-width', 2 / e.transform.k);

            xAxisGroup.call(xAxis.scale(e.transform.rescaleX(xScaleLinear)))
            yAxisGroup.call(yAxis.scale(e.transform.rescaleY(yScaleLinear)))
        });


        pathGroup.call(zoom);
}