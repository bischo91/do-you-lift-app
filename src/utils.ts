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
