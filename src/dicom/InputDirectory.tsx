import clsx from "clsx";

interface Props {
  onDirectoryHandleChange: (newDirectoryHandle: FileSystemDirectoryHandle) => void;

  className?: string;
}

export function InputDirectory({ onDirectoryHandleChange, className }: Props): React.ReactElement {
  const handleClick = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    const showDirectoryPicker = window.showDirectoryPicker;
    console.assert(showDirectoryPicker != null, "Unable to use showDirectoryPicker");

    try {
      onDirectoryHandleChange(await showDirectoryPicker());
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  return (
    <button
      className={clsx("font-bold text-lg py-2 px-6 rounded-full bg-blue-500 text-white align-middle", className)}
      onClick={handleClick}
    >
      Select Directory
    </button>
  );
}
