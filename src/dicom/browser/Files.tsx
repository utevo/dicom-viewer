import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
interface Props {
  directoryHandle?: FileSystemDirectoryHandle;
  onFileChange: (file: File) => void;

  className?: string;
}

export const FilesController = ({ directoryHandle, onFileChange, className }: Props): React.ReactElement => {
  const [directory, setDirectory] = useState<FsDirectory>();

  useEffect(() => {
    if (directoryHandle == null) {
      setDirectory(undefined);
      return;
    }
    (async () => setDirectory(await directoryFromDirectoryHandle(directoryHandle)))();
  }, [directoryHandle]);

  if (directory == null) {
    return <div>Nothing selected</div>;
  }

  const handleSelectRegularFile = async (regularFile: FsRegularFile): Promise<void> => {
    const file = await regularFile.handle.getFile();
    onFileChange(file);
  };

  if (directory == null) {
    return <div>Select directory</div>;
  }

  return (
    <DirectoryComponent
      className={clsx(className)}
      directory={directory}
      onSelectRegularFile={handleSelectRegularFile}
    />
  );
};

type FsFile = FsRegularFile | FsDirectory;
interface FsRegularFile {
  _tag: "regularFile";

  name: string;
  handle: FileSystemFileHandle;
}

interface FsDirectory {
  _tag: "directory";

  name: string;
  files: FsFile[];
}

interface HaveKindProp {
  kind: "file" | "directory";
}

const directoryFromDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle): Promise<FsDirectory> => {
  const files: FsFile[] = [];
  for await (const entity of directoryHandle.entries()) {
    const [name, handle] = entity;
    if (((handle as unknown) as HaveKindProp).kind === "file") {
      files.push({ _tag: "regularFile", name, handle: handle as FileSystemFileHandle });
    } else {
      files.push(await directoryFromDirectoryHandle(handle as FileSystemDirectoryHandle));
    }
  }

  return { _tag: "directory", name: directoryHandle.name, files };
};

interface DirectoryComponentProps {
  directory: FsDirectory;
  onSelectRegularFile: (regularFile: FsRegularFile) => void;

  className?: string;
}

const DirectoryComponent = ({
  directory,
  onSelectRegularFile,
  className,
}: DirectoryComponentProps): React.ReactElement => {
  return (
    <Accordion className={clsx(className)} allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton className={"font-semibold text-sm "}>
            {directory.name}
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel>
          {directory.files.map((file) =>
            file._tag === "regularFile" ? (
              <RegularFileComponent
                key={`${directory.name}/${file.name}`}
                regularFile={file}
                onSelectRegularFile={onSelectRegularFile}
              />
            ) : (
              <DirectoryComponent
                key={`${directory.name}/${file.name}`}
                directory={file}
                onSelectRegularFile={onSelectRegularFile}
              />
            )
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

interface RegularFileComponentProps {
  regularFile: FsRegularFile;
  onSelectRegularFile: (regularFile: FsRegularFile) => void;
}

const RegularFileComponent = ({ regularFile, onSelectRegularFile }: RegularFileComponentProps): React.ReactElement => {
  return (
    <button className={clsx("text-sm")} onClick={() => onSelectRegularFile(regularFile)}>
      {regularFile.name}
    </button>
  );
};
