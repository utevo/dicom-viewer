import { Tooltip } from "@chakra-ui/react";
import { RiCursorLine, RiDragMove2Fill, RiRestartLine, RiWindow2Line } from "react-icons/ri";
import clsx from "clsx";
import React from "react";

export enum Tool {
  Cursor = "CURSOR",
  Pan = "PAN",
  Rotate = "ROTATE",
  Windowing = "WINDOWING",
}

interface ConfigRow {
  tool: Tool;
  label: string;
  icon: React.ReactElement;
}

const config: ConfigRow[] = [
  {
    tool: Tool.Cursor,
    label: "Cursor",
    icon: <RiCursorLine />,
  },
  {
    tool: Tool.Windowing,
    label: "Windowing",
    icon: <RiWindow2Line />,
  },
  {
    tool: Tool.Pan,
    label: "Move",
    icon: <RiDragMove2Fill />,
  },
  {
    tool: Tool.Rotate,
    label: "Rotate",
    icon: <RiRestartLine />,
  },
];

interface Props {
  tool: Tool;
  onToolChange: (newTool: Tool) => void;

  className?: string;
}

export const ToolsController = ({ tool, onToolChange, className }: Props): React.ReactElement => {
  return (
    <div className={clsx("flex flex-row justify-center space-x-2 m-3 p-1 bg-white rounded-2xl shadow-lg", className)}>
      {config.map(({ tool, label, icon }) => (
        <ToolButton key={tool} onClick={() => onToolChange(tool)}>
          <Tooltip hasArrow label={label}>
            <span>{icon}</span>
          </Tooltip>
        </ToolButton>
      ))}
    </div>
  );
};

interface ToolButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}
const ToolButton = ({ onClick, children }: ToolButtonProps): React.ReactElement => {
  return <button onClick={onClick}>{children}</button>;
};
