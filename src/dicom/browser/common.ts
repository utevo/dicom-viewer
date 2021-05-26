export type ViewPort = Readonly<{
  position: Position;
  rotation: number;
  zoom: number;
}>;
export const ViewPort = {
  default: (): ViewPort => {
    return {
      position: { x: 0, y: 0 },
      rotation: 0,
      zoom: 1,
    };
  },
};

export type Position = Readonly<{
  x: number;
  y: number;
}>;
export const Position = {
  add: (vector: Position, otherVector: Position): Position => ({
    x: vector.x + otherVector.x,
    y: vector.y + otherVector.y,
  }),
  subtract: (vector: Position, otherVector: Position): Position => ({
    x: vector.x - otherVector.x,
    y: vector.y - otherVector.y,
  }),
};

export type WindowingOffset = Readonly<{
  windowCenterOffset: number;
  windowWidthOffset: number;
}>;
export const WindowingOffset = {
  default: (): WindowingOffset => {
    return {
      windowCenterOffset: 0,
      windowWidthOffset: 0,
    };
  },
};

export type Measure = Readonly<{
  pointPosition: Position;
  otherPointPosition: Position;
}>;

export type Measures = Record<string, Measure>;
