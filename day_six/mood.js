const video = document.getElementById('video');
const analyzeBtn = document.getElementById('analyzeBtn');
const statusEl = document.getElementById('status');
const moodEl = document.getElementById('mood');
const colorEl = document.getElementById('colorText');
const confidenceEl = document.getElementById('confidence');
const swatchEl = document.getElementById('colorSwatch');

const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';

const moodColorMap = {
  happy: { mood: 'Happy', color: '#FFD166' },
  sad: { mood: 'Sad', color: '#5DA9E9' },
  angry: { mood: 'Angry', color: '#EF476F' },
  fearful: { mood: 'Fearful', color: '#6A4C93' },
  disgusted: { mood: 'Disgusted', color: '#7CB518' },
  surprised: { mood: 'Surprised', color: '#FF9F1C' },
  neutral: { mood: 'Neutral', color: '#A0A4B8' }
};

let isReady = false;

function setStatus(message) {
  statusEl.textContent = message;
}

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
    video.srcObject = stream;
    await video.play();
    return true;
  } catch (error) {
    setStatus('Camera unavailable. Please allow camera access.');
    return false;
  }
}

async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    return true;
  } catch (error) {
    setStatus('Failed to load face models. Check internet connection.');
    return false;
  }
}

function getTopExpression(expressions) {
  return Object.entries(expressions).sort((a, b) => b[1] - a[1])[0];
}

async function analyzeMood() {
  if (!isReady) {
    setStatus('Still preparing camera/model...');
    return;
  }

  const detection = await faceapi
    .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (!detection) {
    moodEl.textContent = 'Mood: no face detected';
    colorEl.textContent = 'Color: --';
    confidenceEl.textContent = 'Confidence: --';
    swatchEl.style.backgroundColor = '#333';
    setStatus('No face detected. Move closer and try again.');
    return;
  }

  const [expression, score] = getTopExpression(detection.expressions);
  const mapped = moodColorMap[expression] || moodColorMap.neutral;

  moodEl.textContent = `Mood: ${mapped.mood}`;
  colorEl.textContent = `Color: ${mapped.color}`;
  confidenceEl.textContent = `Confidence: ${(score * 100).toFixed(1)}% (${expression})`;
  swatchEl.style.backgroundColor = mapped.color;
  setStatus('Face analyzed successfully.');
}

async function init() {
  const cameraReady = await startCamera();
  const modelsReady = await loadModels();

  isReady = cameraReady && modelsReady;
  setStatus(isReady ? 'Ready to analyze mood.' : 'Initialization incomplete.');
}

analyzeBtn.addEventListener('click', analyzeMood);
init();
