interface Props {
  tool: Tool;
  onToolChange: (newTool: Tool) => void;
}

export const Tools = ({ tool, onToolChange }: Props): React.ReactElement => {
  return (
    // eslint-disable-next-line jsx-a11y/no-onchange
    <select value={tool} onChange={(e) => onToolChange(e.target.value as Tool)}>
      <option value={Tool.Nothing}>Nothing</option>
      <option value={Tool.Windowing}>Windowing</option>
      <option value={Tool.Pan}>Pan</option>
      <option value={Tool.Rotate}>Rotate</option>
    </select>
  );
};

export enum Tool {
  Nothing = "NOTHING",
  Pan = "PAN",
  Rotate = "ROTATE",
  Windowing = "WINDOWING",
}
