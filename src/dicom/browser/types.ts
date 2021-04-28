export interface ViewPort {
  position: Position;
  rotation: number;
}
export const ViewPort = {
  default: (): ViewPort => {
    return {
      position: { x: 0, y: 0 },
      rotation: 0,
    };
  },
};

export interface Position {
  x: number;
  y: number;
}

export interface VoiLutModuleOffset {
  windowCenterOffset: number;
  windowWidthOffset: number;
}
export const VoiLutModuleOffset = {
  default: (): VoiLutModuleOffset => {
    return {
      windowCenterOffset: 0,
      windowWidthOffset: 0,
    };
  },
};
