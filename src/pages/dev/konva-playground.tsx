import Konva from "konva";
import { KonvaEventObject } from "konva/types/Node";
import React, { useEffect, useState } from "react";
import { Circle, Layer, Line, Stage, useStrictMode } from "react-konva";

type Position = {
  x: number;
  y: number;
};

const KonvaPlayground = (): React.ReactElement | null => {
  const [showChild, setShowChild] = useState(false);

  // Wait until after client-side hydration to show
  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    // You can show some kind of placeholder UI here
    return null;
  }

  return <Tmp />;
};

export default KonvaPlayground;

const Tmp = (): React.ReactElement => {
  useStrictMode(true);

  const [position, setPosition] = useState<Position>({ x: 10, y: 10 });
  const [position2, setPosition2] = useState<Position>({ x: 100, y: 100 });

  const handleDragMove = (evt: KonvaEventObject<DragEvent>): void => {
    setPosition(evt.target.getPosition());
  };

  const handleDragMove2 = (evt: KonvaEventObject<DragEvent>): void => {
    setPosition2(evt.target.getPosition());
  };

  const handleDragMoveLine = (evt: KonvaEventObject<DragEvent>): void => {
    const newPosition = evt.target.getPosition();

    // evt.target.setPosition({ x: 0, y: 0 });

    console.log({ newPosition });
  };

  return (
    <Stage width={300} height={300}>
      <Layer>
        <Circle x={position.x} y={position.y} draggable fill="red" radius={5} onDragMove={handleDragMove} />
        <Line
          points={[position.x, position.y, position2.x, position2.y]}
          stroke="red"
          draggable
          onDragMove={handleDragMoveLine}
        />
        <Circle x={position2.x} y={position2.y} draggable fill="blue" radius={5} onDragMove={handleDragMove2} />
      </Layer>
    </Stage>
  );
};
