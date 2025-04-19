let capture;
let capturewidth = 640;
let captureheight = 480;

let faceapi;
let detections = [];

let currentEmotion = "neutral";

function setup() {
  createCanvas(capturewidth, captureheight);

  capture = createCapture(VIDEO);
  capture.position(0, 0);

  capture.hide();

  const faceOptions = {
    withLandmarks: true,
    withExpressions: true,
    withDescriptors: false,
  };

  faceapi = ml5.faceApi(capture, faceOptions, faceReady);
}

function faceReady() {
  faceapi.detect(gotFaces);
}

function gotFaces(error, result) {
  if (error) {
    console.log(error);
    return;
  }
  detections = result;
  faceapi.detect(gotFaces);
  // console.log(detections);
}

function draw() {
  image(capture, 0, 0, width, height);

  capture.loadPixels();
  push();
  fill("green");
  if (detections.length > 0) {
    for (i = 0; i < detections.length; i++) {
      var points = detections[i].landmarks.positions;

      for (j = 0; j < points.length; j++) {
        circle(points[j]._x, points[j]._y, 5);
      }

      const detection = detections[i];

      push();

      currentEmotion = Object.keys(detection.expressions).reduce((a, b) =>
        detection.expressions[a] > detection.expressions[b] ? a : b
      );
      text(
        currentEmotion + " value: " + detection.expressions[currentEmotion],
        40,
        30
      );
    }
  }
  pop();
}

if (annyang) {
  annyang.debug(true);

  // Let's define our first command. First the text we expect, and then the function it should call
  var commands = {
    "i am worth it": function () {
      console.log("i am worth it", currentEmotion);
    },
    hello: () => console.log("hello!", currentEmotion),
    hi: () => console.log("hello!", currentEmotion),
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening. You can call this here, or attach this call to an event, button, etc.
  annyang.start();
}
