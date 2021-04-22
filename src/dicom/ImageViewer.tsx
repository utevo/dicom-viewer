import React, { useEffect, useState } from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import { Image } from "./domain/Image";
import { ImageData_ } from "./domain/ImageData";

interface Props {
  image: Image;
  width: number;
  height: number;
}

export const ImageViewer = ({ image, width, height }: Props): React.ReactElement => {
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap>();

  useEffect(() => {
    const tmp = async () => setImageBitmap(await createImageBitmap(ImageData_.fromImage(image)));
    tmp();
  }, [image]);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <KonvaImage image={imageBitmap} />
      </Layer>
    </Stage>
  );
};
