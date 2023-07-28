import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, useState } from "react";
import {
  discretizeAngle,
  getAngles,
  getBodyPoints,
  oneSideWorkout,
  showDemo,
  twoSideWorkout,
  writeOnCanvas,
} from "../utils";

import DownloadIcon from "../asset/download.png";
import RecordIcon from "../asset/record.png";
import StopIcon from "../asset/stop.png";

export const Webcam = ({ workoutOption }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const downloadRef = useRef(null);
  const workoutRef = useRef(null);
  const enableWebcamRef = useRef(null);
  const [buttonText, setButtonText] = useState("Start");
  const [isRecording, setIsRecording] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  let poseLandmarker: PoseLandmarker | undefined = undefined;

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

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia)
      console.warn("getUserMedia() is not supported by your browser");

    let cameraAspectRatio;
    const handleResize = () => {
      const videoHeight = videoElement.offsetHeight;
      const videoWidth = videoElement.offsetWidth;
      const videoActualWidth = videoHeight * cameraAspectRatio;
      const margin = Math.abs(videoActualWidth - videoWidth) / 2;
      canvasElement.style.height = videoElement.offsetHeight.toString() + "px";
      canvasElement.style.width =
        Math.round(videoElement.offsetHeight * cameraAspectRatio).toString() +
        "px";
      canvasElement.style.left = Math.round(margin).toString() + "px";
    };
    var mediaRecorder;

    let leftCount = 0;
    let rightCount = 0;
    let leftStage: "down" | "up" = "down";
    let rightStage: "down" | "up" = "down";
    let chunks = [];

    let initialize = true;
    let webcamRunning = false;
    let enableWebcamButton;
    let videoElement;
    let canvasElement;
    let aElement;
    videoElement = videoRef.current;
    canvasElement = canvasRef.current;
    aElement = downloadRef.current;
    enableWebcamButton = enableWebcamRef.current;

    const enableCam = () => {
      if (!webcamRunning) {
        webcamRunning = true;
        setButtonText("Loading...");
        if (!poseLandmarker) {
          console.log("Wait! poseLandmaker not loaded yet.");
          return;
        }
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: false })
          .then((stream) => {
            cameraAspectRatio = stream
              .getVideoTracks()[0]
              .getSettings().aspectRatio;
            const recordButton = document.getElementById("startRecording");
            const stopButton = document.getElementById("stopRecording");
            const videoStream = canvasRef.current.captureStream(30);
            const mixed = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...stream.getVideoTracks(),
            ]);
            if (recordButton && stopButton) {
              recordButton.addEventListener("click", () => {
                mediaRecorder = new MediaRecorder(mixed);
                mediaRecorder.ondataavailable = (e) => {
                  chunks.push(e.data);
                };
                mediaRecorder.onstop = (e) => {
                  const blob = new Blob(chunks, { type: "video/mp4" });
                  const videoURL = URL.createObjectURL(blob);
                  aElement = downloadRef.current;
                  aElement.href = videoURL;
                  chunks = [];
                  setIsRecording(false);
                  setIsDownloadReady(true);
                };
                setIsRecording(true);
                setIsDownloadReady(false);
                console.log(isRecording);
                return mediaRecorder.start();
              });

              stopButton.addEventListener("click", () => {
                setIsRecording(false);
                console.log(isRecording);
                return mediaRecorder.stop();
              });
            }
            videoElement.srcObject = stream;
            videoElement.addEventListener("loadeddata", predictWebcam);
          });
      }
    };
    enableWebcamButton.addEventListener("click", enableCam);
    window.addEventListener("resize", handleResize);

    // Enable the live webcam view and start detection.

    createPoseLandmarker();
    const canvasCtx = canvasElement.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);

    // If webcam supported, add event listener to button for when user
    // wants to activate it.

    let lastVideoTime = -1;
    let currentWorkout;
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    let leftLegAngle = 0;
    let rightLegAngle = 0;
    // Add timer for each rep
    let lastTimeLeftStageChange;
    let lastTimeRightStageChange;

    //   requestAnimationFrame(drawOnCanvas); for drawing canvas?

    const predictWebcam = async () => {
      const resetButton = document.getElementById("resetButton");
      if (resetButton)
        resetButton.addEventListener("click", () => {
          leftCount = 0;
          rightCount = 0;
        });
      if (currentWorkout !== workoutRef.current.innerHTML) {
        currentWorkout = workoutRef.current.innerHTML;
        leftCount = 0;
        rightCount = 0;
      }
      // Now let's start detecting the stream.
      if (initialize) {
        await poseLandmarker.setOptions({
          runningMode: "VIDEO",
          minPoseDetectionConfidence: 0.8,
          minPosePresenceConfidence: 0.5,
        });
        handleResize();
        initialize = false;
      }

      if (lastVideoTime !== videoElement.currentTime) {
        lastVideoTime = videoElement.currentTime;

        poseLandmarker.detectForVideo(
          videoElement,
          performance.now(),
          (result) => {
            canvasCtx.save();

            canvasCtx.font = "8px Arial";
            for (let landmark of result.landmarks) {
              const body = getBodyPoints(landmark);
              const angles = getAngles(body);

              leftArmAngle = discretizeAngle(leftArmAngle, angles.leftArmAngle);
              rightArmAngle = discretizeAngle(
                rightArmAngle,
                angles.rightArmAngle
              );
              leftLegAngle = discretizeAngle(leftLegAngle, angles.leftLegAngle);
              rightLegAngle = discretizeAngle(
                rightLegAngle,
                angles.rightLegAngle
              );
              const width = canvasElement.getBoundingClientRect().width;
              const height = canvasElement.getBoundingClientRect().height;
              canvasElement.width = width;
              canvasElement.height = height;
              canvasCtx.drawImage(
                videoElement,
                0,
                0,
                canvasElement.width,
                canvasElement.height
              );
              if (currentWorkout === "armCurl") {
                writeOnCanvas(
                  canvasElement,
                  "left",
                  leftArmAngle,
                  leftStage,
                  leftCount
                );
                writeOnCanvas(
                  canvasElement,
                  "right",
                  rightArmAngle,
                  rightStage,
                  rightCount
                );
                const threshold = { down: 120, up: 45 };
                const result = twoSideWorkout(
                  threshold,
                  leftArmAngle,
                  leftStage,
                  leftCount,
                  rightArmAngle,
                  rightStage,
                  rightCount
                );
                leftStage = result.leftStage;
                leftCount = result.leftCount;
                rightStage = result.rightStage;
                rightCount = result.rightCount;
              } else if (currentWorkout === "squat") {
                writeOnCanvas(
                  canvasElement,
                  "left",
                  leftLegAngle,
                  leftStage,
                  leftCount
                );
                writeOnCanvas(
                  canvasElement,
                  "right",
                  rightLegAngle,
                  rightStage,
                  rightCount
                );
                const threshold = { down: 100, up: 150 };
                const result = oneSideWorkout(
                  threshold,
                  leftLegAngle,
                  leftStage,
                  leftCount,
                  rightLegAngle
                );
                leftStage = result.leftStage;
                leftCount = result.leftCount;
              } else if (currentWorkout === "benchPress") {
                writeOnCanvas(
                  canvasElement,
                  "left",
                  leftArmAngle,
                  leftStage,
                  leftCount
                );
                writeOnCanvas(
                  canvasElement,
                  "right",
                  rightArmAngle,
                  rightStage,
                  rightCount
                );
                const threshold = { down: 50, up: 120 };
                const result = oneSideWorkout(
                  threshold,
                  leftArmAngle,
                  leftStage,
                  leftCount,
                  rightArmAngle
                );
                leftStage = result.leftStage;
                leftCount = result.leftCount;
              } else if (currentWorkout === "demo") {
                showDemo(
                  canvasElement,
                  body,
                  leftArmAngle,
                  leftLegAngle,
                  rightArmAngle,
                  rightLegAngle
                );
              }

              drawingUtils.drawLandmarks(landmark, {
                radius: (data) =>
                  DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
              });
              drawingUtils.drawConnectors(
                landmark,
                PoseLandmarker.POSE_CONNECTIONS
              );
            }
            // canvasCtx.restore();
          }
        );
      }

      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        setButtonText("Reset");
        window.requestAnimationFrame(predictWebcam);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutOption]);

  return (
    <div>
      <div className="w-1/12 m-auto">
        <button
          ref={enableWebcamRef}
          className={`${
            (!workoutOption && buttonText !== "Loading...") ||
            buttonText === "Reset"
              ? "hidden"
              : "block"
          } w-full p-3 bg-gray-400 rounded-lg`}
        >
          <span className="">{buttonText}</span>
        </button>
      </div>
      <span ref={workoutRef} hidden>
        {workoutOption?.value}
      </span>
      {buttonText !== "Start" && workoutOption && (
        <div className="w-full h-full m-auto md:w-2/3 lg:w-1/2">
          <div
            className={`${
              buttonText !== "Loading..." && workoutOption
                ? "inline-flex"
                : "hidden"
            } w-full m-auto h-full`}
          >
            <button
              id="resetButton"
              className="min-w-[145px] w-full h-16 p-3 mx-2 rounded-lg md:text-lg md:font-semibold bg-slate-800 text-slate-100"
            >
              Restart Count
            </button>
            <button
              id="startRecording"
              className={`${
                !isRecording ? "block" : "hidden"
              } w-full h-16 mx-2 rounded-lg bg-slate-800 min-w-[145px]`}
            >
              <div className="inline-flex w-full h-full">
                <img
                  src={RecordIcon}
                  alt="Record"
                  className="w-10 h-10 m-auto mr-2"
                />{" "}
                <span className="m-auto ml-0 md:font-semibold md:text-lg text-slate-100">
                  Record
                </span>
              </div>
            </button>
            <button
              id="stopRecording"
              className={`${
                isRecording ? "block" : "hidden"
              } w-full h-16 mx-2 rounded-lg bg-slate-800 min-w-[145px]`}
            >
              <div className="inline-flex w-full h-full">
                <img
                  src={StopIcon}
                  alt="Stop"
                  className="w-10 h-10 m-auto mr-2 "
                />
                <span className="m-auto ml-0 md:font-semibold md:text-lg text-slate-100">
                  Stop
                </span>
              </div>
            </button>
            <a
              ref={downloadRef}
              href="localhost:3001"
              className={`${
                !isRecording && isDownloadReady ? "block" : "hidden"
              } w-full h-full mx-2`}
              download={`${workoutOption.value}-${
                new Date().toISOString().split("T")[0]
              }.mp4`}
              target="_blank"
              rel="noreferrer"
            >
              <button className="w-full h-16 rounded-lg bg-slate-800 min-w-[145px]">
                <div className="inline-flex w-full h-full">
                  <img
                    src={DownloadIcon}
                    alt="Download"
                    className="w-10 h-10 m-auto mr-2 "
                  />
                  <span className="m-auto ml-0 md:font-semibold md:text-lg text-slate-100">
                    Download
                  </span>
                </div>
              </button>
            </a>
          </div>
        </div>
      )}
      <div style={{ position: "relative", margin: "10px" }}>
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "auto",
            maxHeight: "75vh",
          }}
          autoPlay
          playsInline
        ></video>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            maxHeight: "75vh",
          }}
        ></canvas>
        <script src="built/index.js"></script>
      </div>
    </div>
  );
};
