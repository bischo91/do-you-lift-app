"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLandMarkIndex = exports.calculateAngle = void 0;
var calculateAngle = function (a, b, c) {
    var radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
    var angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180) {
        angle = 360 - angle;
    }
    return angle;
};
exports.calculateAngle = calculateAngle;
var getLandMarkIndex = function (landmark) {
    var landmarkMapped = {
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
exports.getLandMarkIndex = getLandMarkIndex;
