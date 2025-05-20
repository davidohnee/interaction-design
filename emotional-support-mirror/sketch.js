let capture;
let capturewidth = 640;
let captureheight = 480;

let faceapi;
let detections = [];
const welcomeLines = [
    "Welcome to your Emotional Support Mirror.",
    "I’m here to read your expressions and guide you through some affirmations.",
    "When you’re ready, click Start to begin."
];

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

function speakLines(lines, onComplete) {
    if (!window.speechSynthesis) {
        console.warn("Speech synthesis not supported");
        return;
    }
    let i = 0;

    function next() {
        if (i >= lines.length) {
            return onComplete && onComplete();
        }
        const utt = new SpeechSynthesisUtterance(lines[i++]);
        utt.lang = 'en-US';
        utt.rate = 1;
        utt.pitch = 1;
        utt.onend = next;
        speechSynthesis.speak(utt);
    }

    next();
}

// on DOM ready, speak the lines and only enable the Start button when done
window.addEventListener('DOMContentLoaded', () => {
    const skipBtn   = document.getElementById('skip-btn');
    const startBtn  = document.getElementById('start-btn');
    const reloadBtns = document.getElementsByClassName('reload-btn');
    const text      = document.getElementById('welcome-text');

    text.textContent = welcomeLines.join(' ');

    // Enable Start only after speech, but always enable Skip immediately
    startBtn.disabled = true;
    startBtn.style.opacity = 0.5;
    speakLines(welcomeLines, () => {
        startBtn.disabled = false;
        startBtn.style.opacity = 1;
    });

    // Start button: speak first, then mirror
    startBtn.addEventListener('click', startExperience);

    // Skip button: go straight to mirror
    skipBtn.addEventListener('click', () => {
        // Stop any ongoing or queued speech
        if (window.speechSynthesis) {
            speechSynthesis.cancel();
        }

        // Immediately fade-out overlay
        const o = document.getElementById('welcome-screen');
        o.classList.add('fade-out');
        o.addEventListener('transitionend', () => {
            o.style.display = 'none';
        });

        // Play music & start annyang
        document.getElementById('bg-music').play();
        if (annyang) {
            annyang.debug(true);
            annyang.start({ autoRestart: true, continuous: true });

            // register _all_ phrases as regex commands that ignore trailing punctuation:
            Object.values(phrases).flat().forEach(phrase => {
                // escape any regex-special chars
                const esc = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
                // allow an optional ., ! or ? at the end
                const re  = new RegExp(`^${esc}[.?!]?$`, 'i');
                annyang.addCommands({ [re]: setRandomPhrase });
            });
            annyang.addCallback('result', phrasesArray => {
                // Normalize the current target phrase once:
                const target = currentPhrase
                    .trim()
                    .replace(/[.?!]+$/, '')       // strip trailing punctuation
                    .toLowerCase();

                // Look through every hypothesis from annyang:
                for (let raw of phrasesArray) {
                    const spoken = raw
                        .trim()
                        .replace(/[.?!]+$/, '')
                        .toLowerCase();

                    console.log(`Heard: "${spoken}" vs target: "${target}"`);
                    if (spoken === target) {
                        // we found a match—fire your handler and stop checking
                        return setRandomPhrase();
                    }
                }
            });


            annyang.addCallback('error',           err => console.error('Speech error:', err));
            annyang.addCallback('permissionDenied',()  => console.warn('User denied mic'));
            // etc…
        }
    });

    // Reload button: reload the page so DOMContentLoaded and overlay reset
    Array.from(reloadBtns).forEach(btn => {
        btn.addEventListener('click', () => {
            console.log('reload');
            location.reload();
        });
    });
});


function startExperience() {
    const overlay = document.getElementById('welcome-screen');
    overlay.classList.add('fade-out');
    overlay.addEventListener('transitionend', () => overlay.style.display = 'none');
    document.getElementById('bg-music').play();
    if (annyang) startAnnyang();
}

function startAnnyang() {
    annyang.debug(true);
    annyang.start({ autoRestart: true, continuous: true });
    const regexCommands = {};
    Object.values(phrases).flat().forEach(phrase => {
        const esc = phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const re  = new RegExp(`^${esc}[.?!]?$`, 'i');
        regexCommands[re] = setRandomPhrase;
    });
    annyang.addCommands(regexCommands);
    annyang.addCallback('error', e => console.error(e));
    annyang.addCallback('permissionDenied', () => console.warn('Mic denied'));
}



var playSound = function () {
    audio.currentTime = 0;
    audio.play();
};

const setRandomPhrase = () => {
    if (expired) {
        return;
    }

    if (currentPhrase) {
        playSound();

        confetti({
                     particleCount: 100,
                     spread: 70,
                     origin: { y: 0.6 }
                 });
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

    if (!choices.length) {
        return;
    }

    let newPhrase = currentPhrase;

    do {
        newPhrase = choices[Math.floor(Math.random() * choices.length)];
    } while (newPhrase == currentPhrase);

    annyang.removeCommands();

    currentPhrase = newPhrase;

    return currentPhrase;
};

function linearGradient(x1, y1, x2, y2, col1, col2) {
    let grad = drawingContext.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, col1);
    grad.addColorStop(1, col2);
    drawingContext.fillStyle = grad;
}

function setup() {
    toggleErrSuccess(document.querySelector("#p5js"));
    createCanvas(capturewidth, captureheight);
    // … camera + faceapi init only …
    capture = createCapture(VIDEO).position(0, 0).hide();
    faceapi = ml5.faceApi(capture, {withLandmarks: true, withExpressions: true}, faceReady);
}

function faceReady() {
    faceapi.detect(gotFaces);
}

function gotFaces(err, result) {
    if (err) {
        console.error(err);
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
                //console.log(`Emotion changed from ${currentEmotion} to ${newEmotion}`);
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
