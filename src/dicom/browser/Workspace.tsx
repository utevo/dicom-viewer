import Konva from "konva";
import React, { useEffect, useState } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage } from "react-konva";
import { ViewPort } from "./common";

type Props = {
  width: number;
  height: number;

  imageData: ImageData | undefined;

  viewPort: ViewPort;

  onMouseDown: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
};

export const Workspace = ({
  imageData,
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
    if (imageData != undefined) (async () => setImageBitmap(await createImageBitmap(imageData)))();
  }, [imageData]);

  const offset = imageData
    ? {
        x: imageData.width / 2,
        y: imageData.height / 2,
      }
    : {
        x: 0,
        y: 0,
      };

  return imageData ? (
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
          width={imageData.width}
          height={imageData.height}
          x={viewPort.position.x + offset.x}
          y={viewPort.position.y + offset.y}
          rotation={viewPort.rotation}
          offset={offset}
          scale={{ x: viewPort.zoom, y: viewPort.zoom }}
        >
          <KonvaImage image={imageBitmap} />
        </Group>
      </Layer>
    </Stage>
  ) : null;
};
