import React, { useEffect, useState } from "react";
import Konva from "konva";
import clsx from "clsx";
import AutoSizer from "react-virtualized-auto-sizer";
import { Tool, ToolBar } from "./Tools";
import { Measure, Workspace } from "./Workspace";
import { DicomImage } from "../domain/DicomImage";
import { DicomObject, DicomObjectMetadata } from "../domain/DicomObject";
import { Position, ViewPort, WindowingOffset } from "./common";
import { InputDirectory } from "./InputDirectory";
import { FilesController } from "./Files";
import { ImageData_ } from "../domain/ImageData";
import { useNotify } from "../../common/notify";
import { BrowserInfo } from "./BrowserInfo";
import { match, __ } from "ts-pattern";
import { DicomObjectDetails } from "./DicomObjectDetails";

type Props = {
  className?: string;
};

export const Browser = ({ className }: Props): React.ReactElement => {
  const notify = useNotify();

  const [dicomObjectMetadata, setDicomObjectMetadata] = useState<DicomObjectMetadata>();
  const [dicomImage, setDicomImage] = useState<DicomImage>();
  const [imageData, setImageData] = useState<ImageData>();
  const [viewPort, setViewPort] = useState<ViewPort>(ViewPort.default());
  const [windowingOffset, setWindowingOffset] = useState<WindowingOffset>(WindowingOffset.default());
  const [tool, setTool] = useState<Tool>(Tool.Cursor);
  const [mouseDown, setMouseDown] = useState<boolean>(false);
  const [prevMousePosition, setPrevMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [workspaceSize, setWorkspaceSize] = useState<Size>({ width: 0, height: 0 });

  const [measures, setMeasures] = useState<Measure[]>([
    { pointPosition: { x: 10, y: 10 }, otherPointPosition: { x: 100, y: 100 } },
  ]);

  const handleDicomObjectChange = (newDicomObject: DicomObject) => {
    const { pixelData, ...dicomObjectMetadata } = { ...newDicomObject };
    const dicomImageResult = DicomImage.fromDicomObject(newDicomObject);
    if (dicomImageResult._tag === "err") {
      notify.error(dicomImageResult.error);
      return;
    }
    const dicomImage = dicomImageResult.value;

    setDicomObjectMetadata(dicomObjectMetadata);
    setDicomImage(dicomImage);
    handleResetView(dicomImage);
  };

  useEffect(() => {
    if (dicomImage == null) {
      return;
    }
    const imageDataResult = ImageData_.fromDicomImage(dicomImage, windowingOffset);
    if (imageDataResult._tag === "err") {
      notify.error(imageDataResult.error);
      return;
    }
    const imageData = imageDataResult.value;

    setImageData(imageData);
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
        setViewPort(newViewPort);
      })
      .with(__, () => undefined)
      .exhaustive();

    setPrevMousePosition(currMousePosition);
  };

  const handleMouseUp = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setMouseDown(false);
  };

  const handleMouseLeave = (evt: Konva.KonvaEventObject<MouseEvent>): void => {
    setMouseDown(false);
  };

  const handleToolClick = (tool: Tool): void => {
    match<Tool, void>(tool)
      .with(Tool.ShowDetails, () => setIsDicomObjectDetailsOpen(true))
      .with(Tool.ResetView, () => (dicomImage != null ? handleResetView(dicomImage) : undefined))
      .with(__, (tool) => {
        setTool(tool);
      })
      .exhaustive();
  };

  const [isDicomObjectDetailsOpen, setIsDicomObjectDetailsOpen] = useState(false);

  const handleResetView = (dicomImage: DicomImage): void => {
    setViewPort(calcViewPortDefault(workspaceSize, { width: dicomImage.rows, height: dicomImage.columns }));
    setWindowingOffset(WindowingOffset.default());
  };

  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>();

  const handleFileChange = async (file: File): Promise<void> => {
    const dicomObjectResult = await DicomObject.fromFile(file);
    if (dicomObjectResult._tag === "err") {
      notify.error(dicomObjectResult.error);
      return;
    }
    const dicomObject = dicomObjectResult.value;

    handleDicomObjectChange(dicomObject);
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
        <ToolBar tool={tool} onToolClick={handleToolClick} />
        <div className="flex-1 m-3 bg-white rounded-2xl shadow-lg">
          <AutoSizer onResize={setWorkspaceSize}>
            {({ width, height }) => (
              <Workspace
                width={width}
                height={height}
                imageData={imageData}
                viewPort={viewPort}
                pixelSpacing={dicomImage?.pixelSpacing}
                measures={measures}
                onMeasuresChange={setMeasures}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              />
            )}
          </AutoSizer>
        </div>
      </div>

      <DicomObjectDetails
        dicomObjectMetadata={dicomObjectMetadata}
        isOpen={isDicomObjectDetailsOpen}
        onClose={() => setIsDicomObjectDetailsOpen(false)}
      />
      <BrowserInfo
        className="fixed bottom-5 right-5"
        viewPort={viewPort}
        voiLutModule={dicomImage?._tag === "grayScale" ? dicomImage.voiLutModule : undefined}
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
