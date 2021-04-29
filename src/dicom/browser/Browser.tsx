import React, { useEffect, useState } from "react";
import { Tool, ToolsController } from "./Tools";
import { Workspace } from "./Workspace";
import { DicomImage } from "../domain/DicomImage";
import { DicomObject } from "../domain/DicomObject";
import Konva from "konva";
import { Position, ViewPort, WindowingOffset } from "./types";
import { InputDirectory } from "../InputDirectory";
import { FilesController } from "./Files";
import { ResultTag } from "../../common/adt";
import { ImageData_ } from "../domain/ImageData";
import { useNotify } from "../../common/notify";
import clsx from "clsx";
import AutoSizer from "react-virtualized-auto-sizer";

interface Props {
  className?: string;
}

export const Browser = ({ className }: Props): React.ReactElement => {
  const notify = useNotify();

  const [dicomImage, setDicomImage] = useState<DicomImage>();
  const [imageData, setImageData] = useState<ImageData>();
  const [viewPort, setViewPort] = useState<ViewPort>(ViewPort.default());
  const [windowingOffset, setWindowingOffset] = useState<WindowingOffset>(WindowingOffset.default());
  const [tool, setTool] = useState<Tool>(Tool.Cursor);
  const [buttonDown, setButtonDown] = useState<boolean>(false);
  const [prevMousePosition, setPrevMousePosition] = useState<Position>({ x: 0, y: 0 });

  const handleDicomObjectChange = (newDicomObject: DicomObject) => {
    const dicomImage = DicomImage.fromDicomObject(newDicomObject);
    if (dicomImage._tag === ResultTag.Err) {
      notify.error(dicomImage.value);
      return;
    }

    const imageData = ImageData_.fromDicomImage(dicomImage.value, windowingOffset);
    if (imageData._tag === ResultTag.Err) {
      notify.error(imageData.value);
      return;
    }

    setDicomImage(dicomImage.value);
    setImageData(imageData.value);
    setViewPort(ViewPort.default());
  };

  useEffect(() => {
    if (dicomImage == null) {
      return;
    }
    const imageData = ImageData_.fromDicomImage(dicomImage, windowingOffset);
    if (imageData._tag === ResultTag.Err) {
      notify.error(imageData.value);
      return;
    }

    setImageData(imageData.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dicomImage, windowingOffset]);

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
      case Tool.Windowing: {
        if (buttonDown !== true) {
          break;
        }

        const newWindowingOffset: WindowingOffset = {
          windowCenterOffset: windowingOffset.windowCenterOffset + mousePositionDiff.x,
          windowWidthOffset: windowingOffset.windowWidthOffset + -mousePositionDiff.y,
        };
        setWindowingOffset(newWindowingOffset);
        break;
      }

      case Tool.Pan: {
        if (buttonDown !== true) {
          break;
        }

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
    <div className={clsx("w-full h-full flex", className)}>
      <div className="w-80 flex flex-col items-center m-3 p-1 bg-white rounded-2xl shadow-lg space-y-3 overflow-hidden">
        <InputDirectory onDirectoryHandleChange={setDirectoryHandle} />
        <FilesController className="overflow-auto" directoryHandle={directoryHandle} onFileChange={handleFileChange} />
      </div>
      <div className="flex-1 flex flex-col">
        <ToolsController tool={tool} onToolChange={setTool} />
        <div className="flex-1 m-3 p-1 bg-white rounded-2xl shadow-lg">
          <AutoSizer>
            {({ width, height }) => (
              <Workspace
                width={width}
                height={height}
                imageData={imageData}
                viewPort={viewPort}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              />
            )}
          </AutoSizer>
        </div>
      </div>
      {/* <InfoViewer
        viewPort={viewPort}
        voiLutModule={dicomImage?._tag === DicomImageTag.GrayScale ? dicomImage.voiLutModule : undefined}
        voiLutModuleOffset={windowingOffset}
      /> */}
    </div>
  );
};
