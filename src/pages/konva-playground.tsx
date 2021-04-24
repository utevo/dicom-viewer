import Konva from "konva";
import React, { useEffect } from "react";
import { Circle, Group, Layer, Rect, Stage, useStrictMode } from "react-konva";

const KonvaPlayground = (): React.ReactElement | null => {
  const [showChild, setShowChild] = React.useState(false);

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

  const [color, setColor] = React.useState<string>();

  return (
    <Stage width={300} height={300}>
      <Layer>
        <Circle
          x={0}
          y={0}
          draggable
          radius={50}
          fill="red"
          // onDragEnd={() => {
          //   setColor(Konva.Util.getRandomColor());
          // }}
        />
      </Layer>
    </Stage>
  );
};
