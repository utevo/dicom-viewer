import React, { useState } from "react";
import { InputDicomImage } from "../InputDicomImage";
import { Tools as ToolsComponent } from "./Tools";
import { Workspace } from "./Workspace";
import { Image, Image_ } from "../domain/Image";
import { DicomImage, DicomImage_ } from "../domain/DicomImage";
import Konva from "konva";
import { Position, Tool, ViewPort } from "./types";
import { InputDirectory } from "../InputDirectory";
import { Files } from "./Files";
import { ResultTag } from "../../types";

export const Browser = (): React.ReactElement => {
  const [image, setImage] = useState<Image | undefined>(undefined);
  const [viewPort, setViewPort] = useState<ViewPort>(DEFAULT_VIEWPORT);
  const [tool, setTool] = useState<Tool>(Tool.Nothing);
  const [buttonDown, setButtonDown] = useState<boolean>(false);
  const [prevMousePosition, setPrevMousePosition] = useState<Position>({ x: 0, y: 0 });

  const handleDicomImageChange = (newDicomImage: DicomImage) => {
    const result = Image_.fromDicomImage(newDicomImage);
    if (result._tag === ResultTag.Err) {
      console.log(result.value)
      return;
    }
    setImage(result.value);
    setViewPort(DEFAULT_VIEWPORT);
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
      case Tool.Pan: {
        if (buttonDown !== true) break;

        const newViewPort = {
          ...viewPort,
          position: {
            x: viewPort.position.x + mousePositionDiff.x,
            y: viewPort.position.y + mousePositionDiff.y,
          },
        };
        setViewPort(newViewPort);
        break;
      }

      case Tool.Rotate: {
        if (buttonDown !== true) break;

        const rotationDiff =
          (Math.abs(mousePositionDiff.x) > Math.abs(mousePositionDiff.y) ? mousePositionDiff.x : -mousePositionDiff.y) /
          4;
        const newViewPort: ViewPort = {
          ...viewPort,
          rotation: viewPort.rotation + rotationDiff,
        };
        setViewPort(newViewPort);
        break;
      }
    }

    setPrevMousePosition(currMousePosition);
  };

  const handleMouseUp = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setButtonDown(false);
  };

  const handleMouseLeave = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setButtonDown(false);
  };

  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>();

  const handleFileChange = async (file: File): Promise<void> => {
    const result = await DicomImage_.fromFile(file);
    if (result._tag === ResultTag.Err) {
      console.log(result.value)
      return;
    }
    handleDicomImageChange(result.value);
  };

  return (
    <div>
      <InputDicomImage onImport={handleDicomImageChange} />
      <ToolsComponent tool={tool} onToolChange={setTool} />
      <Workspace
        width={400}
        height={400}
        image={image}
        viewPort={viewPort}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <InputDirectory onDirectoryHandleChange={setDirectoryHandle} />
      {directoryHandle != null && <Files directoryHandle={directoryHandle} onFileChange={handleFileChange} />}
    </div>
  );
};

const DEFAULT_VIEWPORT = { position: { x: 0, y: 0 }, rotation: 0 };
