/**
 * Geometry
 */
let cartesianOrigin;

let pixelsPerUnit = 100.000000;
let unitsPerPixel = 1.000000 / pixelsPerUnit;

/**
 * Main figure
 */
const numberOfPoints = 6;
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

let iterationCounter = 200;
let runningTimer = true;

let canvas, ctx;

class point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Rendering
 */

function FpsCtrl(fps, callback) {

  var delay = 1000 / fps,                               // calc. time per frame
    time = null,                                      // start time
    frame = -1,                                       // frame count
    tref;                                             // rAF time reference

  function loop(timestamp) {
    if (time === null) time = timestamp;              // init start time
    var seg = Math.floor((timestamp - time) / delay); // calc frame no.
    if (seg > frame) {                                // moved to next frame?
      frame = seg;                                  // update
      callback({                                    // callback function
        time: timestamp,
        frame: frame
      })
    }
    tref = requestAnimationFrame(loop)
  }

  // play status
  this.isPlaying = false;

  // set frame-rate
  this.frameRate = function (newFps) {
    if (!arguments.length) return fps;
    fps = newFps;
    delay = 1000 / fps;
    frame = -1;
    time = null;
  };

  // enable starting/pausing of the object
  this.start = function () {
    if (!this.isPlaying) {
      this.isPlaying = true;
      tref = requestAnimationFrame(loop);
    }
  };

  this.pause = function () {
    if (this.isPlaying) {
      cancelAnimationFrame(tref);
      this.isPlaying = false;
      time = null;
      frame = -1;
    }
  };
}

var fc;

window.onload = () => {
  canvas = document.getElementById('chaos-canvas');
  ctx = canvas.getContext('2d');

  resetView();
  fc = new FpsCtrl(24, function () {
    drawNewPoints();
  });
  fc.start();
}

window.onresize = () => {
  resetView();
  window.cancelAnimationFrame(runningTimer);

  fc.pause();
  setTimeout(() => { fc.start() }, 500);
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
  iterationCounter = 200;
}

function drawNewPoints() {
  if (iterationCounter-- > 0) {
    let i = 0;
    while (i++ < drawingSpeed) {
      p = calcNewPoint(p);
      ctx.fillRect(Math.round(p.x), Math.round(p.y), pointWidth, pointWidth);
    }
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

const calcNewCoordinate = (c1, c2) => {
  return c1 * chaosFactor + (1 - chaosFactor) * c2;
}

const calcNewPoint = (p) => {
  const chosenPoint = figureVertices[chooseRandomIndex()];
  p.x = calcNewCoordinate(p.x, chosenPoint.x);
  p.y = calcNewCoordinate(p.y, chosenPoint.y);

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
  if (previousIndexes.length > numberOfPoints) previousIndexes.pop();

  return newIndex;
}