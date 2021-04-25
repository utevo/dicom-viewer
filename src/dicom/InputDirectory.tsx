interface Props {
  onDirectoryHandleChange: (newDirectoryHandle: FileSystemDirectoryHandle) => void;
}

export function InputDirectory({ onDirectoryHandleChange }: Props): React.ReactElement {
  const handleClick = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    const showDirectoryPicker = window.showDirectoryPicker;
    if (showDirectoryPicker == null) throw Error("Unable to use showDirectoryPicker");

    onDirectoryHandleChange(await showDirectoryPicker());
  };

  return <button onClick={handleClick}>Select Directory!</button>;
}
