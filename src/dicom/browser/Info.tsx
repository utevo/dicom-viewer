import { VoiLutModule } from "../domain/DicomObject";
import { Position, ViewPort, WindowingOffset } from "./types";

interface Props {
  viewPort: ViewPort;
  voiLutModule?: VoiLutModule;
  voiLutModuleOffset?: WindowingOffset;
}

export const Info = ({ viewPort, voiLutModule, voiLutModuleOffset }: Props): React.ReactElement => {
  return (
    <ul>
      <li>View Port: {JSON.stringify(viewPort)}</li>
      {voiLutModule && <li>VOI LUT Module: {JSON.stringify(voiLutModule)}</li>}
      {voiLutModuleOffset && <li>Windowing Offset: {JSON.stringify(voiLutModuleOffset)}</li>}
    </ul>
  );
};
