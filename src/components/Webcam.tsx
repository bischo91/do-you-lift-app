import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import { calculateAngle, getLandMarkIndex } from "../utils";

import React from "react";

export const Webcam = () => {
  React.useEffect(() => {
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
    // Enable the live webcam view and start detection.
    const enableCam = () => {
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
    };

    createPoseLandmarker();
    const video = document.getElementById("webcam") as HTMLVideoElement;
    const canvasElement = document.getElementById(
      "output_canvas"
    ) as HTMLCanvasElement;
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

    let lastVideoTime = -1;

    const predictWebcam = async () => {
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
          for (let landmark of result.landmarks) {
            // const leftShoulder: [number, number] = [landmark[11].x, landmark[11].y];
            const leftShoulder = getLandMarkIndex(landmark).leftShoulder;
            const leftElbow: [number, number] = [
              landmark[13].x,
              landmark[13].y,
            ];
            const leftWrist: [number, number] = [
              landmark[15].x,
              landmark[15].y,
            ];
            const angle = calculateAngle(
              [leftShoulder.x, leftShoulder.y],
              leftElbow,
              leftWrist
            );
            canvasCtx.font = "10px Arial";
            canvasCtx.fillStyle = "lime";
            canvasCtx.fillText(`Angle: ${angle.toFixed(2)}`, 10, 10);

            if (angle > 120) {
              stage = "down";
            }
            if (angle < 45 && stage === "down") {
              stage = "up";
              counter++;
            }
            canvasCtx.font = "10px Arial";
            canvasCtx.fillStyle = "blue";
            canvasCtx.fillText(`Reps: ${counter}`, 10, 35);

            drawingUtils.drawLandmarks(landmark, {
              radius: (data) =>
                DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(
              landmark,
              PoseLandmarker.POSE_CONNECTIONS
            );
          }

          canvasCtx.restore();
        });
      }

      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
      }
    };
  }, []);
  return (
    <div>
      <h1>Do You Lift?</h1>

      <section id="demos" className="invisible">
        <div id="liveView" className="videoView">
          <div>
            {/* <select name="Choose workout" size="3" multiple>
              <option>Dumbbell curl (left)</option>
              <option>Dumbbell curl (right)</option>
              <option>Bench Press</option>
              <option>Squat</option>
              <option>Deadlift</option>
            </select> */}
          </div>
          <div>
            <button id="webcamButton" className="mdc-button mdc-button--raised">
              <span className="mdc-button__ripple"></span>
              <span className="mdc-button__label">ENABLE WEBCAM</span>
            </button>
          </div>
          <div style={{ position: "relative", margin: "10px" }}>
            <video
              id="webcam"
              style={{
                width: "1280px",
                height: "720px",
                position: "absolute",
                left: "0px",
                top: "0px",
              }}
              autoPlay
              playsInline
              // className="w-full"
            ></video>
            <canvas
              className="output_canvas"
              id="output_canvas"
              style={{
                position: "absolute",
                left: "0px",
                top: "0px",
              }}
            ></canvas>
            <script src="built/index.js"></script>
          </div>
        </div>
      </section>
    </div>
  );
};
