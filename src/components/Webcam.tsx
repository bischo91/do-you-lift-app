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
import store from "../redux/store";

export const Webcam = ({ workoutOption }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const downloadRef = useRef(null);
  const workoutRef = useRef(null);
  const enableWebcamRef = useRef(null);
  const restartRef = useRef(null);
  const recordRef = useRef(null);
  const stopRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
        setIsLoading(true);
        webcamRunning = true;
        enableWebcamRef.current.hidden = true;
        if (!poseLandmarker) {
          console.log("Wait! poseLandmaker not loaded yet.");
          return;
        }
        navigator.mediaDevices
          .getUserMedia({
            video: { facingMode: "user" },
            audio: false,
          })
          .then((stream) => {
            cameraAspectRatio = stream
              .getVideoTracks()[0]
              .getSettings().aspectRatio;
            const frameRate = stream
              .getVideoTracks()[0]
              .getSettings().frameRate;
            const videoStream = canvasRef.current.captureStream(frameRate);
            const mixed = new MediaStream([
              ...videoStream.getVideoTracks(),
              ...stream.getVideoTracks(),
            ]);
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
              setIsDownloadReady(true);
            };
            recordRef.current.addEventListener("click", () => {
              setIsRecording(true);
              setIsDownloadReady(false);
              return mediaRecorder.start();
            });

            stopRef.current.addEventListener("click", () => {
              setIsRecording(false);
              return mediaRecorder.stop();
            });

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
    let threshold;

    //   requestAnimationFrame(drawOnCanvas); for drawing canvas?
    const predictWebcam = async () => {
      if (restartRef.current)
        restartRef.current.addEventListener("click", () => {
          leftCount = 0;
          rightCount = 0;
        });
      if (currentWorkout !== workoutRef.current.innerHTML) {
        currentWorkout = workoutRef.current.innerHTML;
        leftCount = 0;
        rightCount = 0;
        threshold = {
          down:
            store.getState().settings[currentWorkout].userDefinedSettings
              ?.angleDown ??
            store.getState().settings[currentWorkout].defaultSettings
              ?.angleDown,
          up:
            store.getState().settings[currentWorkout].userDefinedSettings
              ?.angleUp ??
            store.getState().settings[currentWorkout].defaultSettings?.angleUp,
          time:
            store.getState().settings[currentWorkout].userDefinedSettings
              ?.thresholdTime ??
            store.getState().settings[currentWorkout].defaultSettings
              ?.thresholdTime,
        };
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
        setIsLoading(false);
      }

      if (lastVideoTime !== videoRef.current.currentTime) {
        console.log(threshold);
        lastVideoTime = videoRef.current.currentTime;
        if (!lastTimeLeftStageChange) lastTimeLeftStageChange = lastVideoTime;
        if (!lastTimeRightStageChange) lastTimeRightStageChange = lastVideoTime;
        poseLandmarker.detectForVideo(
          videoRef.current,
          performance.now(),
          (result) => {
            // canvasCtx.translate(canvasElement.width, 0);
            // canvasCtx.scale(-1, 1);
            canvasCtx.drawImage(
              videoRef.current,
              0,
              0,
              canvasElement.width,
              canvasElement.height
            );
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
              canvasCtx.translate(canvasElement.width, 0);
              canvasCtx.scale(-1, 1);
              canvasCtx.drawImage(
                videoRef.current,
                0,
                0,
                canvasElement.width,
                canvasElement.height
              );
              if (currentWorkout === "armCurl") {
                // const threshold = { down: 120, up: 45, time: 0.75 };

                // threshold.down =
                //   store.getState().settings[currentWorkout].userDefinedSettings
                //     ?.angleDown ??
                //   store.getState().settings[currentWorkout].defaultSettings
                //     ?.angleDown;
                // threshold.up =
                //   store.getState().settings[currentWorkout].userDefinedSettings
                //     ?.angleUp ??
                //   store.getState().settings[currentWorkout].defaultSettings
                //     ?.angleUp;
                // threshold.time =
                //   store.getState().settings[currentWorkout].userDefinedSettings
                //     ?.thresholdTime ??
                //   store.getState().settings[currentWorkout].defaultSettings
                //     ?.thresholdTime;
                // console.log(threshold);

                const result = twoSideWorkout(
                  threshold,
                  leftArmAngle,
                  leftStage,
                  leftCount,
                  rightArmAngle,
                  rightStage,
                  rightCount
                );
                if (
                  lastVideoTime - lastTimeLeftStageChange > threshold.time &&
                  leftCount !== result.leftCount
                ) {
                  leftCount = result.leftCount;
                }
                if (leftStage !== result.leftStage) {
                  lastTimeLeftStageChange = lastVideoTime;
                }
                if (
                  lastVideoTime - lastTimeRightStageChange > threshold.time &&
                  rightCount !== result.rightCount
                ) {
                  rightCount = result.rightCount;
                }
                if (rightStage !== result.rightStage) {
                  lastTimeRightStageChange = lastVideoTime;
                }
                rightStage = result.rightStage;
                leftStage = result.leftStage;
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
              } else if (currentWorkout === "squat") {
                // const threshold = { down: 100, up: 150, time: 0.75 };
                const result = oneSideWorkout(
                  threshold,
                  leftLegAngle,
                  leftStage,
                  leftCount,
                  rightLegAngle
                );
                if (
                  lastVideoTime - lastTimeLeftStageChange > threshold.time &&
                  leftCount !== result.leftCount
                ) {
                  leftCount = result.leftCount;
                }
                if (leftStage !== result.leftStage) {
                  lastTimeLeftStageChange = lastVideoTime;
                }
                leftStage = result.leftStage;
                writeOnCanvas(
                  canvasElement,
                  "left",
                  leftLegAngle,
                  leftStage,
                  leftCount
                );
              } else if (currentWorkout === "benchPress") {
                // const threshold = { down: 50, up: 120, time: 0.75 };
                const result = oneSideWorkout(
                  threshold,
                  leftArmAngle,
                  leftStage,
                  leftCount,
                  rightArmAngle
                );
                if (
                  lastVideoTime - lastTimeLeftStageChange > threshold.time &&
                  leftCount !== result.leftCount
                ) {
                  leftCount = result.leftCount;
                }
                if (leftStage !== result.leftStage) {
                  lastTimeLeftStageChange = lastVideoTime;
                }
                leftStage = result.leftStage;

                writeOnCanvas(
                  canvasElement,
                  "left",
                  leftArmAngle,
                  leftStage,
                  leftCount
                );
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
        enableWebcamButton.hidden = true;
        setIsStreaming(true);
        window.requestAnimationFrame(predictWebcam);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutOption]);

  return (
    <div>
      <div className={`${workoutOption ?? "hidden"} w-full m-auto`}>
        <button ref={enableWebcamRef} className="">
          <span className="min-w-[145px] w-full h-16 p-3 mx-2 rounded-lg md:text-lg md:font-semibold bg-slate-800 text-slate-100">
            Start
          </span>
        </button>
      </div>
      <span ref={workoutRef} hidden>
        {workoutOption?.value}
      </span>
      {isLoading && (
        <span className="min-w-[145px] w-full h-16 p-3 mx-2 rounded-lg md:text-lg md:font-semibold bg-slate-800 text-slate-100">
          Loading...
        </span>
      )}
      <div
        className={`${
          !isStreaming && "hidden"
        } w-full h-full m-auto md:w-2/3 lg:w-1/2`}
      >
        <div className="inline-flex w-full h-full m-auto">
          <button
            ref={restartRef}
            className="min-w-[145px] w-full h-16 p-3 mx-2 rounded-lg md:text-lg md:font-semibold bg-slate-800 text-slate-100"
          >
            Restart Count
          </button>
          <button
            ref={recordRef}
            className={`${
              !isRecording ? "block" : "hidden"
            } w-full h-16 mx-2 rounded-lg bg-slate-800 min-w-[145px]`}
          >
            <div className="inline-flex w-full h-full">
              <img
                src={RecordIcon}
                alt="Record"
                className="w-10 h-10 m-auto mr-2"
              />
              <span className="m-auto ml-0 md:font-semibold md:text-lg text-slate-100">
                Record
              </span>
            </div>
          </button>
          <button
            ref={stopRef}
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
            download={`${workoutOption?.value}-${
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
            maxHeight: "75vh",
          }}
        ></canvas>
        {/* <script src="built/index.js"></script> */}
      </div>
    </div>
  );
};
