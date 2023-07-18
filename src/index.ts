import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

import { calculateAngle, getLandMarkIndex } from "./utils";

const demosSection: HTMLElement | null = document.getElementById("demos");

let poseLandmarker: PoseLandmarker | undefined = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
const videoHeight = "360px";
const videoWidth = "480px";

const createPoseLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
  );
  poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    // runningMode: "LIVE_STREAM",
    numPoses: 1,
  });
};

createPoseLandmarker();

const video = <HTMLVideoElement>document.getElementById("webcam");
const canvasElement = <HTMLCanvasElement>(
  document.getElementById("output_canvas")
);
const canvasCtx = canvasElement.getContext("2d");
const drawingUtils = new DrawingUtils(canvasCtx);
let stage = null;
let counter = 0;
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
  enableWebcamButton = document.getElementById("webcamButton");
  enableWebcamButton.addEventListener("click", enableCam);
} else {
  console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam() {
  if (!poseLandmarker) {
    console.log("Wait! poseLandmaker not loaded yet.");
    return;
  }

  if (webcamRunning === true) {
    webcamRunning = false;
    enableWebcamButton.innerText = "ENABLE PREDICTIONS";
  } else {
    webcamRunning = true;
    enableWebcamButton.innerText = "DISABLE PREDICTIONS";
  }

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
    video.addEventListener("loadeddata", predictWebcam);
  });
}

let lastVideoTime = -1;
async function predictWebcam() {
  canvasElement.style.height = videoHeight;
  video.style.height = videoHeight;
  canvasElement.style.width = videoWidth;
  video.style.width = videoWidth;
  // Now let's start detecting the stream.
  if (runningMode === "IMAGE") {
    runningMode = "VIDEO";
    await poseLandmarker.setOptions({
      runningMode: "VIDEO",
      minPoseDetectionConfidence: 0.7,
      minPosePresenceConfidence: 0.7,
    });
  }
  let startTimeMs = performance.now();

  if (lastVideoTime !== video.currentTime) {
    lastVideoTime = video.currentTime;

    poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      console.log(result);
      for (let landmark of result.landmarks) {
        // const leftShoulder: [number, number] = [landmark[11].x, landmark[11].y];
        const leftShoulder = getLandMarkIndex(landmark).leftShoulder;
        const leftElbow: [number, number] = [landmark[13].x, landmark[13].y];
        const leftWrist: [number, number] = [landmark[15].x, landmark[15].y];
        const angle = calculateAngle(
          [leftShoulder.x, leftShoulder.y],
          leftElbow,
          leftWrist
        );
        canvasCtx.font = "50px Arial";
        canvasCtx.fillStyle = "lime";
        canvasCtx.fillText(`Angle: ${angle.toFixed(2)}`, 10, 30);

        if (angle > 120) {
          stage = "down";
        }
        if (angle < 45 && stage === "down") {
          stage = "up";
          counter++;
        }
        canvasCtx.font = "50px Arial";
        canvasCtx.fillStyle = "blue";
        canvasCtx.fillText(`Reps: ${counter}`, 10, 80);

        drawingUtils.drawLandmarks(landmark, {
          radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
        });
        drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
      }

      canvasCtx.restore();
    });
  }

  // Call this function again to keep predicting when the browser is ready.
  if (webcamRunning === true) {
    window.requestAnimationFrame(predictWebcam);
  }
}
