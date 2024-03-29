import { Tooltip } from "@chakra-ui/react";
import cn from "clsx";
import React from "react";
import { IconType } from "react-icons";
import {
  RiArrowGoBackLine,
  RiCursorLine,
  RiDragMove2Fill,
  RiInformationLine,
  RiRestartLine,
  RiRulerLine,
  RiWindow2Line,
  RiZoomInLine,
} from "react-icons/ri";

import { Tool } from "src/dicom/browser/tools/model";

export const ToolBar = ({ tool: selectedTool, onToolClick, className }: Props): React.ReactElement => {
  return (
    <div
      className={cn(
        "flex flex-row justify-center space-x-2 m-3 p-2 bg-white rounded-2xl shadow-lg divide-x divide-solid",
        className
      )}
    >
      {toolBarConfig.map((collectionOfTools, idx) => (
        <div className="px-3" key={idx}>
          {collectionOfTools.map(({ tool: tool, label, icon }) => {
            return (
              <ToolButton key={tool} onClick={() => onToolClick(tool)}>
                <Tooltip className="transition duration-150 ease-in-out hover:scale-125" hasArrow label={label}>
                  <span>
                    {icon({
                      className: cn(
                        "w-12 h-12 transition duration-150 ease-in-out transform hover:scale-125",
                        selectedTool === tool && "border-4 border-red-600 rounded-xl"
                      ),
                    })}
                  </span>
                </Tooltip>
              </ToolButton>
            );
          })}
        </div>
      ))}
    </div>
  );
};

type ToolButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
};
const ToolButton = ({ onClick, children }: ToolButtonProps): React.ReactElement => {
  return (
    <button className="px-1" onClick={onClick}>
      {children}
    </button>
  );
};

type ToolConfig = Readonly<{
  tool: Tool;
  label: string;
  icon: IconType;
}>;

type CollectionOfToolsConfig = ToolConfig[];

type ToolBarConfig = CollectionOfToolsConfig[];

const toolBarConfig: ToolBarConfig = [
  [
    {
      tool: Tool.Cursor,
      label: "Cursor",
      icon: RiCursorLine,
    },
    {
      tool: Tool.Windowing,
      label: "Windowing",
      icon: RiWindow2Line,
    },
    {
      tool: Tool.AddMeasure,
      label: "Measure",
      icon: RiRulerLine,
    },
    {
      tool: Tool.Pan,
      label: "Move",
      icon: RiDragMove2Fill,
    },
    {
      tool: Tool.Rotate,
      label: "Rotate",
      icon: RiRestartLine,
    },
    {
      tool: Tool.Zoom,
      label: "Zoom",
      icon: RiZoomInLine,
    },
  ],
  [
    {
      tool: Tool.ShowDetails,
      label: "Show Details",
      icon: RiInformationLine,
    },
    {
      tool: Tool.ResetView,
      label: "Reset View",
      icon: RiArrowGoBackLine,
    },
  ],
];

type Props = {
  tool: Tool;
  onToolClick: (newTool: Tool) => void;

  className?: string;
};
