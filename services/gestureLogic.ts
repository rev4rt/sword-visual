
import { GestureType, HandData } from '../types';
import { GESTURE_THRESHOLDS } from '../constants';

export const analyzeGesture = (landmarks: any[]): GestureType => {
  if (!landmarks || landmarks.length === 0) return GestureType.IDLE;

  // Calculate distances from palm (landmark 0: WRIST)
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const getDistance = (p1: any, p2: any) => 
    Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  const fingerDistances = [
    getDistance(wrist, indexTip),
    getDistance(wrist, middleTip),
    getDistance(wrist, ringTip),
    getDistance(wrist, pinkyTip)
  ];

  const avgDistance = fingerDistances.reduce((a, b) => a + b, 0) / 4;

  // 1. Pointing Detection: Index is far, others are close
  const indexDist = getDistance(wrist, indexTip);
  const otherAvgDist = (getDistance(wrist, middleTip) + getDistance(wrist, ringTip) + getDistance(wrist, pinkyTip)) / 3;
  if (indexDist > 0.25 && otherAvgDist < 0.15) {
    return GestureType.POINTING;
  }

  // 2. Fist Detection
  if (avgDistance < GESTURE_THRESHOLDS.FIST_CLOSE) {
    return GestureType.FIST;
  }

  // 3. Open Palm Detection
  if (avgDistance > GESTURE_THRESHOLDS.OPEN_PALM_SPREAD) {
    return GestureType.OPEN_PALM;
  }

  return GestureType.IDLE;
};

export const getPalmCenter = (landmarks: any[]) => {
  if (!landmarks || landmarks.length === 0) return { x: 0, y: 0, z: 0 };
  const wrist = landmarks[0];
  const indexMCP = landmarks[5];
  const pinkyMCP = landmarks[17];

  return {
    x: (wrist.x + indexMCP.x + pinkyMCP.x) / 3,
    y: (wrist.y + indexMCP.y + pinkyMCP.y) / 3,
    z: (wrist.z + indexMCP.z + pinkyMCP.z) / 3
  };
};

export const getPointingDirection = (landmarks: any[]) => {
  const wrist = landmarks[0];
  const indexTip = landmarks[8];
  return {
    x: indexTip.x - wrist.x,
    y: -(indexTip.y - wrist.y), // Flip Y for 3D world space
    z: indexTip.z - wrist.z
  };
};
