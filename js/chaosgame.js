/**
 * Geometry
 */
let cartesianOrigin;

let pixelsPerUnit = 100.000000;
let unitsPerPixel = 1.000000 / pixelsPerUnit;

/**
 * Main figure
 */
let numberOfPoints = 5;
let points = [];

/**
 * Chaos factor
 */
let chaosFactor = 0.5;

/**
 * Starting point
 */
let newPoint;

/**
 * Rules
 */
let previousIndexes = [];
let preventPrevious = 0;
let startEqual = 0;
let endEqual = 2;
let compareIndex = 0;
let removedDistance = 1;
let ignoreRemoved = Math.abs(endEqual - startEqual) == 1;

/**
 * Style
 */
let pointWidth = .1;
let drawingSpeed = 500;

let iterations = 1000;
let iterationCounter = iterations;

/**
 * HTML elements
 */
let htmlElements;

const convertValueInt = (givenValue, minValue, maxValue, defaultValue, id) => {
  givenValue = Math.round(parseInt(givenValue));
  givenValue = isNaN(givenValue) ? defaultValue : (
    givenValue < minValue ? minValue : (
      givenValue > maxValue ? maxValue : givenValue
    )
  );
  document.getElementById(id).value = givenValue;
  return givenValue;
}

const convertValueFloat = (givenValue, minValue, maxValue, defaultValue, id) => {
  givenValue = parseFloat(givenValue);
  givenValue = isNaN(givenValue) ? defaultValue : (
    givenValue < minValue ? minValue : (
      givenValue > maxValue ? maxValue : givenValue
    )
  );
  document.getElementById(id).value = givenValue;
  return givenValue;
}

function changeFigure(num) {
  numberOfPoints = convertValueInt(num, 3, 12, 0, "vertices");

  createPolygon(numberOfPoints);
  resetRender();
}

function changeRules(newValue, id) {
  switch (id) {
    case "preventPrevious":
      preventPrevious = convertValueInt(newValue, 0, 12, 0, id);
      break;
    case "endEqual":
      endEqual = convertValueInt(newValue, 1, 12, 2, id);
      break;
    case "removedDistance":
      removedDistance = convertValueInt(newValue, 1, 12, 1, id);
      break;
    case "compareIndex":
      compareIndex = convertValueInt(newValue, 1, 12, 1, id) - 1;
      break;
    case "chaosFactor":
      chaosFactor = convertValueFloat(newValue, 0.01, 0.99, 0.5, id)
  }
  ignoreRemoved = Math.abs(endEqual - startEqual) == 1;

  resetRender();
}

function changeStyle(newValue, id) {
  switch (id) {
    case "pointWidth":
      pointWidth = convertValueFloat(newValue, 0.05, 10, 0.1, id);
      break;
    case "iterations":
      iterations = convertValueInt(newValue, 1, 100000, 1000, id);
      break;
    case "drawingSpeed":
      drawingSpeed = convertValueInt(newValue, 1, 10000, 500, id)
      break;
    default:
  }
  
  resetRender();
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("main");

  resetView();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  clear();
  resetView();
}

function resetView() {
  resetGeometry();
  createPolygon(numberOfPoints);
  resetRender();
}

function resetGeometry() {
  let minDim = min(width, height);

  cartesianOrigin = {
    x: width * 0.5,
    y: height * 0.5,
  };

  pixelsPerUnit = minDim / 2.2;
  unitsPerPixel = 1.000000 / pixelsPerUnit;
}

function createPolygon(numberOfPoints) {
  points = [];
  for (let i = 0; i < numberOfPoints; i++) {
    const angle = i / numberOfPoints * TWO_PI + ((numberOfPoints % 2 == 0) ? PI / (numberOfPoints) : HALF_PI);
    points.push(toScreenCoordinates({
      x: Math.cos(angle),
      y: Math.sin(angle)
    }));
  }
}

function resetRender() {
  background(0);

  /* Draw main polygon */
  stroke(255);
  strokeWeight(5);
  points.forEach(p => point(p.x, p.y));

  /* Draw first point */
  strokeWeight(pointWidth);
  newPoint = createVector(width * 0.5, height * 0.5);

  iterationCounter = iterations;
  loop();
}

function toCartesian(p) {
  return {
    x: (p.x - cartesianOrigin.x) * unitsPerPixel,
    y: (cartesianOrigin.y - p.y) * unitsPerPixel
  }
}

function toScreenCoordinates(p) {
  return {
    x: p.x * pixelsPerUnit + cartesianOrigin.x,
    y: cartesianOrigin.y - p.y * pixelsPerUnit
  }
}

const calcNewCoordinate = (c1, c2) => {
  return c1 * chaosFactor + (1 - chaosFactor) * c2;
}

const calcNewPoint = () => {
  const chosenPoint = points[chooseRandomIndex()];
  newPoint = createVector(
    calcNewCoordinate(newPoint.x, chosenPoint.x),
    calcNewCoordinate(newPoint.y, chosenPoint.y)
  );
  return newPoint;
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

function draw() {
  let j = drawingSpeed;
  while (j-- > 0) point(calcNewPoint())
  if (iterationCounter-- < 1) noLoop();
}