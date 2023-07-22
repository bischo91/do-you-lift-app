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
      shoulder:getLandMarkIndex(landmark).leftShoulder,
      elbow:getLandMarkIndex(landmark).leftElbow,
      wrist:getLandMarkIndex(landmark).leftWrist,
      hip:getLandMarkIndex(landmark).leftHip,
      knee:getLandMarkIndex(landmark).leftKnee,
      ankle:getLandMarkIndex(landmark).leftAnkle
    },
    right: {
      shoulder:getLandMarkIndex(landmark).rightShoulder,
      elbow: getLandMarkIndex(landmark).rightElbow,
      wrist: getLandMarkIndex(landmark).rightWrist,
      hip:getLandMarkIndex(landmark).rightHip,
      knee:getLandMarkIndex(landmark).rightKnee,
      ankle:getLandMarkIndex(landmark).rightAnkle
    }
  }
}

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
  )
  const rightLegAngle = calculateAngle(
    [body.right.hip.x, body.right.hip.y],
    [body.right.knee.x, body.right.knee.y],
    [body.right.ankle.x, body.right.ankle.y]
  )
  return {leftArmAngle, rightArmAngle, leftLegAngle, rightLegAngle}
}