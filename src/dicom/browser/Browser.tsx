import React, { useState } from "react";
import { ImportDicomImage } from "../ImportDicomImage";
import { Tools as ToolsComponent } from "./Tools";
import { Workspace } from "./Workspace";
import { Image, Image_ } from "../domain/Image";
import { DicomImage } from "../domain/DicomImage";
import Konva from "konva";
import { Position, Tool, ViewPort } from "./types";

export const Browser = (): React.ReactElement => {
  const [image, setImage] = useState<Image | undefined>(undefined);
  const [viewPort, setViewPort] = useState<ViewPort>({ position: { x: 0, y: 0 } });
  const [tool, setTool] = useState<Tool>(Tool.Nothing);
  const [buttonDown, setButtonDown] = useState<boolean>(false);
  const [prevMousePosition, setPrevMousePosition] = useState<Position>({ x: 0, y: 0 });

  const handleImageChange = (newDicomImage: DicomImage) => {
    setImage(Image_.fromDicomImage(newDicomImage));
  };

  const handleMouseDown = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setButtonDown(true);
  };

  const handleMouseMove = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    const currMousePosition = { x: evt.evt.clientX, y: evt.evt.clientY };
    const mousePositionDiff = {
      x: currMousePosition.x - prevMousePosition.x,
      y: currMousePosition.y - prevMousePosition.y,
    };

    switch (tool) {
      case "PAN":
        if (buttonDown !== true) break;

        const newViewPort = {
          ...viewPort,
          position: {
            x: viewPort.position.x + mousePositionDiff.x,
            y: viewPort.position.y + mousePositionDiff.y,
          },
        };
        setViewPort(newViewPort);
    }

    setPrevMousePosition(currMousePosition);
  };

  const handleMouseUp = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setButtonDown(false);
  };

  return (
    <div>
      <ImportDicomImage onImport={handleImageChange} />
      <ToolsComponent tool={tool} onToolChange={setTool} />
      <Workspace
        width={400}
        height={400}
        image={image}
        viewPort={viewPort}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
};
