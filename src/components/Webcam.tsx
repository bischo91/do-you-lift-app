import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import React, { useEffect, useRef, useState } from "react";
import { calculateAngle, getBodyPoints } from "../utils";

export const Webcam = ({workoutOption}) => {
  const [leftStage, setLeftStage] = useState('')
  const [leftCounter, setLeftCounter] = useState(0)
  const [rightStage, setRightStage] = useState('')
  const [rightCounter, setRightCounter] = useState(0)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const divRef = useRef(null);

  // const [cameraDimension, setCameraDimension] = useState(null)
  // let videoHeight
  // let videoWidth
  useEffect(() => {
    let leftCount = 0
    let rightCount = 0
    let leftUpDown = ''
    let rightUpDown = ''
    // videoHeight = (window.innerWidth*(cameraDimension?.height/cameraDimension?.width ?? 3/4)).toString()+'px';
    // videoWidth = window.innerWidth.toString()+'px';
    let poseLandmarker: PoseLandmarker | undefined = undefined;
    let runningMode = "IMAGE";
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

      if (webcamRunning) {
        webcamRunning = false;
        enableWebcamButton.innerText = "ENABLE PREDICTIONS";
      } else {
        webcamRunning = true;
        enableWebcamButton.innerText = "DISABLE PREDICTIONS";
      }

      // Activate the webcam stream.
      navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        // setCameraDimension(stream.getVideoTracks()[0].getSettings())
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
      });
    };

    createPoseLandmarker();
    const video = videoRef.current;
    const canvasElement = canvasRef.current;
    const canvasCtx = canvasElement.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    
    const handleResize = () => {
      canvasElement.style.height = video.offsetHeight.toString()+'px'
    }
    window.addEventListener('resize', handleResize)
    
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
      // Now let's start detecting the stream.
      if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await poseLandmarker.setOptions({
          runningMode: "VIDEO",
          minPoseDetectionConfidence: 0.7,
          minPosePresenceConfidence: 0.7,
        });
        handleResize()
      }
      let startTimeMs = performance.now();

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;

        poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
          canvasCtx.save();
          for (let landmark of result.landmarks) {
            // const leftShoulder: [number, number] = [landmark[11].x, landmark[11].y];
            const body = getBodyPoints(landmark)

            const leftArmAngle = calculateAngle(
              [body.left.shoulder.x, body.left.shoulder.y],
              [body.left.elbow.x, body.left.elbow.y],
              [body.left.wrist.x, body.left.wrist.y]
            );
            const rightArmAngle = calculateAngle(
              [body.right.shoulder.x, body.right.shoulder.y],
              [body.right.elbow.x, body.right.elbow.y],
              [body.right.wrist.x, body.right.wrist.y]
            );
            const leftLegAngle = calculateAngle(
              [body.left.hip.x, body.left.hip.y],
              [body.left.knee.x, body.left.knee.y],
              [body.left.ankle.x, body.left.ankle.y]
            )
            const rightLegAngle = calculateAngle(
              [body.right.hip.x, body.right.hip.y],
              [body.right.knee.x, body.right.knee.y],
              [body.right.ankle.x, body.right.ankle.y]
            )
            canvasCtx.font = "8px Arial";
            canvasCtx.fillStyle = "black";

            if (workoutOption?.value === 'armCurl') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              const leftAngle = leftArmAngle
              const rightAngle = rightArmAngle
              canvasCtx.fillText(`Angle: ${leftAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightAngle.toFixed(0)}`, 220, 7);
              // console.log(leftStage)
              // console.log(leftCounter)
              // console.log(leftAngle)
              console.log(leftUpDown)
              console.log(leftCount)
              if (leftAngle > 120) {
                leftUpDown='down'
                  // console.log('downn')
                  // setLeftStage("down");

                  // console.log(leftStage)
              }
              if (leftAngle < 45 && leftUpDown === "down") {
                // setLeftStage("up");
                // setLeftCounter((prevCount) => prevCount+1)
                leftUpDown='up'
                leftCount++
              }
              if (rightAngle > 120) {
                // setRightStage("down");
                rightUpDown='down'
              }
              if (rightAngle < 45 && rightUpDown === "down") {
                // setRightStage("up");
                // setRightCounter((prevCount) => prevCount+1);
                rightUpDown='up'
                rightCount++
              }
              canvasCtx.fillText(`Reps: ${leftCounter}`, 10, 15);
              canvasCtx.fillText(`Reps: ${rightCounter}`, 220, 15);
            } else if (workoutOption?.value === 'squat') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              const leftAngle = leftLegAngle
              const rightAngle = rightLegAngle
              if (leftAngle > 160 && rightAngle > 160) {
                setLeftStage("up");
                setLeftCounter((prevCount) => prevCount+1)
              }
              if (leftAngle <  100 && rightAngle < 100 && leftStage === "up") {
                setLeftStage("down");
              }
              canvasCtx.fillText(`Angle: ${leftAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightAngle.toFixed(0)}`, 220, 7);
              canvasCtx.fillText(`Reps: ${leftCounter}`, 10, 15);
              // canvasCtx.fillText(`Reps: ${rightCounter}`, 220, 15);
            } else if (workoutOption?.value === 'benchPress') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              const leftAngle = leftArmAngle
              const rightAngle = rightArmAngle
              if (leftAngle > 160 && rightAngle > 160) {
                setLeftStage("up");
                setLeftCounter((prevCount) => prevCount+1)
              }
              if (leftAngle <  90 && rightAngle < 90 && leftStage === "up") {
                setLeftStage("down");
              }
              canvasCtx.fillText(`Angle: ${leftAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightAngle.toFixed(0)}`, 220, 7);
              canvasCtx.fillText(`Reps: ${leftCounter}`, 10, 15);              
            } else if (workoutOption?.value === 'benchPress') {
              canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
              const leftAngle = leftArmAngle
              const rightAngle = rightArmAngle
              if (leftAngle > 160 && rightAngle > 160) {
                setLeftStage("up");
                setLeftCounter((prevCount) => prevCount+1)
              }
              if (leftAngle <  90 && rightAngle < 90 && leftStage === "up") {
                setLeftStage("down");
              }
              canvasCtx.fillText(`Angle: ${leftAngle.toFixed(0)}`, 10, 7);
              canvasCtx.fillText(`Angle: ${rightAngle.toFixed(0)}`, 220, 7);
              canvasCtx.fillText(`Reps: ${leftCounter}`, 10, 15);              
            } else if (workoutOption?.value === 'demo') {
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
          }

          canvasCtx.restore();
        });
      }

      // Call this function again to keep predicting when the browser is ready.
      if (webcamRunning === true) {      
        window.requestAnimationFrame(predictWebcam);
        setLeftCounter(leftCount)
        setLeftStage(leftUpDown)
        setRightCounter(rightCount)
        setRightStage(rightUpDown)
      }
    };
  }, [leftCounter, leftStage, rightCounter, rightStage, workoutOption]);
    // , cameraDimension?.height, cameraDimension?.width

  return (
    <div>
    <div>
    <button id="webcamButton" className="p-3 bg-gray-400 rounded-lg">
        <span className="">ENABLE WEBCAM</span>
    </button>
    </div>
    <span>{workoutOption?.label}</span>
    <div className="inline-flex w-full">
      <div className="flex-col w-full ml-0 space-y-2">
        <span>{leftStage}</span>
        <span>{leftCounter}</span>
      </div>
      <div className="flex-col w-full mr-0 space-y-2">
        <span>{rightStage}</span>
        <span>{rightCounter}</span>
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
