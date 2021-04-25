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
  onMouseLeave: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const Workspace = ({
  image,
  viewPort,
  width,
  height,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}: Props): React.ReactElement | null => {
  const [imageBitmap, setImageBitmap] = useState<ImageBitmap>();

  useEffect(() => {
    if (image != undefined) (async () => setImageBitmap(await createImageBitmap(ImageData_.fromImage(image))))();
  }, [image]);

  const offset = image
    ? {
        x: image.columns / 2,
        y: image.rows / 2,
      }
    : {
        x: 0,
        y: 0,
      };

  return image ? (
    <Stage
      width={width}
      height={height}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <Layer>
        <Group
          width={image.columns}
          height={image.rows}
          x={viewPort.position.x + offset.x}
          y={viewPort.position.y + offset.y}
          rotation={viewPort.rotation}
          offset={offset}
        >
          <KonvaImage image={imageBitmap} />
        </Group>
      </Layer>
    </Stage>
  ) : null;
};
