import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import React, { useEffect, useState } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Line, Text, Stage, Rect, Label, Tag } from "react-konva";
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
    evt.target.setPosition(pointPosition);

    // yea, konva dragging is weird
    onMeasureChange({
      pointPosition: {
        x: newLinePosition.x,
        y: newLinePosition.y,
      },
      otherPointPosition: {
        x: newLinePosition.x + otherPointPosition.x - pointPosition.x,
        y: newLinePosition.y + otherPointPosition.y - pointPosition.y,
      },
    });
  };

  const [isCircleHover, setIsCirceHover] = useState<boolean>(false);
  const [isLineHover, setIsLineHover] = useState<boolean>(false);
  const [isOtherCircleHover, setIsOtherCirceHover] = useState<boolean>(false);

  const textPosition = calcTextPosition(pointPosition, otherPointPosition);
  return (
    <Group>
      <Label x={textPosition.x} y={textPosition.y}>
        <Tag fill="black" pointerWidth={10} />
        <Text text={formatDistance(distance(pointPosition, otherPointPosition), "px")} fill="white" padding={3} />
      </Label>

      <Circle
        x={pointPosition.x}
        y={pointPosition.y}
        draggable
        onDragMove={handleDragMovePoint}
        onMouseOver={() => setIsCirceHover(true)}
        onMouseOut={() => setIsCirceHover(false)}
        radius={isCircleHover ? 6 : 4}
        fill="red"
      />
      <Line
        x={pointPosition.x}
        y={pointPosition.y}
        points={[0, 0, otherPointPosition.x - pointPosition.x, otherPointPosition.y - pointPosition.y]}
        draggable
        onDragMove={handleDragMoveLine}
        onMouseOver={() => setIsLineHover(true)}
        onMouseOut={() => setIsLineHover(false)}
        strokeWidth={isLineHover ? 4 : 3}
        stroke="red"
      />
      <Circle
        x={otherPointPosition.x}
        y={otherPointPosition.y}
        draggable
        onDragMove={handleDragMoveOtherPoint}
        onMouseOver={() => setIsOtherCirceHover(true)}
        onMouseOut={() => setIsCirceHover(false)}
        radius={isCircleHover ? 6 : 4}
        fill="red"
      />
    </Group>
  );
};

const distance = (pointPosition: Position, otherPointPosition: Position): number => {
  return Math.sqrt((pointPosition.x - otherPointPosition.x) ** 2 + (pointPosition.y - otherPointPosition.y) ** 2);
};

const formatDistance = (distance: number, lengthUnit: LengthUnit): string => `${distance.toFixed(4)} ${lengthUnit}`;

const calcTextPosition = (pointPosition: Position, otherPointPosition: Position): Position =>
  pointPosition.y < otherPointPosition.y
    ? { x: pointPosition.x - 35, y: pointPosition.y - 25 }
    : { x: otherPointPosition.x - 35, y: otherPointPosition.y - 25 };

export type Measure = {
  pointPosition: Position;
  otherPointPosition: Position;
};

export type LengthUnit = "px" | "mm";
