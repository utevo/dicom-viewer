import { useState } from "react";
import { DicomImage } from "../dicom/domain/DicomImage";
import { Image_ } from "../dicom/domain/Image";
import { ImageViewer } from "../dicom/ImageViewer";
import { InputDicomImage } from "../dicom/InputDicomImage";

const Home = (): React.ReactElement => {
  const [dicomImage, setDicomImage] = useState<DicomImage>();

  return (
    <>
      <InputDicomImage onImport={setDicomImage} />
      {dicomImage != null && <ImageViewer image={Image_.fromDicomImage(dicomImage)} width={500} height={500} />}
    </>
  );
};

export default Home;
