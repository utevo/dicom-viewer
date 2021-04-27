import { ResultTag } from "../types";
import { DicomImage, DicomImage_ } from "./domain/DicomImage";

interface Props {
  onImport: (dicomImage: DicomImage) => void;
}

export const InputDicomImage = ({ onImport }: Props): React.ReactElement => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (files == null) return;
    const file = files.item(0);
    if (file == null) return;

    const result = await DicomImage_.fromFile(file);
    if (result._tag === ResultTag.Ok) onImport(result.value);
  };

  return <input type="file" onChange={handleChange} />;
};
