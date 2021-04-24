import React, { useEffect, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage } from "react-konva";
import { Image } from "../domain/Image";
import { ImageData_ } from "../domain/ImageData";

interface Props {
  width: number;
  height: number;

  image: Image | undefined;

  viewPort: {
    x: number;
    y: number;
  };
}

export const Workspace = ({ image, viewPort, width, height }: Props): React.ReactElement | null => {
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap>();

  useEffect(() => {
    if (image != undefined) (async () => setImageBitmap(await createImageBitmap(ImageData_.fromImage(image))))();
  }, [image]);

  return image ? (
    <Stage width={width} height={height}>
      <Layer>
        <Group width={width} height={height} x={viewPort.x} y={viewPort.y}>
          <Rect stroke="red" />
                      {/* <KonvaImage image={imageBitmap} /> */}
        </Group>
      </Layer>
    </Stage>
  ) : null;
};
