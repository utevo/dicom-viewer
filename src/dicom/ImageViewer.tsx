import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import { DicomImage } from "./domain/DicomImage";
import { ImageData_ } from "./domain/ImageData";

interface Props {
  dicomImage: DicomImage;
  width: number;
  height: number;
}

export const ImageViewer = ({ dicomImage, width, height }: Props): React.ReactElement => {
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap>();

  useEffect(() => {
    const tmp = async () => setImageBitmap(await createImageBitmap(ImageData_.fromDicomImage(dicomImage)));
    tmp();
  }, [dicomImage]);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <KonvaImage image={imageBitmap} />
      </Layer>
    </Stage>
  );
};
