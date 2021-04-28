import { ResultTag } from "../common/adt";
import { DicomObject } from "./domain/DicomObject";

interface Props {
  onImport: (dicomObject: DicomObject) => void;
}

export const InputDicomObject = ({ onImport }: Props): React.ReactElement => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (files == null) return;
    const file = files.item(0);
    if (file == null) return;

    const result = await DicomObject.fromFile(file);
    if (result._tag === ResultTag.Ok) onImport(result.value);
  };

  return <input type="file" onChange={handleChange} />;
};
