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

const offset = 40;
// const dataset: Point[] = new Array(100).fill(() => 0).map((a, i) => ({x: i, y: +(Math.random() * 5).toFixed(0) + offset}))


// const w = 500;
// const h = 200;



const margin = { top: 10, right: 30, bottom: 30, left: 60 }
const width = 460 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);
const mainGroup = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


const xScaleLinear = d3.scaleLinear()
    .domain([0, dataset.length])
    .range([0, width]);

const yScaleLinear = d3.scaleLinear()
    .domain([0, d3.max(dataset, (d) => d.y) + offset])
    .range([height, 0]);

const line = d3.line<Point>()
    // .curve(d3.curveBasis)
    .x(d => xScaleLinear(d.x)).y(d => yScaleLinear(d.y));
const resetLine = () => {
    line.x(d => xScaleLinear(d.x));
}

mainGroup.append('path')
    .datum(dataset)
    .attr('fill', 'none')
    .attr('stroke', '#ff0000')
    .attr('stroke-width', 1)
    .attr('d', line);
const selectedPath = mainGroup.append('path')
    .datum([])
    .attr('fill', 'none')
    .attr('stroke', '#00ff00')
    .attr('stroke-width', 2)
    .attr('d', line);

mainGroup.selectAll("circle")
    .data(dataset)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => xScaleLinear(d.x))
    .attr("cy", (d, i) => yScaleLinear(d.y))
    .attr("r", '1')


// soldaki tickleri açıyor
const yAxis = mainGroup.append("g").call(d3.axisLeft(yScaleLinear).ticks(10));
// alttaki tickleri açıyor...

const xAxis = mainGroup.append("g")
    .attr('transform', `translate(0, ${height})`)
    .call(d3.axisBottom(xScaleLinear).ticks(10));
const resetXAxis = () => {

    xAxis.transition().duration(400).attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScaleLinear).ticks(10))
}

const bisectorFunction = d3.bisector<Point, any>(d => d.x).left;

const updateChart = (event: D3BrushEvent<number[]>) => {
    if (!Array.isArray(event.selection) || event.selection.length !== 2) {
        selectedPath.datum([])
            .attr('d', line);
        return;
    }
    const [left, right] = event.selection as number[];

    const xValue1 = xScaleLinear.invert(left);
    const xValue2 = xScaleLinear.invert(right);
    const index1 = bisectorFunction(dataset, xValue1);
    const index2 = bisectorFunction(dataset, xValue2);
    const selectedDataset = dataset.slice(index1, index2)

    selectedPath.datum(selectedDataset)
        .attr('d', line);

    xScaleLinear.domain([xScaleLinear.invert(left), xScaleLinear.invert(right)])
    resetXAxis();
    resetLine();
}
const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('end', updateChart);

mainGroup.append('g')
    .attr('fill', 'rgba(0, 0, 255, 0.3)')
    // .attr('fill', 'rgba(0, 0, 255, 1)')
    // .attr('fill', 'none')
    .attr('width', width)
    .attr('height', height)
    .attr('x', 0)
    .attr('y', 0)
    .attr('pointer-event', 'all')
    .call(brush);