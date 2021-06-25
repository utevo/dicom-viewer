import cn from "clsx";

type Props = {
  onDirectoryHandleChange: (newDirectoryHandle: FileSystemDirectoryHandle) => void;

  className?: string;
};

export function InputDirectory({ onDirectoryHandleChange, className }: Props): React.ReactElement {
  const handleClick = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    const showDirectoryPicker = window.showDirectoryPicker;

    try {
      onDirectoryHandleChange(await showDirectoryPicker());
      // eslint-disable-next-line no-empty
    } catch (e) {}
  };

  return (
    <button
      className={cn(
        "font-bold text-lg py-2 px-6 mt-2 shadow-lg rounded-full bg-blue-500 text-white align-middle",
        className
      )}
      onClick={handleClick}
    >
      Select Directory
    </button>
  );
}
