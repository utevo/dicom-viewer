import { capitalCase } from "change-case";
import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";

import { VoiLutModule } from "../domain/common";
import { ViewPort, WindowingOffset } from "./common";

type Props = {
  viewPort: ViewPort;
  voiLutModule?: VoiLutModule;
  voiLutModuleOffset?: WindowingOffset;

  className?: string;
};

export const BrowserInfo = ({ viewPort, voiLutModule, voiLutModuleOffset, className }: Props): React.ReactElement => {
  const [browserInfo] = useBrowserInfo();
  return (
    <ul className={className}>
      <li>View Port: {JSON.stringify(viewPort)}</li>
      {voiLutModule && <li>VOI LUT Module: {JSON.stringify(voiLutModule)}</li>}
      {voiLutModuleOffset && <li>Windowing Offset: {JSON.stringify(voiLutModuleOffset)}</li>}
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
    </ul>
  );
};

type BrowserInfo = Record<string, unknown>;
type BrowserInfoContextValue = [BrowserInfo, Dispatch<SetStateAction<BrowserInfo>>];

const browserInfoContextValueStub: BrowserInfoContextValue = [{}, () => undefined];

const BrowserInfoContext = createContext<BrowserInfoContextValue>(browserInfoContextValueStub);

type BrowserInfoProvideProps = {
  children: React.ReactNode;
};
export const BrowserInfoProvider = ({ children }: BrowserInfoProvideProps): React.ReactElement => {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({});

  return <BrowserInfoContext.Provider value={[browserInfo, setBrowserInfo]}>{children}</BrowserInfoContext.Provider>;
};

export const useBrowserInfo = (): BrowserInfoContextValue => useContext(BrowserInfoContext);
