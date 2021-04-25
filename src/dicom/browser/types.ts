export interface ViewPort {
  position: Position;
  rotation: number;
}

export interface Position {
  x: number;
  y: number;
}

export enum Tool {
  Nothing = "NOTHING",
  Pan = "PAN",
  Rotate = "ROTATE",
}
