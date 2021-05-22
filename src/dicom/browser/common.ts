export type ViewPort = {
  position: Position;
  rotation: number;
  zoom: number;
};
export const ViewPort = {
  default: (): ViewPort => {
    return {
      position: { x: 0, y: 0 },
      rotation: 0,
      zoom: 1,
    };
  },
};

export type Position = {
  readonly x: number;
  readonly y: number;
};
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

export type WindowingOffset = {
  windowCenterOffset: number;
  windowWidthOffset: number;
};
export const WindowingOffset = {
  default: (): WindowingOffset => {
    return {
      windowCenterOffset: 0,
      windowWidthOffset: 0,
    };
  },
};
