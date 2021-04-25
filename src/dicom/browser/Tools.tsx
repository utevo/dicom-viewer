import { Tool } from "./types";

interface Props {
  tool: Tool;
  onToolChange: (newTool: Tool) => void;
}

export const Tools = ({ tool, onToolChange }: Props): React.ReactElement => {
  return (
    <select value={tool} onChange={(e) => onToolChange(e.target.value as Tool)}>
      <option value={Tool.Nothing}>Nothing</option>
      <option value={Tool.Pan}>Pan</option>
    </select>
  );
};
