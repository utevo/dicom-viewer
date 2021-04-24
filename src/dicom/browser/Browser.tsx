import * as React from "react";
import { ImportDicomImage } from "../ImportDicomImage";
import { Tools } from "./Tools";
import { Workspace } from "./Workspace";
import { Image, Image_ } from "../domain/Image";
import { DicomImage } from "../domain/DicomImage";

interface BrowserState {
  image: Image | undefined;
  viewPort: {
    x: number;
    y: number;
  };
}

export const Browser = (): React.ReactElement => {
  const [browserState, setBrowserState] = React.useState<BrowserState>({ image: undefined, viewPort: { x: 100, y: 20 } });

  const handleImageChange = (newDicomImage: DicomImage) => {
    setBrowserState({ ...browserState, image: Image_.fromDicomImage(newDicomImage) });
  };

  return (
    <div>
      <ImportDicomImage onImport={handleImageChange} />
      <Tools />
      <Workspace image={browserState.image} width={300} height={400} viewPort={browserState.viewPort} />
    </div>
  );
};
