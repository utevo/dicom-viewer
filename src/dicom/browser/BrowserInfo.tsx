import { capitalCase } from "change-case";
import cn from "clsx";

import { ViewPort, WindowingOffset } from "src/dicom/browser/utils";
import { VoiLutModule, VoiLutWindow } from "src/dicom/model/attributes";

type Props = {
  viewPort: ViewPort;
  voiLutModule?: VoiLutModule;
  windowingOffset?: WindowingOffset;

  className?: string;
};

export const BrowserInfo = ({ viewPort, voiLutModule, windowingOffset, className }: Props): React.ReactElement => {
  const window: VoiLutWindow | undefined =
    voiLutModule !== undefined
      ? {
          center: voiLutModule.window.center + (windowingOffset?.windowCenterOffset ?? 0),
          width: voiLutModule.window.width + (windowingOffset?.windowWidthOffset ?? 0),
        }
      : undefined;

  const browserInfo = {
    rotation: `${viewPort.rotation % 360}°`,
    zoom: `${viewPort.zoom.toFixed(2)}`,
    ...(window && { "window center": window.center.toFixed(0), "window width" : window.width.toFixed(0) }),
  };

  return (
    <table className={cn("table-fixed bg-white w-80", className)}>
      <tbody>
        {Object.entries(browserInfo)
          .filter(([_, value]) => value != null)
          .map(([name, value]) => (
            <tr key={name}>
              <td className="border px-4 py-2 text-emerald-600 text-center">{capitalCase(name)}</td>
              <td className="border px-4 py-2 text-emerald-600 text-center">
                {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
