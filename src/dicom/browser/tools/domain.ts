import { ValueOf } from "src/common/utility-types";

const tool = {
  Cursor: "CURSOR",
  Pan: "PAN",
  Rotate: "ROTATE",
  Windowing: "WINDOWING",
  Zoom: "ZOOM",
  AddMeasure: "ADD_MEASURE",
  ShowDetails: "SHOW_DETAILS",
  ResetView: "RESET_VIEW",
} as const;
export type Tool = ValueOf<typeof tool>;
export const Tool = {
  ...tool,
  default: (): Tool => Tool.Cursor,
};
