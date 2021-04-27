import { Accordion, AccordionButton, AccordionItem, AccordionPanel } from "@chakra-ui/react";
import { stringToArray } from "konva/types/shapes/Text";
import React, { useEffect, useState } from "react";
import { DicomImage } from "../domain/DicomImage";

type FsFile = FsRegularFile | FsDirectory;
interface FsRegularFile {
  _type: "regularFile";

  name: string;
  handle: FileSystemFileHandle;
}

interface FsDirectory {
  _type: "directory";

  name: string;
  files: FsFile[];
}

interface HaveKindProp {
  kind: "file" | "directory";
}

const filesFromDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle): Promise<FsFile[]> => {
  const files: FsFile[] = [];
  console.log({ directoryHandle });
  for await (const entity of directoryHandle.entries()) {
    const [name, handle] = entity;
    if (((handle as unknown) as HaveKindProp).kind === "file") {
      files.push({ _type: "regularFile", name, handle: handle as FileSystemFileHandle });
    } else {
      files.push({
        _type: "directory",
        name,
        files: await filesFromDirectoryHandle(handle as FileSystemDirectoryHandle),
      });
    }
  }

  return files;
};
interface Props {
  directoryHandle: FileSystemDirectoryHandle;

  onFileChange: (file: File) => void;
}

export const Files = ({ directoryHandle, onFileChange }: Props): React.ReactElement => {
  const [files, setFiles] = useState<FsFile[]>();

  useEffect(() => {
    (async () => setFiles(await filesFromDirectoryHandle(directoryHandle)))();
  }, [directoryHandle]);

  if (files == null) return <div>Loading...</div>;

  const handleSelectRegularFile = async (regularFile: FsRegularFile): Promise<void> => {
    const file = await regularFile.handle.getFile();
    onFileChange(file);
  };

  return (
    <div>
      {files.map((file) =>
        file._type === "regularFile" ? (
          <RegularFileComponent key={file.name} regularFile={file} onSelectRegularFile={handleSelectRegularFile} />
        ) : (
          <DirectoryComponent key={file.name} directory={file} onSelectRegularFile={handleSelectRegularFile} />
        )
      )}
    </div>
  );
};

interface DirectoryComponentProps {
  directory: FsDirectory;
  onSelectRegularFile: (regularFile: FsRegularFile) => void;
}

const DirectoryComponent = ({ directory, onSelectRegularFile }: DirectoryComponentProps): React.ReactElement => {
  return (
    <Accordion allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>{directory.name}</AccordionButton>
        </h2>
        <AccordionPanel>
          {directory.files.map((file) =>
            file._type === "regularFile" ? (
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
    <div>
      <button onClick={() => onSelectRegularFile(regularFile)}>{regularFile.name}</button>
    </div>
  );
};
