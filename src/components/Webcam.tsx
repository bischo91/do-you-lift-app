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
  useEffect(() => {
    let leftCount = 0;
    let rightCount = 0;
    let leftStage: "down" | "up" = "down";
    let rightStage: "down" | "up" = "down";

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

      if (!webcamRunning) webcamRunning = true;

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        leftCount = 0;
        rightCount = 0;
        // Activate the webcam stream.
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
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        const cameraAspectRatio = stream
          .getVideoTracks()[0]
          .getSettings().aspectRatio;
        const videoHeight = video.offsetHeight;
        const videoWidth = video.offsetWidth;
        const videoActualWidth = videoHeight * cameraAspectRatio;
        const margin = Math.abs(videoActualWidth - videoWidth) / 2;
        canvasElement.style.height = video.offsetHeight.toString() + "px";
        canvasElement.style.width =
          Math.round(video.offsetHeight * cameraAspectRatio).toString() + "px";
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
    const predictWebcam = async () => {
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
          minPosePresenceConfidence: 0.9,
        });
        handleResize();
        initialize = false;
      }
      let startTimeMs = performance.now();

      if (lastVideoTime !== video.currentTime) {
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

            canvasElement
              .getContext("2d")
              .clearRect(0, 0, canvasElement.width, canvasElement.height);
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
              // canvasCtx.clearRect(
              //   0,
              //   0,
              //   canvasElement.width,
              //   canvasElement.height
              // );
              // canvasCtx.fillText(
              //   `left arm angle: ${leftArmAngle.toFixed(0)}`,
              //   10,
              //   7
              // );
              // canvasCtx.fillText(
              //   `left leg angle: ${leftLegAngle.toFixed(0)}`,
              //   10,
              //   17
              // );
              // canvasCtx.fillText(
              //   `left wrist: (${body.left.wrist.x.toFixed(
              //     2
              //   )}, ${body.left.wrist.y.toFixed(
              //     2
              //   )}, ${body.left.wrist.z.toFixed(2)})`,
              //   10,
              //   27
              // );
              // canvasCtx.fillText(
              //   `left elbow: (${body.left.elbow.x.toFixed(
              //     2
              //   )}, ${body.left.elbow.y.toFixed(
              //     2
              //   )}, ${body.left.elbow.z.toFixed(2)})`,
              //   10,
              //   37
              // );
              // canvasCtx.fillText(
              //   `left shoulder: (${body.left.shoulder.x.toFixed(
              //     2
              //   )}, ${body.left.shoulder.y.toFixed(
              //     2
              //   )}, ${body.left.shoulder.z.toFixed(2)})`,
              //   10,
              //   47
              // );
              // canvasCtx.fillText(
              //   `left hip: (${body.left.hip.x.toFixed(
              //     2
              //   )}, ${body.left.hip.y.toFixed(2)}, ${body.left.hip.z.toFixed(
              //     2
              //   )})`,
              //   10,
              //   57
              // );
              // canvasCtx.fillText(
              //   `left knee: (${body.left.knee.x.toFixed(
              //     2
              //   )}, ${body.left.knee.y.toFixed(2)}, ${body.left.knee.z.toFixed(
              //     2
              //   )})`,
              //   10,
              //   67
              // );
              // canvasCtx.fillText(
              //   `left ankle: (${body.left.ankle.x.toFixed(
              //     2
              //   )}, ${body.left.ankle.y.toFixed(
              //     2
              //   )}, ${body.left.ankle.z.toFixed(2)})`,
              //   10,
              //   77
              // );
              // canvasCtx.fillText(
              //   `right arm angle: ${rightArmAngle.toFixed(0)}`,
              //   200,
              //   7
              // );
              // canvasCtx.fillText(
              //   `right leg angle: ${rightLegAngle.toFixed(0)}`,
              //   200,
              //   17
              // );
              // canvasCtx.fillText(
              //   `right wrist: (${body.right.wrist.x.toFixed(
              //     2
              //   )}, ${body.right.wrist.y.toFixed(
              //     2
              //   )}, ${body.right.wrist.z.toFixed(2)})`,
              //   200,
              //   27
              // );
              // canvasCtx.fillText(
              //   `right elbow: (${body.right.elbow.x.toFixed(
              //     2
              //   )}, ${body.right.elbow.y.toFixed(
              //     2
              //   )}, ${body.right.elbow.z.toFixed(2)})`,
              //   200,
              //   37
              // );
              // canvasCtx.fillText(
              //   `right shoulder: (${body.right.shoulder.x.toFixed(
              //     2
              //   )}, ${body.right.shoulder.y.toFixed(
              //     2
              //   )}, ${body.right.shoulder.z.toFixed(2)})`,
              //   200,
              //   47
              // );
              // canvasCtx.fillText(
              //   `right hip: (${body.right.hip.x.toFixed(
              //     2
              //   )}, ${body.right.hip.y.toFixed(2)}, ${body.right.hip.z.toFixed(
              //     2
              //   )})`,
              //   200,
              //   57
              // );
              // canvasCtx.fillText(
              //   `right knee: (${body.right.knee.x.toFixed(
              //     2
              //   )}, ${body.right.knee.y.toFixed(
              //     2
              //   )}, ${body.right.knee.z.toFixed(2)})`,
              //   200,
              //   67
              // );
              // canvasCtx.fillText(
              //   `right ankle: (${body.right.ankle.x.toFixed(
              //     2
              //   )}, ${body.right.ankle.y.toFixed(
              //     2
              //   )}, ${body.right.ankle.z.toFixed(2)})`,
              //   200,
              //   77
              // );
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

        // setRightCounter(rightCount)
        // setRightStage(rightStage)
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutOption]);

  return (
    <div>
      <div>
        <button id="webcamButton" className="p-3 bg-gray-400 rounded-lg">
          <span className="">{buttonText}</span>
        </button>
      </div>
      <span ref={workoutRef} hidden>
        {workoutOption?.value}
      </span>
      <div className="inline-flex w-full">
        {buttonText === "Reset" && workoutOption?.value !== "demo" && (
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
        {buttonText === "Reset" && workoutOption?.value === "armCurl" && (
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
      <div style={{ position: "relative", margin: "10px" }} ref={divRef}>
        <video
          ref={videoRef}
          style={{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "100%",
            height: "auto",
            maxHeight: "70vh",
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
            maxHeight: "70vh",
          }}
        ></canvas>
        <script src="built/index.js"></script>
      </div>
    </div>
  );
};
