import { useState } from "react";
import { DicomImage, Image_ } from "../dicom/domain";
import { ImageViewer } from "../dicom/ImageViewer";
import { ImportDicomImage } from "../dicom/ImportDicomImage";

const Home = (): React.ReactElement => {
  const [dicomImage, setDicomImage] = useState<DicomImage>();

  return (
    <>
      <ImportDicomImage onImport={setDicomImage} />
      {dicomImage != null && <ImageViewer image={Image_.fromDicomImage(dicomImage)} width={500} height={500} />}
    </>
  );
};

export default Home;
