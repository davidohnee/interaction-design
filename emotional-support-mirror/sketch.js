let capture;
let capturewidth = 640;
let captureheight = 480;

let faceapi;
let detections = [];

let phrases = {
  neutral: [
    "I am enough as I am.",
    "I trust myself to handle today.",
    "I am grounded.",
    "I am present.",
    "I am capable.",
    "I am open to whatever good may come today.",
  ],
  happy: [
    "I deserve this joy.",
    "I am full of life and it shows.",
    "I am grateful for this moment and all that brought me here.",
    "I will carry this light with me today.",
  ],
  sad: [
    "It is okay to feel this.",
    "I am still whole.",
    "I am allowed to take it slow today.",
    "My feelings are valid and they will pass.",
    "Even on hard days I am worthy of love.",
  ],
  angry: [
    "I acknowledge my anger.",
    "I choose how to use it.",
    "I am in control of my emotions.",
    "My voice matters.",
    "My boundaries matter.",
    "I can respond with clarity and strength.",
  ],
  fearful: [
    "I am safe in this moment.",
    "I face fear with courage and self-trust.",
    "I don't have to know everything to take the next step.",
    "I have faced hard things before.",
    "I can do it again.",
  ],
  disgusted: [
    "I am not defined by what hurts or disappoints me.",
    "I let go of what no longer serves me.",
    "I choose to honor my values and my body.",
    "I am worthy, always.",
  ],
  surprised: [
    "I can handle unexpected things with grace.",
    "I allow myself to feel then move forward.",
    "Change is part of growth - I am adaptable.",
    "This moment is new and so am I.",
  ],
};

const toggleErrSuccess = (containerElement, success = true) => {
  containerElement.querySelector(".err").style.display = success ? "none" : "unset";
  containerElement.querySelector(".success").style.display = success ? "unset" : "none";
}

let expired = false;
let expireTimeout = null;
let currentPhrase = null;
let currentEmotion = "neutral";
var audio = new Audio("success_2.wav");

var playSound = function () {
  audio.currentTime = 0;
  audio.play();
};

const setRandomPhrase = () => {
  if (expired) return;

  if (currentPhrase) {
    playSound();
  }

  if (expireTimeout) {
    clearTimeout(expireTimeout);
  }
  expireTimeout = setTimeout(() => {
    expired = true;
    currentPhrase = null;
    annyang.removeCommands();
  }, 10000);

  const choices = phrases[currentEmotion] ?? [];

  if (!choices.length) return;

  let newPhrase = currentPhrase;

  do {
    newPhrase = choices[Math.floor(Math.random() * choices.length)];
  } while (newPhrase == currentPhrase);

  annyang.removeCommands();

  currentPhrase = newPhrase;

  annyang.addCommands({
    [currentPhrase]: setRandomPhrase,
  });

  return currentPhrase;
};

function linearGradient(x1, y1, x2, y2, col1, col2) {
  let grad = drawingContext.createLinearGradient(x1, y1, x2, y2);
  grad.addColorStop(0, col1);
  grad.addColorStop(1, col2);
  drawingContext.fillStyle = grad;
}

function setup() {
  toggleErrSuccess(document.querySelector("#p5js"))
  createCanvas(capturewidth, captureheight);

  if (typeof annyang !== "undefined") {
    annyang.debug(true);
    annyang.start();
    toggleErrSuccess(document.querySelector("#mic"), annyang.isListening())
  }

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
  fill("black");
  stroke("magenta");
  line(0, 0, width, height);
  line(0, height, width, 0);
  noStroke();

  image(capture, 0, 0, width, height);

  capture.loadPixels();

  if (capture.pixels[0] > 0) {
    if (typeof annyang !== "undefined" && annyang.isListening()) {
      document.querySelector("main").classList.remove("loading");
    }
    toggleErrSuccess(document.querySelector("#cam"))
  }

  push();

  linearGradient(0, 0, 0, height / 2, "rgba(0,0,0,0.8)", "transparent")
  rect(0, 0, width, height);

  drawingContext.fillStyle = "white";
  textSize(16);

  if (detections.length > 0) {
    for (i = 0; i < detections.length; i++) {
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

      if (!expired) {
        text(`You look ${currentEmotion}.`, 40, 30);
        text(`Say  "${currentPhrase}"`, 40, 50);
      }
    }
  } else {
    currentPhrase = null;
    expired = false;
    clearTimeout(expireTimeout);
    expireTimeout = null;
    annyang.removeCommands();
  }
  pop();
}
