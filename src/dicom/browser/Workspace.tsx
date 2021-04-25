import Konva from "konva";
import React, { useEffect, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage } from "react-konva";
import { Image } from "../domain/Image";
import { ImageData_ } from "../domain/ImageData";
import { ViewPort } from "./types";

interface Props {
  width: number;
  height: number;

  image: Image | undefined;

  viewPort: ViewPort;

  onMouseDown: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const Workspace = ({
  image,
  viewPort,
  width,
  height,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: Props): React.ReactElement | null => {
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap>();

  useEffect(() => {
    if (image != undefined) (async () => setImageBitmap(await createImageBitmap(ImageData_.fromImage(image))))();
  }, [image]);

  return image ? (
    <Stage width={width} height={height} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <Layer>
        <Group width={width} height={height} x={viewPort.position.x} y={viewPort.position.y}>
          <KonvaImage image={imageBitmap} />
        </Group>
      </Layer>
    </Stage>
  ) : null;
};
