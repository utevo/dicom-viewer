export type ViewPort = {
  position: Vector2D;
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

export type Vector2D = {
  readonly x: number;
  readonly y: number;
};
export const Vector2D = {
  add: (vector: Vector2D, otherVector: Vector2D): Vector2D => ({
    x: vector.x + otherVector.x,
    y: vector.y + otherVector.y,
  }),
  subtract: (vector: Vector2D, otherVector: Vector2D): Vector2D => ({
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
