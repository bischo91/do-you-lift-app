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
  showAngles,
  showDemo,
  twoSideWorkout,
} from "../utils";

// import { RecordIcon } from "../asset/record-button";
import RecordIcon from "../asset/record.png";
import StopIcon from "../asset/stop.png";

export const Webcam = ({ workoutOption }) => {
  const [renderCountStage, setRenderCountStage] = useState({
    leftCount: 0,
    leftStage: "",
    rightCount: 0,
    rightStage: "",
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const workoutRef = useRef(null);
  const [buttonText, setButtonText] = useState("Start");
  const [isWebcamRunning, setIsWebcamRunning] = useState(false);
  let downloadUrl;
  const [isRecording, setIsRecording] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);

  useEffect(() => {
    var mediaRecorder;

    let leftCount = 0;
    let rightCount = 0;
    let leftStage: "down" | "up" = "down";
    let rightStage: "down" | "up" = "down";
    let chunks = [];

    let poseLandmarker: PoseLandmarker | undefined = undefined;
    let initialize = true;
    let enableWebcamButton;
    let webcamRunning = false;

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
      setButtonText("Loading...");
      if (!poseLandmarker) {
        console.log("Wait! poseLandmaker not loaded yet.");
        return;
      }

      if (!webcamRunning || !isWebcamRunning) {
        webcamRunning = true;
        setIsWebcamRunning(true);
      }

      // define below and use it
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          leftCount = 0;
          rightCount = 0;
          // Activate the webcam stream.
          const recordButton = document.getElementById("startRecording");
          const stopButton = document.getElementById("stopRecording");
          const videoStream = canvasRef.current.captureStream(30);
          const mixed = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...stream.getVideoTracks(),
          ]);
          mediaRecorder = new MediaRecorder(mixed);
          mediaRecorder.ondataavailable = (e) => {
            chunks.push(e.data);
          };
          if (recordButton && stopButton) {
            // if (isRecording) mediaRecorder.start();
            // else mediaRecorder.stop();
            recordButton.addEventListener("click", () => {
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
            mediaRecorder.onstop = (e) => {
              const blob = new Blob(chunks, { type: "video/mp4" });
              const videoURL = URL.createObjectURL(blob);
              videoRef.current.src = videoURL;
              const aDownload: any = document.getElementById("download");
              aDownload.href = videoURL;
              console.log("onstop");
              aDownload.download = "video_test.mp4";

              // aDownload.textContent = aDownload.download;
              console.log(videoURL);
              chunks = [];
              setIsRecording(false);
              setIsDownloadReady(true);
            };
          }

          video.srcObject = stream;
          video.addEventListener("loadeddata", predictWebcam);
        });
    };

    createPoseLandmarker();
    let video = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);

    const handleResize = () => {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          const cameraAspectRatio = stream
            .getVideoTracks()[0]
            .getSettings().aspectRatio;
          const videoHeight = video.offsetHeight;
          const videoWidth = video.offsetWidth;
          const videoActualWidth = videoHeight * cameraAspectRatio;
          const margin = Math.abs(videoActualWidth - videoWidth) / 2;
          canvasElement.style.height = video.offsetHeight.toString() + "px";
          canvasElement.style.width =
            Math.round(video.offsetHeight * cameraAspectRatio).toString() +
            "px";
          canvasElement.style.left = Math.round(margin).toString() + "px";
        });
    };
    window.addEventListener("resize", handleResize);

    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (!!navigator.mediaDevices?.getUserMedia) {
      enableWebcamButton = document.getElementById("webcamButton");
      enableWebcamButton.addEventListener("click", enableCam);
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }

    let lastVideoTime = -1;
    let currentWorkout;
    let leftArmAngle = 0;
    let rightArmAngle = 0;
    let leftLegAngle = 0;
    let rightLegAngle = 0;

    const drawOnCanvas = () => {
      canvasElement
        .getContext("2d")
        .drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
      requestAnimationFrame(drawOnCanvas);
    };

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
          minPosePresenceConfidence: 0.8,
        });
        handleResize();
        initialize = false;
      }
      let startTimeMs = performance.now();

      if (lastVideoTime !== video.currentTime) {
        canvasElement
          .getContext("2d")
          .clearRect(0, 0, canvasElement.width, canvasElement.height);
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
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
              video,
              0,
              0,
              canvasElement.width,
              canvasElement.height
            );
            drawOnCanvas();
            // video.style = "display:hidden";
            if (currentWorkout === "armCurl") {
              showAngles(canvasElement, "left", leftArmAngle);
              showAngles(canvasElement, "right", rightArmAngle);
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
              showAngles(canvasElement, "left", leftLegAngle);
              showAngles(canvasElement, "right", rightLegAngle);
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
              showAngles(canvasElement, "left", leftArmAngle);
              showAngles(canvasElement, "right", rightArmAngle);
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
            if (workoutOption)
              setRenderCountStage({
                leftCount,
                leftStage,
                rightCount,
                rightStage,
              });
          }

          canvasCtx.restore();
        });
      }

      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {
        setButtonText("Reset");
        window.requestAnimationFrame(predictWebcam);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutOption]);

  // const resetCount = () => {
  //   return { leftCount: 0, rightCount: 0 };
  // };

  return (
    <div>
      <div className="w-1/12 m-auto">
        <button
          id="webcamButton"
          className={`${
            (isWebcamRunning || !workoutOption) && buttonText !== "Loading..."
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
      <div className="w-1/2 h-full m-auto">
        <div
          className={`${
            isWebcamRunning && buttonText !== "Loading..."
              ? "inline-flex"
              : "hidden"
          } w-full m-auto h-full`}
        >
          <button
            id="resetButton"
            // onClick={() => setResetCount(true)}
            className="w-1/2 h-full p-3 mx-2 bg-gray-400 rounded-lg"
          >
            Restart Count
          </button>
          <button
            id="startRecording"
            className={`${
              !isRecording ? "block" : "hidden"
            } z-50 w-10 h-full mx-2 rounded-lg`}
          >
            <img src={RecordIcon} alt="Record" className="w-10 h-10 m-auto" />
          </button>
          <button
            id="stopRecording"
            className={`${
              isRecording ? "block" : "hidden"
            } w-10 h-full mx-2 rounded-lg`}
          >
            <img src={StopIcon} alt="Stop" className="w-10 h-10 m-auto" />
          </button>
          <a
            id="download"
            href={downloadUrl}
            className={`${
              !isRecording && isDownloadReady ? "block" : "hidden"
            } w-1/2 mx-2`}
            download="test.mp4"
          >
            <button className="w-full p-3 mx-2 bg-gray-400 rounded-lg">
              Download {downloadUrl}
            </button>
          </a>
        </div>
        <div className="inline-flex w-full">
          {isWebcamRunning && workoutOption?.value !== "demo" && (
            <div className="flex-col w-full ml-0 space-y-2">
              <div className="text-4xl">
                <span className="text-">
                  {renderCountStage.leftStage?.toUpperCase()}
                </span>
              </div>
              <div className="text-4xl">
                <span>{renderCountStage.leftCount}</span>
              </div>
            </div>
          )}
          {isWebcamRunning && workoutOption?.value === "armCurl" && (
            <div className="flex-col w-full mr-0 space-y-2">
              <div className="text-4xl">
                <span>{renderCountStage.rightStage?.toUpperCase()}</span>
              </div>
              <div className="text-4xl">
                <span>{renderCountStage.rightCount}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ position: "relative", margin: "10px" }} ref={divRef}>
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
