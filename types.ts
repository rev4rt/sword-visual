
export enum GestureType {
  IDLE = 'IDLE',
  OPEN_PALM = 'OPEN_PALM',
  FIST = 'FIST',
  POINTING = 'POINTING',
  VORTEX = 'VORTEX',
  MERGE = 'MERGE'
}

export interface HandData {
  landmarks: any[];
  gesture: GestureType;
  palmCenter: { x: number, y: number, z: number };
  direction: { x: number, y: number, z: number };
}

export interface SystemState {
  isLoaded: boolean;
  isCameraActive: boolean;
  swordCount: number;
  detectedHands: HandData[];
}
