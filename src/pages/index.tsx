import { useState } from "react";
import { DicomObject } from "../dicom/domain/DicomObject";
import { ImageRawData } from "../dicom/domain/ImageRawData";
import { ImageViewer } from "../dicom/ImageViewer";
import { InputDicomObject } from "../dicom/InputDicomObject";
import { ResultTag } from "../adt";

const Home = (): React.ReactElement => {
  const [image, setImage] = useState<ImageRawData>();

  const handleImport = (dicomObject: DicomObject) => {
    const result = ImageRawData.fromDicomObject(dicomObject);
    if (result._tag === ResultTag.Err) {
      console.log(result.value);
      return;
    }
    setImage(result.value);
  };

  return (
    <>
      <InputDicomObject onImport={handleImport} />
      {image != null && <ImageViewer image={image} width={500} height={500} />}
    </>
  );
};

export default Home;
