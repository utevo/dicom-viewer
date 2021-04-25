import Konva from "konva";
import React, { useEffect, useState } from "react";
import { Circle, Layer, Stage, useStrictMode } from "react-konva";

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

  const [color, setColor] = useState<string>();

  return (
    <Stage width={300} height={300}>
      <Layer>
        <Circle
          x={0}
          y={0}
          draggable
          radius={50}
          fill={color}
          onDragEnd={() => {
            setColor(Konva.Util.getRandomColor());
          }}
        />
      </Layer>
    </Stage>
  );
};
