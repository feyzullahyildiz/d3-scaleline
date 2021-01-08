import * as d3 from 'd3';
import { bisector, D3BrushEvent, group, pointer } from 'd3';
// import 'd3-array';
// import 'd3-brush';
// import 'd3-force';
// import 'd3-format';
// import 'd3-hierarchy';
// import 'd3-interpolate';
// import 'd3-scale';
// import 'd3-selection';
// import 'd3-shape';
console.log('HOP')
function setOnWindow(key, value) {
    window[key] = value;
}
setOnWindow('d3', d3);
// const dataset = [12, 31, 22, 17, 25, 18, 29, 14, 9];
interface Point {
    x: number;
    y: number;
}
const dataset: Point[] = [
    { x: 0, y: 12 },
    { x: 1, y: 31 },
    { x: 2, y: 22 },
    { x: 3, y: 17 },
    { x: 4, y: 25 },
    { x: 5, y: 18 },
    { x: 6, y: 29 },
    { x: 7, y: 14 },
    { x: 8, y: 9 },
    { x: 9, y: 10 },
    { x: 10, y: 11 },
    { x: 11, y: 13 },
    { x: 12, y: 14 },
    { x: 13, y: 14 },
    { x: 14, y: 14 },
    { x: 15, y: 14 },
    { x: 16, y: 14 },
    { x: 17, y: 14 },
    { x: 18, y: 17 },
];

const offset = 10;
const ANIMATION_DURATION = 500;
// const dataset: Point[] = new Array(100).fill(() => 0).map((a, i) => ({x: i, y: +(Math.random() * 5).toFixed(0) + offset}));



const margin = { top: 10, right: 30, bottom: 30, left: 60 }
const width = 460 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
const mainGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)

svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0)
    // .attr("transform", `translate(${margin.left}, ${margin.top})`);

const xScaleLinear = d3.scaleLinear()
    .domain([0, dataset.length])
    .range([0, width]);

const yScaleLinear = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.y) + offset])
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
    .attr("clip-path", "url(#clip)");
const resetLine = () => {
    basePath.transition().duration(ANIMATION_DURATION).attr('d', line);
}


// soldaki tickleri açıyor
const yAxis = mainGroup.append("g").call(d3.axisLeft(yScaleLinear).ticks(10));

// alttaki tickleri açıyor...
const xAxis = mainGroup.append("g")
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScaleLinear).ticks(10));
const resetXAxis = () => {

    xAxis.transition().duration(ANIMATION_DURATION).attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScaleLinear).ticks(10))
}

let brush: d3.BrushBehavior<any>;
let brushGroup: d3.Selection<SVGGElement, any, HTMLElement, any>;
const resetBrush = () => {
    brushGroup.call(brush.move, null);
}
const updateChart = (event: D3BrushEvent<number[]>) => {
    if (!Array.isArray(event.selection) || event.selection.length !== 2) {
        return;
    }
    const [left, right] = event.selection as number[];

    xScaleLinear.domain([xScaleLinear.invert(left), xScaleLinear.invert(right)])
    resetXAxis();
    resetLine();
    resetBrush();
}
setOnWindow('xScaleLinear', xScaleLinear);

brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('end', updateChart)

svg.on('dblclick', () => {
    console.log('hop');
    xScaleLinear.domain([0, dataset.length]);
    resetXAxis();
    resetLine();
})

brushGroup = mainGroup.append('g')
    .classed('brush', true)
    .call(brush);