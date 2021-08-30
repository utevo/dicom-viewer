import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import cn from "clsx";
import React, { useEffect, useState } from "react";

type Props = {
  directoryHandle?: FileSystemDirectoryHandle;
  onFileChange: (file: File) => void;

  className?: string;
};

export const Files = ({ directoryHandle, onFileChange, className }: Props): React.ReactElement => {
  const [directory, setDirectory] = useState<FsDirectory>();

  useEffect(() => {
    if (directoryHandle == null) {
      setDirectory(undefined);
      return;
    }
    (async () => setDirectory(await directoryFromDirectoryHandle(directoryHandle)))();
  }, [directoryHandle]);

  if (directory == null) {
    return <></>;
  }

  const handleSelectRegularFile = async (regularFile: FsRegularFile): Promise<void> => {
    const file = await regularFile.handle.getFile();
    onFileChange(file);
  };

  if (directory == null) {
    return <div>Select directory</div>;
  }

  return (
    <DirectoryComponent className={cn(className)} directory={directory} onSelectRegularFile={handleSelectRegularFile} />
  );
};

type FsFile = FsRegularFile | FsDirectory;

type FsRegularFile = Readonly<{
  _tag: "RegularFile";

  name: string;
  handle: FileSystemFileHandle;
}>;

type FsDirectory = Readonly<{
  _tag: "Directory";

  name: string;
  files: FsFile[];
}>;

type HaveKindProp = {
  kind: "file" | "directory";
};

const directoryFromDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle): Promise<FsDirectory> => {
  const files: FsFile[] = [];
  for await (const entity of directoryHandle.entries()) {
    const [name, handle] = entity;
    if (((handle as unknown) as HaveKindProp).kind === "file") {
      files.push({ _tag: "RegularFile", name, handle: handle as FileSystemFileHandle });
    } else {
      files.push(await directoryFromDirectoryHandle(handle as FileSystemDirectoryHandle));
    }
  }
  const sortedFilteredFiles = files.filter((file) => !checkIfFileToIgnore(file)).sort((a, b) => a.name >= b.name ? 1 : -1)
  return { _tag: "Directory", name: directoryHandle.name, files: sortedFilteredFiles };
};

const checkIfFileToIgnore = (file: FsFile) => {
  return file.name[0] === ".";
};

type DirectoryComponentProps = {
  directory: FsDirectory;
  onSelectRegularFile: (regularFile: FsRegularFile) => void;

  className?: string;
};

const DirectoryComponent = ({
  directory,
  onSelectRegularFile,
  className,
}: DirectoryComponentProps): React.ReactElement => {
  return (
    <Accordion className={cn(className)} allowMultiple>
      <AccordionItem border={0} className="border-0">
        <AccordionButton className="font-semibold text-sm border-b">
          <div className="flex-1 text-left">{directory.name}</div>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel py={0} className="flex flex-col py-0 divide-y">
          {directory.files.map((file, idx) =>
            file._tag === "RegularFile" ? (
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

type RegularFileComponentProps = {
  regularFile: FsRegularFile;
  onSelectRegularFile: (regularFile: FsRegularFile) => void;

  className?: string;
};

const RegularFileComponent = ({
  regularFile,
  onSelectRegularFile,
  className,
}: RegularFileComponentProps): React.ReactElement => {
  return (
    <button
      className={cn("text-sm text-left pl-4 truncate overflow-ellipsis", className)}
      onClick={() => onSelectRegularFile(regularFile)}
    >
      {regularFile.name}
    </button>
  );
};
