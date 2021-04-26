import { stringToArray } from "konva/types/shapes/Text";
import React, { useEffect, useState } from "react";
import { DicomImage } from "../domain/DicomImage";

interface Props {
  directoryHandle: FileSystemDirectoryHandle;

  onFileChange: (arrayBuffer: ArrayBuffer) => void;
}

type File = RegularFile | Directory;
interface RegularFile {
  _type: "regularFile";

  name: string;
  handle: FileSystemFileHandle;
}

interface Directory {
  _type: "directory";

  name: string;
  files: File[];
}

const filesFromDirectoryHandle = async (directoryHandle: FileSystemDirectoryHandle): Promise<File[]> => {
  const files: File[] = [];
  console.log({ directoryHandle });
  for await (const entity of directoryHandle.entries()) {
    const [name, handle] = entity;
    if ((handle as any).kind === "file") {
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

export const Files = ({ directoryHandle, onFileChange }: Props): React.ReactElement => {
  const [files, setFiles] = useState<File[]>();

  useEffect(() => {
    (async () => setFiles(await filesFromDirectoryHandle(directoryHandle)))();
  }, [directoryHandle]);

  if (files == null) return <div>Loading...</div>;

  return (
    <div>
      {files.map((file) =>
        file._type === "regularFile" ? (
          <RegularFileComponent regularFile={file} />
        ) : (
          <DirectoryComponent directory={file} />
        )
      )}
    </div>
  );
};

interface DirectoryComponentProps {
  directory: Directory;
}

const DirectoryComponent = ({ directory }: DirectoryComponentProps): React.ReactElement => {
  return (
    <ul>
      {directory.files.map((file) =>
        file._type === "regularFile" ? (
          <RegularFileComponent regularFile={file} />
        ) : (
          <DirectoryComponent directory={file} />
        )
      )}
    </ul>
  );
};

interface RegularFileComponentProps {
  regularFile: RegularFile;
}

const RegularFileComponent = ({ regularFile }: RegularFileComponentProps): React.ReactElement => {
  return <div>{regularFile.name}</div>;
};
