import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import React, { useEffect, useState } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Line, Text, Stage, Rect, Label, Tag } from "react-konva";
import { useKey } from "react-use";
import { PixelSpacing } from "../domain/common";
import { calcViewPortDefault } from "./Browser";
import { Position, ViewPort } from "./common";

type Props = {
  width: number;
  height: number;

  imageData: ImageData | undefined;
  viewPort: ViewPort;

  measures: Measures;
  onMeasuresChange: (newMeasures: Measures) => void;
  measuresDraggable: boolean;
  pixelSpacing?: PixelSpacing;

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
  measuresDraggable = false,
  pixelSpacing,

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

  const handleMeasureChange = (key: string, newMeasure: Measure): void => {
    const newMeasures = { ...measures };
    newMeasures[key] = newMeasure;
    onMeasuresChange(newMeasures);
  };

  const handleMeasureDelete = (key: string): void => {
    const newMeasures = { ...measures };
    delete newMeasures[key];
    onMeasuresChange(newMeasures);
  };

  const [draggingMeasureKey, setDraggingMeasureKey] = useState<string | undefined>();
  const handleDragStart = (key: string): void => {
    setDraggingMeasureKey(key);
  };
  const handleDragEnd = (key: string): void => {
    if (draggingMeasureKey === key) {
      setDraggingMeasureKey(undefined);
    }
  };

  const handleKey = (evt: KeyboardEvent): void => {
    if (evt.key === "Backspace") {
      if (draggingMeasureKey !== undefined) {
        handleMeasureDelete(draggingMeasureKey);
      }
    }
  };
  useKey(() => true, handleKey);

  const measureOffset = calcViewPortDefault(
    { width, height },
    { width: imageData?.width ?? 0, height: imageData?.height ?? 0 }
  ).position;

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
          {Object.entries(measures).map(([key, measure]) => (
            <MeasureComponent
              key={key}
              measure={measure}
              onMeasureChange={(newMeasure) => handleMeasureChange(key, newMeasure)}
              draggable={measuresDraggable}
              onDragStart={() => handleDragStart(key)}
              onDragEnd={() => handleDragEnd(key)}
              pixelSpacing={pixelSpacing}
              scale={1 / viewPort.zoom}
              offset={measureOffset}
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
  draggable: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;

  pixelSpacing?: PixelSpacing;

  scale?: number;
  offset?: Position;
};

const MeasureComponent = ({
  measure: { pointPosition, otherPointPosition },
  onMeasureChange,
  draggable,
  onDragStart,
  onDragEnd,
  pixelSpacing,
  scale = 1,
  offset = { x: 0, y: 0 },
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

  const textPosition = calcTextPosition(pointPosition, otherPointPosition, scale);
  return (
    <Group offset={offset}>
      <Label x={textPosition.x} y={textPosition.y}>
        <Tag fill="black" pointerWidth={10} />
        <Text
          text={formatDistance(
            distance(pointPosition, otherPointPosition, pixelSpacing),
            pixelSpacing != null ? "mm" : "px"
          )}
          fill="white"
          fontSize={17 * scale}
          padding={3 * scale}
        />
      </Label>

      <Circle
        x={pointPosition.x}
        y={pointPosition.y}
        {...(draggable && {
          draggable: true,
          onDragMove: handleDragMovePoint,
          onDragStart,
          onDragEnd,
          onMouseOver: () => setIsCirceHover(true),
          onMouseOut: () => setIsCirceHover(false),
        })}
        radius={(isCircleHover ? 6 : 4) * scale}
        fill="red"
      />
      <Line
        x={pointPosition.x}
        y={pointPosition.y}
        points={[0, 0, otherPointPosition.x - pointPosition.x, otherPointPosition.y - pointPosition.y]}
        {...(draggable && {
          draggable: true,
          onDragMove: handleDragMoveLine,
          onDragStart,
          onDragEnd,
          onMouseOver: () => setIsLineHover(true),
          onMouseOut: () => setIsLineHover(false),
        })}
        strokeWidth={(isLineHover ? 4 : 3) * scale}
        stroke="red"
      />
      <Circle
        x={otherPointPosition.x}
        y={otherPointPosition.y}
        {...(draggable && {
          draggable: true,
          onDragMove: handleDragMoveOtherPoint,
          onDragStart,
          onDragEnd,
          onMouseOver: () => setIsOtherCirceHover(true),
          onMouseOut: () => setIsOtherCirceHover(false),
        })}
        radius={(isOtherCircleHover ? 6 : 4) * scale}
        fill="red"
      />
    </Group>
  );
};

const distance = (pointPosition: Position, otherPointPosition: Position, pixelSpacing?: PixelSpacing): number => {
  const rowScaling = pixelSpacing != null ? pixelSpacing.row : 1;
  const rowLength = (pointPosition.x - otherPointPosition.x) * rowScaling;

  const columnScaling = pixelSpacing != null ? pixelSpacing.column : 1;
  const columnLength = (pointPosition.y - otherPointPosition.y) * columnScaling;
  return Math.sqrt(rowLength ** 2 + columnLength ** 2);
};

const formatDistance = (distance: number, lengthUnit: LengthUnit): string => `${distance.toFixed(4)} ${lengthUnit}`;

const calcTextPosition = (pointPosition: Position, otherPointPosition: Position, scale: number): Position =>
  pointPosition.y < otherPointPosition.y
    ? { x: pointPosition.x - 48 * scale, y: pointPosition.y - 33 * scale }
    : { x: otherPointPosition.x - 48 * scale, y: otherPointPosition.y - 33 * scale };

export type Measure = {
  pointPosition: Position;
  otherPointPosition: Position;
};

export type Measures = Record<string, Measure>;

export type LengthUnit = "px" | "mm";
