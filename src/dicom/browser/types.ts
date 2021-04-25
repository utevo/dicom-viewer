export interface ViewPort {
  position: Position;
}

export interface Position {
  x: number;
  y: number;
}

export enum Tool {
  Nothing = "NOTHING",
  Pan = "PAN",
}
