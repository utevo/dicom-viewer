import React, { useState } from "react";
import { Tool, Tools as ToolsComponent } from "./Tools";
import { Workspace } from "./Workspace";
import { DicomImage, DicomImageTag } from "../domain/DicomImage";
import { DicomObject } from "../domain/DicomObject";
import Konva from "konva";
import { Position, ViewPort, VoiLutModuleOffset } from "./types";
import { InputDirectory } from "../InputDirectory";
import { Files } from "./Files";
import { ResultTag } from "../../common/adt";
import { ImageData_ } from "../domain/ImageData";
import { useNotify } from "../../common/notify";
import { Info } from "./Info";

export const Browser = (): React.ReactElement => {
  const notify = useNotify();

  const [dicomImage, setDicomImage] = useState<DicomImage>();
  const [imageData, setImageData] = useState<ImageData>();
  const [viewPort, setViewPort] = useState<ViewPort>(ViewPort.default());
  const [voiLutModuleOffset, setVoiLutModuleOffset] = useState<VoiLutModuleOffset>(VoiLutModuleOffset.default());
  const [tool, setTool] = useState<Tool>(Tool.Nothing);
  const [buttonDown, setButtonDown] = useState<boolean>(false);
  const [prevMousePosition, setPrevMousePosition] = useState<Position>({ x: 0, y: 0 });

  const handleDicomObjectChange = (newDicomObject: DicomObject) => {
    const dicomImage = DicomImage.fromDicomObject(newDicomObject);
    if (dicomImage._tag === ResultTag.Err) {
      notify.error(dicomImage.value);
      return;
    }

    const imageData = ImageData_.fromDicomImage(dicomImage.value, voiLutModuleOffset);
    if (imageData._tag === ResultTag.Err) {
      notify.error(imageData.value);
      return;
    }

    setDicomImage(dicomImage.value);
    setImageData(imageData.value);
    setViewPort(ViewPort.default());
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
    const result = await DicomObject.fromFile(file);
    if (result._tag === ResultTag.Err) {
      notify.error(result.value);
      return;
    }
    handleDicomObjectChange(result.value);
  };

  return (
    <div>
      <ToolsComponent tool={tool} onToolChange={setTool} />
      <Workspace
        width={800}
        height={800}
        imageData={imageData}
        viewPort={viewPort}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <InputDirectory onDirectoryHandleChange={setDirectoryHandle} />
      {directoryHandle != null && <Files directoryHandle={directoryHandle} onFileChange={handleFileChange} />}
      <Info
        viewPort={viewPort}
        voiLutModule={dicomImage?._tag === DicomImageTag.GrayScale ? dicomImage.voiLutModule : undefined}
        voiLutModuleOffset={voiLutModuleOffset}
      />
    </div>
  );
};
