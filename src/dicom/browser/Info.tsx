import { VoiLutModule } from "../domain/DicomObject";
import { Position, ViewPort, VoiLutModuleOffset } from "./types";

interface Props {
  viewPort: ViewPort;
  voiLutModule?: VoiLutModule;
  voiLutModuleOffset?: VoiLutModuleOffset;
}

export const Info = ({ viewPort, voiLutModule, voiLutModuleOffset }: Props): React.ReactElement => {
  return (
    <ul>
      <li>View Port: {JSON.stringify(viewPort)}</li>
      {voiLutModule && <li>VOI LUT Module: {JSON.stringify(voiLutModule)}</li>}
      {voiLutModuleOffset && <li>VOI LUT Module Offset: {JSON.stringify(voiLutModuleOffset)}</li>}
    </ul>
  );
};
