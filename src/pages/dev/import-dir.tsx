import { InputDirectory } from "../../dicom/browser/InputDirectory";

const ImportDirPage = (): React.ReactElement => {
  return <InputDirectory onDirectoryHandleChange={() => ({})} />;
};

export default ImportDirPage;
