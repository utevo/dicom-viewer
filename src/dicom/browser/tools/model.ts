export enum Tool {
  Cursor = "CURSOR",
  Pan = "PAN",
  Rotate = "ROTATE",
  Windowing = "WINDOWING",
  Zoom = "ZOOM",
  AddMeasure = "ADD_MEASURE",
  ShowDetails = "SHOW_DETAILS",
  ResetView = "RESET_VIEW",
}
export const Tool_ = {
  default: (): Tool => Tool.Cursor,
};
