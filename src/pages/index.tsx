import { useState } from "react";
import { DicomObject } from "../dicom/domain/DicomObject";
import { DicomImage } from "../dicom/domain/DicomImage";
import { ImageViewer } from "../dicom/ImageViewer";
import { InputDicomObject } from "../dicom/InputDicomObject";
import { ResultTag } from "../adt";

const Home = (): React.ReactElement => {
  const [dicomImage, setDicomImage] = useState<DicomImage>();

  const handleImport = (dicomObject: DicomObject) => {
    const result = DicomImage.fromDicomObject(dicomObject);
    if (result._tag === ResultTag.Err) {
      console.log(result.value);
      return;
    }
    setDicomImage(result.value);
  };

  return (
    <>
      <InputDicomObject onImport={handleImport} />
      {dicomImage != null && <ImageViewer dicomImage={dicomImage} width={500} height={500} />}
    </>
  );
};

export default Home;
