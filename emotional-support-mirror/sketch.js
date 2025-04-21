let capture;
let capturewidth = 640;
let captureheight = 480;

let faceapi;
let detections = [];

let phrases = {
  neutral: [
    "I am enough as I am",
    "I trust myself to handle today",
    "I am grounded",
    "I am present",
    "I am capable",
    "I'm open to whatever good may come today",
  ],
  happy: [
    "I deserve this joy",
    "I am full of life and it shows",
    "I am grateful for this moment and all that brought me here",
    "I will carry this light with me today",
  ],
  sad: [
    "It's okay to feel this",
    "I am still whole",
    "I am allowed to take it slow today",
    "My feelings are valid and they will pass",
    "Even on hard days I am worthy of love",
  ],
  angry: [
    "I acknowledge my anger",
    "I choose how to use it",
    "I am in control of my emotions",
    "My voice matters",
    "My boundaries matter",
    "I can respond with clarity and strength",
  ],
  fearful: [
    "I am safe in this moment",
    "I face fear with courage and self-trust",
    "I don't have to know everything to take the next step",
    "I have faced hard things before",
    "I can do it again",
  ],
  disgusted: [
    "I am not defined by what hurts or disappoints me",
    "I let go of what no longer serves me",
    "I choose to honor my values and my body",
    "I am worthy, always",
  ],
  surprised: [
    "I can handle unexpected things with grace",
    "I allow myself to feel then move forward",
    "Change is part of growth - I am adaptable",
    "This moment is new and so am I",
  ],
};

let currentPhrase = null;

let currentEmotion = "neutral";

const setRandomPhrase = () => {
  const choices = phrases[currentEmotion] ?? [];

  if (!choices.length) return;

  let newPhrase = currentPhrase;

  do {
    newPhrase = choices[Math.floor(Math.random() * choices.length)];
  } while (newPhrase == currentPhrase);

  annyang.removeCommands();

  currentPhrase = newPhrase;

  annyang.addCommands({
    [currentPhrase]: () => {
      console.log("very good!");
      setRandomPhrase();
    },
  });

  return currentPhrase;
};

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
}

function draw() {
  image(capture, 0, 0, width, height);

  capture.loadPixels();
  push();

  fill("white");
  textSize(16);
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = "black";

  if (detections.length > 0) {
    for (i = 0; i < detections.length; i++) {
      var points = detections[i].landmarks.positions;

      for (j = 0; j < points.length; j++) {
        circle(points[j]._x, points[j]._y, 5);
      }

      const detection = detections[i];

      push();

      const newEmotion = Object.keys(detection.expressions).reduce((a, b) =>
        detection.expressions[a] > detection.expressions[b] ? a : b
      );

      if (newEmotion != currentEmotion) {
        console.log(`Emotion changed from ${currentEmotion} to ${newEmotion}`);
        currentEmotion = newEmotion;
      }

      if (currentPhrase == null) {
        setRandomPhrase();
      }

      text(`Repeat after me: "${currentPhrase}"`, 40, 30);
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
  };

  // Add our commands to annyang
  annyang.addCommands(commands);

  // Start listening. You can call this here, or attach this call to an event, button, etc.
  annyang.start();
}
