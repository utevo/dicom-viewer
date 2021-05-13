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
  x: number;
  y: number;
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
