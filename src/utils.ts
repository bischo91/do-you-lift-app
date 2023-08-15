import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export const calculateAngle = (
  a: [number, number],
  b: [number, number],
  c: [number, number]
): number => {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180) {
    angle = 360 - angle;
  }

  return angle;
};

export const discretizeAngle = (prevAngle, currentAngle) => {
  return Math.abs(currentAngle - prevAngle) > 7
    ? Math.round(currentAngle / 10) * 10
    : prevAngle;
};

export const getLandMarkIndex = (
  landmark: NormalizedLandmark[]
): { [key: string]: NormalizedLandmark } => {
  const landmarkMapped: { [key: string]: { x: number; y: number; z: number } } =
    {
      nose: landmark[0],
      innerLeftEye: landmark[1],
      leftEye: landmark[2],
      OuterLeftEye: landmark[3],
      innerRightEye: landmark[4],
      rightEye: landmark[5],
      outerRightEye: landmark[6],
      leftEar: landmark[7],
      rightEar: landmark[8],
      leftMouth: landmark[9],
      rightMouth: landmark[10],
      leftShoulder: landmark[11],
      rightShoulder: landmark[12],
      leftElbow: landmark[13],
      rightElbow: landmark[14],
      leftWrist: landmark[15],
      rightWrist: landmark[16],
      leftPinky: landmark[17],
      rightPinky: landmark[18],
      leftIndex: landmark[19],
      rightIndex: landmark[20],
      leftThumb: landmark[21],
      rightThumb: landmark[22],
      leftHip: landmark[23],
      rightHip: landmark[24],
      leftKnee: landmark[25],
      rightKnee: landmark[26],
      leftAnkle: landmark[27],
      rightAnkle: landmark[28],
      leftHeel: landmark[29],
      rightHeel: landmark[30],
      leftFootIndex: landmark[31],
      rightFootIndex: landmark[32],
    };
  return landmarkMapped;
};

export const getBodyPoints = (landmark) => {
  return {
    left: {
      shoulder: getLandMarkIndex(landmark).leftShoulder,
      elbow: getLandMarkIndex(landmark).leftElbow,
      wrist: getLandMarkIndex(landmark).leftWrist,
      hip: getLandMarkIndex(landmark).leftHip,
      knee: getLandMarkIndex(landmark).leftKnee,
      ankle: getLandMarkIndex(landmark).leftAnkle,
    },
    right: {
      shoulder: getLandMarkIndex(landmark).rightShoulder,
      elbow: getLandMarkIndex(landmark).rightElbow,
      wrist: getLandMarkIndex(landmark).rightWrist,
      hip: getLandMarkIndex(landmark).rightHip,
      knee: getLandMarkIndex(landmark).rightKnee,
      ankle: getLandMarkIndex(landmark).rightAnkle,
    },
  };
};

export const getAngles = (body) => {
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
  );
  const rightLegAngle = calculateAngle(
    [body.right.hip.x, body.right.hip.y],
    [body.right.knee.x, body.right.knee.y],
    [body.right.ankle.x, body.right.ankle.y]
  );
  return { leftArmAngle, rightArmAngle, leftLegAngle, rightLegAngle };
};
export const writeOnCanvas = (
  canvasElement: HTMLCanvasElement,
  side: "left" | "right",
  angle,
  stage,
  count
) => {
  const width = canvasElement.getBoundingClientRect().width;
  const height = canvasElement.getBoundingClientRect().height;
  const canvasContext = canvasElement.getContext("2d");
  canvasContext.save();
  canvasContext.translate(canvasElement.width, 0);
  canvasContext.scale(-1, 1);
  const fillX = side === "left" ? 0 : side === "right" ? (width * 5) / 6 : 0;
  const fillY = 0;
  const widthX = height > width ? height / 6 : width / 6;
  const widthY = (height * 2) / 12;
  const textX =
    side === "left"
      ? (0.125 * width) / 6
      : side === "right"
      ? (5.125 * width) / 6
      : (0.125 * width) / 6;
  const angleY = (1.25 * height) / 24;
  const countY = (2.25 * height) / 24;
  const stageY = (3.25 * height) / 24;

  canvasContext.font = `${Math.round(widthX / 10).toString()}px Arial`;
  canvasContext.fillStyle = "black";
  canvasContext.fillRect(fillX, fillY, widthX, widthY);
  canvasContext.fillStyle = "white";
  canvasContext.fillText(`Angle: ${angle.toFixed(0)}\u00B0`, textX, angleY);
  canvasContext.fillText(`Count: ${count}`, textX, countY);
  canvasContext.fillText(stage.toUpperCase(), textX, stageY);
  canvasContext.restore();
};

export const twoSideWorkout = (
  threshold: { down: number; up: number },
  leftAngle: number,
  leftStage: "up" | "down",
  leftCount: number,
  rightAngle: number,
  rightStage: "up" | "down",
  rightCount: number
) => {
  if (leftAngle >= threshold.down) {
    leftStage = "down";
  }
  if (leftAngle <= threshold.up && leftStage === "down") {
    leftStage = "up";
    leftCount++;
  }
  if (rightAngle >= threshold.down) {
    rightStage = "down";
  }
  if (rightAngle <= threshold.up && rightStage === "down") {
    rightStage = "up";
    rightCount++;
  }

  return { leftStage, leftCount, rightStage, rightCount };
};

export const oneSideWorkout = (
  threshold: { down: number; up: number },
  leftAngle: number,
  leftStage: "up" | "down",
  leftCount: number,
  rightAngle: number
) => {
  if (
    leftAngle >= threshold.up &&
    rightAngle >= threshold.up &&
    leftStage === "down"
  ) {
    leftStage = "up";
    leftCount++;
  }
  if (leftAngle <= threshold.down && rightAngle <= threshold.down) {
    leftStage = "down";
  }
  return { leftStage, leftCount };
};

export const showDemo = (
  canvasElement,
  body,
  leftArmAngle,
  leftLegAngle,
  rightArmAngle,
  rightLegAngle
) => {
  const canvasContext = canvasElement.getContext("2d");
  canvasContext.save();
  canvasContext.translate(canvasElement.width, 0);
  canvasContext.scale(-1, 1);
  const width = canvasElement.getBoundingClientRect().width;
  const height = canvasElement.getBoundingClientRect().height;
  const textHeight = height / 9 / 3;
  canvasContext.font = `${Math.round(
    (height > width ? width : height) / 40
  ).toString()}px Arial`;
  canvasContext.fillStyle = "black";
  canvasContext.fillRect((2 * width) / 3, 0, width / 3, height / 3);
  canvasContext.fillRect(0, 0, width / 3, height / 3);
  canvasContext.fillStyle = "white";
  canvasContext.fillText(
    `left arm angle: ${leftArmAngle.toFixed(0)}`,
    10,
    textHeight * 1
  );
  canvasContext.fillText(
    `left leg angle: ${leftLegAngle.toFixed(0)}`,
    10,
    textHeight * 2
  );
  canvasContext.fillText(
    `left wrist: (${body.left.wrist.x.toFixed(2)}, ${body.left.wrist.y.toFixed(
      2
    )}, ${body.left.wrist.z.toFixed(2)})`,
    10,
    textHeight * 3
  );
  canvasContext.fillText(
    `left elbow: (${body.left.elbow.x.toFixed(2)}, ${body.left.elbow.y.toFixed(
      2
    )}, ${body.left.elbow.z.toFixed(2)})`,
    10,
    textHeight * 4
  );
  canvasContext.fillText(
    `left shoulder: (${body.left.shoulder.x.toFixed(
      2
    )}, ${body.left.shoulder.y.toFixed(2)}, ${body.left.shoulder.z.toFixed(
      2
    )})`,
    10,
    textHeight * 5
  );
  canvasContext.fillText(
    `left hip: (${body.left.hip.x.toFixed(2)}, ${body.left.hip.y.toFixed(
      2
    )}, ${body.left.hip.z.toFixed(2)})`,
    10,
    textHeight * 6
  );
  canvasContext.fillText(
    `left knee: (${body.left.knee.x.toFixed(2)}, ${body.left.knee.y.toFixed(
      2
    )}, ${body.left.knee.z.toFixed(2)})`,
    10,
    textHeight * 7
  );
  canvasContext.fillText(
    `left ankle: (${body.left.ankle.x.toFixed(2)}, ${body.left.ankle.y.toFixed(
      2
    )}, ${body.left.ankle.z.toFixed(2)})`,
    10,
    textHeight * 8
  );
  canvasContext.fillText(
    `right arm angle: ${rightArmAngle.toFixed(0)}`,
    10 + (2 * width) / 3,
    textHeight * 1
  );
  canvasContext.fillText(
    `right leg angle: ${rightLegAngle.toFixed(0)}`,
    10 + (2 * width) / 3,
    textHeight * 2
  );
  canvasContext.fillText(
    `right wrist: (${body.right.wrist.x.toFixed(
      2
    )}, ${body.right.wrist.y.toFixed(2)}, ${body.right.wrist.z.toFixed(2)})`,
    10 + (2 * width) / 3,
    textHeight * 3
  );
  canvasContext.fillText(
    `right elbow: (${body.right.elbow.x.toFixed(
      2
    )}, ${body.right.elbow.y.toFixed(2)}, ${body.right.elbow.z.toFixed(2)})`,
    10 + (2 * width) / 3,
    textHeight * 4
  );
  canvasContext.fillText(
    `right shoulder: (${body.right.shoulder.x.toFixed(
      2
    )}, ${body.right.shoulder.y.toFixed(2)}, ${body.right.shoulder.z.toFixed(
      2
    )})`,
    10 + (2 * width) / 3,
    textHeight * 5
  );
  canvasContext.fillText(
    `right hip: (${body.right.hip.x.toFixed(2)}, ${body.right.hip.y.toFixed(
      2
    )}, ${body.right.hip.z.toFixed(2)})`,
    10 + (2 * width) / 3,
    textHeight * 6
  );
  canvasContext.fillText(
    `right knee: (${body.right.knee.x.toFixed(2)}, ${body.right.knee.y.toFixed(
      2
    )}, ${body.right.knee.z.toFixed(2)})`,
    10 + (2 * width) / 3,
    textHeight * 7
  );
  canvasContext.fillText(
    `right ankle: (${body.right.ankle.x.toFixed(
      2
    )}, ${body.right.ankle.y.toFixed(2)}, ${body.right.ankle.z.toFixed(2)})`,
    10 + (2 * width) / 3,
    textHeight * 8
  );
  canvasContext.restore();
};
