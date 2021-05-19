import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import React, { useEffect, useState } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Line, Rect, Stage } from "react-konva";
import { Position, ViewPort } from "./common";

type Props = {
  width: number;
  height: number;

  imageData: ImageData | undefined;
  viewPort: ViewPort;

  measures: Measure[];
  onMeasuresChange: (newMeasures: Measure[]) => void;

  onMouseDown: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (evt: Konva.KonvaEventObject<MouseEvent>) => void;
};

export const Workspace = ({
  width,
  height,
  imageData,
  viewPort,
  measures,
  onMeasuresChange,
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

  const handleMeasureChange = (idx: number, newMeasure: Measure): void => {
    const newMeasures = [...measures];
    newMeasures[idx] = newMeasure;
    onMeasuresChange(newMeasures);
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

          {measures.map((measure, idx) => (
            <MeasureComponent
              key={idx}
              measure={measure}
              onMeasureChange={(newMeasure) => handleMeasureChange(idx, newMeasure)}
            />
          ))}
        </Group>
      </Layer>
    </Stage>
  ) : null;
};

type MeasureComponentProps = {
  measure: Measure;
  onMeasureChange: (newMeasure: Measure) => void;
};

const MeasureComponent = ({
  measure: { pointPosition, otherPointPosition },
  onMeasureChange,
}: MeasureComponentProps): React.ReactElement => {
  const handleDragMovePoint = (evt: KonvaEventObject<DragEvent>): void => {
    const newPointPosition = evt.target.getPosition();
    evt.target.setPosition(pointPosition);

    onMeasureChange({ pointPosition: newPointPosition, otherPointPosition });
  };

  const handleDragMoveOtherPoint = (evt: KonvaEventObject<DragEvent>): void => {
    const newOtherPointPosition = evt.target.getPosition();
    evt.target.setPosition(otherPointPosition);

    onMeasureChange({ pointPosition, otherPointPosition: newOtherPointPosition });
  };

  const handleDragMoveLine = (evt: KonvaEventObject<DragEvent>): void => {
    const newLinePosition = evt.target.getPosition();
    evt.target.setPosition({ x: 0, y: 0 });

    onMeasureChange({
      pointPosition: {
        x: pointPosition.x + newLinePosition.x,
        y: pointPosition.y + newLinePosition.y,
      },
      otherPointPosition: {
        x: otherPointPosition.x + newLinePosition.x,
        y: otherPointPosition.y + newLinePosition.y,
      },
    });
  };

  return (
    <Group>
      <Circle
        fill="red"
        radius={5}
        x={pointPosition.x}
        y={pointPosition.y}
        draggable
        onDragMove={handleDragMovePoint}
      />
      <Line
        stroke="red"
        points={[pointPosition.x, pointPosition.y, otherPointPosition.x, otherPointPosition.y]}
        draggable
        onDragMove={handleDragMoveLine}
      />
      <Circle
        fill="blue"
        radius={5}
        x={otherPointPosition.x}
        y={otherPointPosition.y}
        draggable
        onDragMove={handleDragMoveOtherPoint}
      />
    </Group>
  );
};

export type Measure = {
  pointPosition: Position;
  otherPointPosition: Position;
};
