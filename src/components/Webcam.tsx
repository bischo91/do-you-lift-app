import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, useState } from "react";
import { getAngles, getBodyPoints } from "../utils";

export const Webcam = ({workoutOption}) => {
  const [renderCountStage, setRenderCountStage] = useState({leftCount:0, leftStage: '', rightCount:0, rightStage:''})
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const divRef = useRef(null);
  const workoutRef = useRef(null)
  let leftCount = 0
  let rightCount = 0
  let leftStage = ''
  let rightStage = ''
  useEffect(() => {

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
      if (!poseLandmarker) {
        console.log("Wait! poseLandmaker not loaded yet.");
        return;
      }

      if (!webcamRunning) webcamRunning = true

      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        leftCount = 0
        rightCount = 0
        // Activate the webcam stream.
          video.srcObject = stream
          video.addEventListener("loadeddata", predictWebcam);
        });
    };


    createPoseLandmarker();
    let video = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    
    const handleResize = () => {
      canvasElement.style.height = video.offsetHeight.toString()+'px'
    }
    window.addEventListener('resize', handleResize)
    
    // If webcam supported, add event listener to button for when user
    // wants to activate it.
    if (!!navigator.mediaDevices?.getUserMedia) {
      enableWebcamButton = document.getElementById("webcamButton");
      enableWebcamButton.addEventListener("click", enableCam);
      
    } else {
      console.warn("getUserMedia() is not supported by your browser");
    }

    let lastVideoTime = -1;
    let currentWorkout
    const predictWebcam = async () => {
      if (currentWorkout !== workoutRef.current.innerHTML) {
        currentWorkout = workoutRef.current.innerHTML
        leftCount = 0
        rightCount = 0
      }
      // Now let's start detecting the stream.
      if (initialize) {
        await poseLandmarker.setOptions({
          runningMode: "VIDEO",
          minPoseDetectionConfidence: 0.8,
          minPosePresenceConfidence: 0.8,
        });
        handleResize()
        initialize=false
      }
      let startTimeMs = performance.now();
      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          for (let landmark of result.landmarks) {
            const body = getBodyPoints(landmark)
            const {leftArmAngle, rightArmAngle, leftLegAngle, rightLegAngle} = getAngles(body)
            
            canvasCtx.font = "8px Arial";
            canvasCtx.fillStyle = "black";

            if (currentWorkout === 'armCurl') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.fillText(`Angle: ${leftArmAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightArmAngle.toFixed(0)}`, 220, 7);
              if (leftArmAngle > 120) {
                leftStage='down'
              }
              if (leftArmAngle < 45 && leftStage === "down") {
                leftStage='up'
                leftCount++
              }
              if (rightArmAngle > 120) {
                rightStage='down'
              }
              if (rightArmAngle < 45 && rightStage === "down") {
                rightStage='up'
                rightCount++
              }
              canvasCtx.fillText(`Reps: ${leftCount}`, 10, 15);
              canvasCtx.fillText(`Reps: ${rightCount}`, 220, 15);
            } else if (currentWorkout === 'squat') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              if (leftLegAngle > 160 && rightLegAngle > 160 && leftStage === "down") {
                leftStage='up'
                leftCount++
              }
              if (leftLegAngle <  100 && rightLegAngle < 100) {
                leftStage='down'
              }
              canvasCtx.fillText(`Angle: ${leftLegAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightLegAngle.toFixed(0)}`, 220, 7);
              canvasCtx.fillText(`Reps: ${leftCount}`, 10, 15);
              // canvasCtx.fillText(`Reps: ${rightCounter}`, 220, 15);
            } else if (currentWorkout === 'benchPress') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              if (leftArmAngle > 160 && rightArmAngle > 160 && leftStage === "down") {
                leftStage='up'
                leftCount++
              }
              if (leftArmAngle <  90 && rightArmAngle < 90) {
                leftStage='down'
              }
              canvasCtx.fillText(`Angle: ${leftArmAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightArmAngle.toFixed(0)}`, 220, 7);
              canvasCtx.fillText(`Reps: ${leftCount}`, 10, 15);              
            } else if (currentWorkout === 'benchPress') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              if (leftArmAngle > 160 && rightArmAngle > 160 && leftStage === "down") {
                leftStage='up'
                leftCount++
              }
              if (leftArmAngle <  90 && rightArmAngle < 90) {
                leftStage='down'
              }
              canvasCtx.fillText(`Angle: ${leftArmAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightArmAngle.toFixed(0)}`, 220, 7);
              canvasCtx.fillText(`Reps: ${leftCount}`, 10, 15);              
            } else if (currentWorkout === 'demo') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              canvasCtx.fillText(`left arm angle: ${leftArmAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`left leg angle: ${leftLegAngle.toFixed(0)}`, 10, 17);
              canvasCtx.fillText(`left wrist: (${body.left.wrist.x.toFixed(2)}, ${body.left.wrist.y.toFixed(2)}, ${body.left.wrist.z.toFixed(2)})`, 10, 27);
              canvasCtx.fillText(`left elbow: (${body.left.elbow.x.toFixed(2)}, ${body.left.elbow.y.toFixed(2)}, ${body.left.elbow.z.toFixed(2)})`, 10, 37);
              canvasCtx.fillText(`left shoulder: (${body.left.shoulder.x.toFixed(2)}, ${body.left.shoulder.y.toFixed(2)}, ${body.left.shoulder.z.toFixed(2)})`, 10, 47);
              canvasCtx.fillText(`left hip: (${body.left.hip.x.toFixed(2)}, ${body.left.hip.y.toFixed(2)}, ${body.left.hip.z.toFixed(2)})`, 10, 57);
              canvasCtx.fillText(`left knee: (${body.left.knee.x.toFixed(2)}, ${body.left.knee.y.toFixed(2)}, ${body.left.knee.z.toFixed(2)})`, 10, 67);
              canvasCtx.fillText(`left ankle: (${body.left.ankle.x.toFixed(2)}, ${body.left.ankle.y.toFixed(2)}, ${body.left.ankle.z.toFixed(2)})`, 10, 77);
              canvasCtx.fillText(`right arm angle: ${rightArmAngle.toFixed(0)}`, 200, 7);
              canvasCtx.fillText(`right leg angle: ${rightLegAngle.toFixed(0)}`, 200, 17);
              canvasCtx.fillText(`right wrist: (${body.right.wrist.x.toFixed(2)}, ${body.right.wrist.y.toFixed(2)}, ${body.right.wrist.z.toFixed(2)})`, 200, 27);
              canvasCtx.fillText(`right elbow: (${body.right.elbow.x.toFixed(2)}, ${body.right.elbow.y.toFixed(2)}, ${body.right.elbow.z.toFixed(2)})`, 200, 37);
              canvasCtx.fillText(`right shoulder: (${body.right.shoulder.x.toFixed(2)}, ${body.right.shoulder.y.toFixed(2)}, ${body.right.shoulder.z.toFixed(2)})`, 200, 47);
              canvasCtx.fillText(`right hip: (${body.right.hip.x.toFixed(2)}, ${body.right.hip.y.toFixed(2)}, ${body.right.hip.z.toFixed(2)})`, 200, 57);
              canvasCtx.fillText(`right knee: (${body.right.knee.x.toFixed(2)}, ${body.right.knee.y.toFixed(2)}, ${body.right.knee.z.toFixed(2)})`, 200, 67);
              canvasCtx.fillText(`right ankle: (${body.right.ankle.x.toFixed(2)}, ${body.right.ankle.y.toFixed(2)}, ${body.right.ankle.z.toFixed(2)})`, 200, 77);
            }
            
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) =>
                DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(
              landmark,
              PoseLandmarker.POSE_CONNECTIONS
            );
            if (workoutOption) setRenderCountStage({leftCount, leftStage, rightCount, rightStage})
          }

          canvasCtx.restore();
        });
      }

      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {      
        window.requestAnimationFrame(predictWebcam);

        // setRightCounter(rightCount)
        // setRightStage(rightStage)
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutOption]);
    // , cameraDimension?.height, cameraDimension?.width

  return (
    <div>
    <div>
    <button id="webcamButton" className="p-3 bg-gray-400 rounded-lg">
        <span className="">Start </span>
    </button>
    </div>
    <span ref={workoutRef}>{workoutOption?.value}</span>
    <div className="inline-flex w-full">
      <div className="flex-col w-full ml-0 space-y-2">
        <span>{renderCountStage.leftStage}</span>
        <span>{renderCountStage.leftCount}</span>
      </div>
      <div className="flex-col w-full mr-0 space-y-2">
        <span>{renderCountStage.rightStage}</span>
        <span>{renderCountStage.rightCount}</span>
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
          height: "auto"
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
          width:"100%"
        }}
      ></canvas>
      <script src="built/index.js"></script>
    </div>
    </div>
  );
};
