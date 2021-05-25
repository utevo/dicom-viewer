import clsx from "clsx";
import produce from "immer";
import React, { useEffect, useState } from "react";
import AutoSizer from "react-virtualized-auto-sizer";
import { __, match } from "ts-pattern";
import { v4 as uuid4 } from "uuid";

import { useNotify } from "../../common/notify";
import { DicomImage } from "../domain/DicomImage";
import { DicomObject, DicomObjectMetadata } from "../domain/DicomObject";
import { ImageData_ } from "../domain/ImageData";
import { BrowserInfo } from "./BrowserInfo";
import { Position, ViewPort, WindowingOffset } from "./common";
import { DicomObjectDetails } from "./DicomObjectDetails";
import { FilesController } from "./Files";
import { InputDirectory } from "./InputDirectory";
import { Tool, ToolBar } from "./Tools";
import { Measure, Measures, Workspace } from "./Workspace";

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

  const [measures, setMeasures] = useState<Measures>({});
  const [addingMeasureUuid, setAddingMeasureUuid] = useState<string | undefined>();

  const handleDicomObjectChange = (newDicomObject: DicomObject) => {
    const { pixelData, ...dicomObjectMetadata } = { ...newDicomObject };
    const dicomImageResult = DicomImage.fromDicomObject(newDicomObject);
    if (dicomImageResult._tag === "Err") {
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
    if (imageDataResult._tag === "Err") {
      notify.error(imageDataResult.error);
      return;
    }
    const imageData = imageDataResult.value;

    setImageData(imageData);
  }, [dicomImage, notify, windowingOffset]);

  const handleWorkspaceMouseDown = (currMousePosition: Position): void => {
    setMouseDown(true);
  };

  const handleWorkspaceMouseMove = (currMousePosition: Position): void => {
    const mousePositionDiff = {
      x: currMousePosition.x - prevMousePosition.x,
      y: currMousePosition.y - prevMousePosition.y,
    };

    match([tool, mouseDown])
      .with([Tool.Cursor, true], () => undefined)
      .with([Tool.Windowing, true], () => {
        const newWindowingOffset: WindowingOffset = {
          windowCenterOffset: windowingOffset.windowCenterOffset + mousePositionDiff.x,
          windowWidthOffset: windowingOffset.windowWidthOffset + -mousePositionDiff.y,
        };
        setWindowingOffset(newWindowingOffset);
      })
      .with([Tool.Pan, true], () => {
        const newViewPort = produce(viewPort, (draftViewPort) => {
          draftViewPort.position = Position.add(draftViewPort.position, mousePositionDiff);
        });
        setViewPort(newViewPort);
      })
      .with([Tool.Rotate, true], () => {
        const rotationDiff = -mousePositionDiff.y / 4;
        const newViewPort: ViewPort = {
          ...viewPort,
          rotation: (viewPort.rotation + rotationDiff + 360) % 360,
        };
        setViewPort(newViewPort);
      })
      .with([Tool.Zoom, true], () => {
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

  const handleWorkspaceMouseUp = (): void => {
    setMouseDown(false);
  };

  const handleWorkspaceMouseLeave = (): void => {
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

  const handleMeasuresChange = (newMeasures: Measures): void => {
    if (tool === Tool.Cursor) {
      setMeasures(newMeasures);
    }
  };

  const handleImageMouseDown = (currMousePosition: Position): void => {
    match(tool)
      .with(Tool.AddMeasure, () => {
        const newMeasure: Measure = {
          pointPosition: currMousePosition,
          otherPointPosition: currMousePosition,
        };

        const newUuid = uuid4();
        const newMeasures = produce(measures, (draftMeasures) => {
          draftMeasures[newUuid] = newMeasure;
        });

        setAddingMeasureUuid(newUuid);
        setMeasures(newMeasures);
      })
      .with(__, () => undefined)
      .exhaustive();
  };

  const handleImageMouseMove = (currMousePosition: Position): void => {
    match([tool, mouseDown])
      .with([Tool.AddMeasure, true], () => {
        if (addingMeasureUuid === undefined) {
          return;
        }

        const newMeasures = produce(measures, (draftMeasures) => {
          draftMeasures[addingMeasureUuid].otherPointPosition = currMousePosition;
        });

        setMeasures(newMeasures);
      })
      .with(__, () => undefined)
      .exhaustive();
  };

  const [isDicomObjectDetailsOpen, setIsDicomObjectDetailsOpen] = useState(false);

  const handleResetView = (dicomImage: DicomImage): void => {
    setViewPort(calcViewPortDefault(workspaceSize, { width: dicomImage.rows, height: dicomImage.columns }));
    setMeasures({});
    setWindowingOffset(WindowingOffset.default());
  };

  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle>();

  const handleFileChange = async (file: File): Promise<void> => {
    const dicomObjectResult = await DicomObject.fromFile(file);
    if (dicomObjectResult._tag === "Err") {
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
                measuresDraggable={tool === Tool.Cursor}
                onMeasuresChange={handleMeasuresChange}
                onWorkspaceMouseDown={handleWorkspaceMouseDown}
                onWorkspaceMouseMove={handleWorkspaceMouseMove}
                onWorkspaceMouseUp={handleWorkspaceMouseUp}
                onWorkspaceMouseLeave={handleWorkspaceMouseLeave}
                onImageMouseDown={handleImageMouseDown}
                onImageMouseMove={handleImageMouseMove}
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
      {dicomImage && (
        <BrowserInfo
          className="fixed bottom-5 right-5"
          viewPort={viewPort}
          voiLutModule={dicomImage?._tag === "GrayScale" ? dicomImage.voiLutModule : undefined}
          windowingOffset={windowingOffset}
        />
      )}
    </div>
  );
};

type Size = {
  width: number;
  height: number;
};

export const calcViewPortDefault = (workspaceSize: Size, imageSize: Size): ViewPort => {
  return {
    position: { x: workspaceSize.width / 2 - imageSize.width / 2, y: workspaceSize.height / 2 - imageSize.height / 2 },
    rotation: 0,
    zoom: 1,
  };
};

export const checkIfIsBrowserSupported = (): boolean => window.showDirectoryPicker !== undefined;
