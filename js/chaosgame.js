/**
 * Geometry
 */
let cartesianOrigin;

let pixelsPerUnit = 100.000000;
let unitsPerPixel = 1.000000 / pixelsPerUnit;

/**
 * Main figure
 */
const numberOfPoints = 5;
let figureVertices = [];

/**
 * Starting point
 */
let p;

/**
 * Rules
 */
const chaosFactor = 0.5;
let previousIndexes = [];
const preventPrevious = 0;
const startEqual = 0;
const endEqual = 2;
const compareIndex = 0;
const removedDistance = 1;
const ignoreRemoved = Math.abs(endEqual - startEqual) == 1;

/**
 * Style
 */
const pointWidth = 1;
const pointColor = "#ffffff20"
const drawingSpeed = 10000;

let iterationCounter = 1000;
let running = true;

let canvas, ctx;

class point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

window.onload = () => {
  canvas = document.getElementById('chaos-canvas');
  ctx = canvas.getContext('2d');

  resetView();
  drawNewPoints();
}

window.onresize = () => {
  resetView();
  running = false;
  waitTimeout = setTimeout(() => {
    running = true;
    drawNewPoints();
  }, 500)
}

function resetView() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  (() => {
    let minDim = Math.min(width, height);

    cartesianOrigin = new point(
      width * 0.5,
      height * 0.5
    );

    pixelsPerUnit = Math.round(minDim / 2.2);
    unitsPerPixel = 1.000000 / pixelsPerUnit;
  })();

  (() => {
    figureVertices = [];
    for (let i = 0; i < numberOfPoints; i++) {
      const angle = i / numberOfPoints * Math.PI * 2 + ((numberOfPoints % 2 == 0) ? Math.PI / (numberOfPoints) : Math.PI * 0.5);
      figureVertices.push(toScreenCoordinates(new point(
        Math.cos(angle),
        Math.sin(angle)
      )));
    }
  })()

  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  p = new point(
    width / 2,
    height / 2
  )

  figureVertices.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
  });

  ctx.fillStyle = pointColor;
}

function drawNewPoints() {
  if (iterationCounter-- * running > 0) {
    let i = 0;
    while (i++ < drawingSpeed) {
      p = calcNewPoint(p);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), pointWidth, pointWidth);
    }
    window.requestAnimationFrame(drawNewPoints)
  }
}

const toCartesian = (p) => {
  return new point(
    (p.x - cartesianOrigin.x) * unitsPerPixel,
    (cartesianOrigin.y - p.y) * unitsPerPixel
  );
}

const toScreenCoordinates = (p) => {
  return new point(
    p.x * pixelsPerUnit + cartesianOrigin.x,
    cartesianOrigin.y - p.y * pixelsPerUnit
  );
}

const calcNewPoint = (p) => {
  const calcNewCoordinate = (c1, c2) => {
    return c1 * chaosFactor + (1 - chaosFactor) * c2;
  }

  const chosenPoint = figureVertices[chooseRandomIndex()];
  p.x = calcNewCoordinate(p.x, chosenPoint.x);
  p.y = calcNewCoordinate(p.y, chosenPoint.y);

  return p;
}

const chooseRandomIndex = () => {
  let availableIndexes = [...Array(numberOfPoints).keys()].filter(
    function (e) {
      return this.indexOf(e) < 0;
    },
    (() => {
      let removedIndexes = [];

      if (!ignoreRemoved && previousIndexes.slice(startEqual, endEqual).every(v => v === previousIndexes[0])) {
        removedIndexes = [
          (previousIndexes[compareIndex] + removedDistance) % numberOfPoints,
          (numberOfPoints + (previousIndexes[compareIndex] - removedDistance) % numberOfPoints) % numberOfPoints
        ];
      }

      return removedIndexes.concat(previousIndexes.slice(0, preventPrevious));
    })()
  );

  let newIndex = availableIndexes[Math.floor(Math.random() * (availableIndexes.length))];

  previousIndexes.unshift(newIndex);
  if (previousIndexes.length > numberOfPoints) previousIndexes.pop();

  return newIndex;
}