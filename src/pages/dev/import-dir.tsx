import { InputDirectory } from "../../dicom/InputDirectory";

const ImportDirPage = (): React.ReactElement => {
  return <InputDirectory onDirectoryHandleChange={() => ({})} />;
};

export default ImportDirPage;
