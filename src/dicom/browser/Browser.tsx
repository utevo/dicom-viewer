import React, { useEffect, useState } from "react";
import Konva from "konva";
import clsx from "clsx";
import AutoSizer from "react-virtualized-auto-sizer";
import { Tool, ToolBar } from "./Tools";
import { Workspace } from "./Workspace";
import { DicomImage } from "../domain/DicomImage";
import { DicomObject } from "../domain/DicomObject";
import { Position, ViewPort, WindowingOffset } from "./types";
import { InputDirectory } from "./InputDirectory";
import { FilesController } from "./Files";
import { ImageData_ } from "../domain/ImageData";
import { useNotify } from "../../common/notify";
import { InfoViewer } from "./Info";
import { match } from "ts-pattern";

type Props = {
  className?: string;
};

export const Browser = ({ className }: Props): React.ReactElement => {
  const notify = useNotify();

  const [dicomImage, setDicomImage] = useState<DicomImage>();
  const [imageData, setImageData] = useState<ImageData>();
  const [viewPort, setViewPort] = useState<ViewPort>(ViewPort.default());
  const [windowingOffset, setWindowingOffset] = useState<WindowingOffset>(WindowingOffset.default());
  const [tool, setTool] = useState<Tool>(Tool.Cursor);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [prevMousePosition, setPrevMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [workspaceSize, setWorkspaceSize] = useState<Size>({ width: 0, height: 0 });

  const handleDicomObjectChange = (newDicomObject: DicomObject) => {
    const dicomImage = DicomImage.fromDicomObject(newDicomObject);
    if (dicomImage._tag === "err") {
      notify.error(dicomImage.error);
      return;
    }

    const imageData = ImageData_.fromDicomImage(dicomImage.value, windowingOffset);
    if (imageData._tag === "err") {
      notify.error(imageData.error);
      return;
    }

    setDicomImage(dicomImage.value);
    setViewPort(calcViewPortDefault(workspaceSize, { width: dicomImage.value.rows, height: dicomImage.value.columns }));
    setWindowingOffset(WindowingOffset.default());
  };

  useEffect(() => {
    if (dicomImage == null) {
      return;
    }
    const imageData = ImageData_.fromDicomImage(dicomImage, windowingOffset);
    if (imageData._tag === "err") {
      notify.error(imageData.error);
      return;
    }

    setImageData(imageData.value);
  }, [dicomImage, notify, windowingOffset]);

  const handleMouseDown = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setMouseDown(true);
  };

  const handleMouseMove = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    const currMousePosition = { x: evt.evt.clientX, y: evt.evt.clientY };
    const mousePositionDiff = {
      x: currMousePosition.x - prevMousePosition.x,
      y: currMousePosition.y - prevMousePosition.y,
    };

    match(tool)
      .with(Tool.Cursor, () => {
        if (mouseDown !== true) {
          return;
        }

        const newWindowingOffset: WindowingOffset = {
          windowCenterOffset: windowingOffset.windowCenterOffset + mousePositionDiff.x,
          windowWidthOffset: windowingOffset.windowWidthOffset + -mousePositionDiff.y,
        };
        setWindowingOffset(newWindowingOffset);
      })
      .with(Tool.Windowing, () => {
        if (mouseDown !== true) {
          return;
        }

        const newWindowingOffset: WindowingOffset = {
          windowCenterOffset: windowingOffset.windowCenterOffset + mousePositionDiff.x,
          windowWidthOffset: windowingOffset.windowWidthOffset + -mousePositionDiff.y,
        };
        setWindowingOffset(newWindowingOffset);
      })
      .with(Tool.Pan, () => {
        if (mouseDown !== true) {
          return;
        }

        const newViewPort = {
          ...viewPort,
          position: {
            x: viewPort.position.x + mousePositionDiff.x,
            y: viewPort.position.y + mousePositionDiff.y,
          },
        };
        setViewPort(newViewPort);
      })
      .with(Tool.Rotate, () => {
        if (mouseDown !== true) {
          return;
        }

        const rotationDiff = -mousePositionDiff.y / 4;
        const newViewPort: ViewPort = {
          ...viewPort,
          rotation: viewPort.rotation + rotationDiff,
        };
        setViewPort(newViewPort);
      })
      .with(Tool.Zoom, () => {
        if (mouseDown !== true) {
          return;
        }

        const zoomDiff = -(currMousePosition.y - prevMousePosition.y) / 600;
        console;
        const newViewPort: ViewPort = {
          ...viewPort,
          zoom: viewPort.zoom * (1 + zoomDiff),
        };
        console.log(newViewPort);
        setViewPort(newViewPort);
      })
      .exhaustive();

    setPrevMousePosition(currMousePosition);
  };

  const handleMouseUp = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setMouseDown(false);
  };

  const handleMouseLeave = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setMouseDown(false);
  };

  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>();

  const handleFileChange = async (file: File): Promise<void> => {
    const dicomObject = await DicomObject.fromFile(file);
    if (dicomObject._tag === "err") {
      notify.error(dicomObject.error);
      return;
    }
    handleDicomObjectChange(dicomObject.value);
  };

  const handleToolClick = (tool: Tool): void => {
    match(tool).when(Tool).exhaustive()
  };

  return (
    <div className={clsx("w-full h-full flex", className)}>
      <div className="w-96 flex flex-col m-3 p-1 bg-white rounded-2xl shadow-lg space-y-3 overflow-hidden">
        <InputDirectory className="self-center" onDirectoryHandleChange={setDirectoryHandle} />
        <div className="flex-1 overflow-y-scroll border rounded-xl m-2">
          <FilesController directoryHandle={directoryHandle} onFileChange={handleFileChange} />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <ToolBar tool={tool} onToolClick={setTool} />
        <div className="flex-1 m-3 bg-white rounded-2xl shadow-lg">
          <AutoSizer onResize={setWorkspaceSize}>
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
      <InfoViewer
        className="fixed bottom-5 right-5"
        viewPort={viewPort}
        voiLutModule={dicomImage?._tag === "GrayScale" ? dicomImage.voiLutModule : undefined}
        voiLutModuleOffset={windowingOffset}
      />
    </div>
  );
};

type Size = {
  width: number;
  height: number;
};

const calcViewPortDefault = (workspaceSize: Size, imageSize: Size): ViewPort => {
  return {
    position: { x: workspaceSize.width / 2 - imageSize.width / 2, y: workspaceSize.height / 2 - imageSize.height / 2 },
    rotation: 0,
    zoom: 1,
  };
};
