/**
 * Geometry
 */
let xOrigin;
let yOrigin;

let scaleFactor = 100.000000;
let descaleFactor = 1.000000 / scaleFactor;

/**
 * Main figure
 */
const numberOfPoints = 5;
let points = [];

/**
 * Chaos factor
 */
const chaosFactor = 0.5;

/**
 * Starting point
 */
let p;

/**
 * Rules
 */
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
const pointWidth = .1;
const drawingSpeed = 500;

let iterationCounter = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // noLoop();

  resetView();
}

function createFigure(numberOfPoints) {
  points = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const angle = i / numberOfPoints * TWO_PI + ((numberOfPoints % 2 == 0) ? PI / (numberOfPoints) : HALF_PI);
    const figurePoint = createVector(Math.cos(angle), Math.sin(angle));
    points.push(toScreenCoordinates(figurePoint));
  }
}

function resetView() {
  setOrigin();

  p = createVector(width / 2, height / 2);
  createFigure(numberOfPoints);

  background(0);

  stroke(255);
  strokeWeight(5);
  points.forEach(p => point(p));

  strokeWeight(pointWidth);

  iterationCounter = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  clear();
  resetView();
}

function setOrigin() {
  let minDim = min(width, height);

  xOrigin = width * 0.5;
  yOrigin = height * 0.5;

  scaleFactor = minDim / 2.2;
  descaleFactor = 1.000000 / scaleFactor;
}

function toCartesian(p) {
  let cx = (p.x - xOrigin) * descaleFactor;
  let cy = (yOrigin - p.y) * descaleFactor;
  return createVector(cx, cy);
}

function toScreenCoordinates(p) {
  let sx = p.x * scaleFactor + xOrigin;
  let sy = yOrigin - p.y * scaleFactor;
  return createVector(sx, sy);
}

const calcNewCoordinate = (c1, c2) => {
  return c1 * chaosFactor + (1 - chaosFactor) * c2;
}

const calcNewPoint = () => {
  const chosenPoint = points[chooseRandomIndex()];
  p = createVector(
    calcNewCoordinate(p.x, chosenPoint.x),
    calcNewCoordinate(p.y, chosenPoint.y)
  );
  return p;
}

const removedIndexes = () => {
  let removedIndexes = [];

  if (!ignoreRemoved && previousIndexes.slice(startEqual, endEqual).every(v => v === previousIndexes[0])) {
    removedIndexes = [
      (previousIndexes[compareIndex] + removedDistance) % numberOfPoints,
      (numberOfPoints + (previousIndexes[compareIndex] - removedDistance) % numberOfPoints) % numberOfPoints
    ];
  }

  return removedIndexes.concat(previousIndexes.slice(0, preventPrevious));
}

const chooseRandomIndex = () => {
  let availableIndexes = [...Array(numberOfPoints).keys()].filter(
    function (e) {
      return this.indexOf(e) < 0;
    },
    removedIndexes()
  );

  let newIndex = availableIndexes[Math.floor(Math.random() * (availableIndexes.length))];

  previousIndexes.unshift(newIndex);

  if (previousIndexes.length > numberOfPoints) {
    previousIndexes.pop();
  }

  return newIndex;
}

function drawNewPoint() {
  point(calcNewPoint());
}

function draw() {
  [...Array(drawingSpeed)].forEach(() => drawNewPoint())

  if (iterationCounter++ > 1000)
    noLoop();
}