import { parseDicom } from "dicom-parser";
import { DicomImage_ } from "./domain";

export const ImportDicomImage = (): React.ReactElement => {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const files = e.target.files;
    if (files == null) return;
    const file = files.item(0);
    if (file == null) return;

    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    const dataSet = parseDicom(byteArray);

    const dicomImage = DicomImage_.fromDataSet(dataSet);

    console.log(dicomImage);
  };

  return <input type="file" onChange={handleChange} />;
};
