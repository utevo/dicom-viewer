import { useState } from "react";
import { DicomImage } from "../dicom/domain/DicomImage";
import { Image, Image_ } from "../dicom/domain/Image";
import { ImageViewer } from "../dicom/ImageViewer";
import { InputDicomImage } from "../dicom/InputDicomImage";
import { ResultTag } from "../types";

const Home = (): React.ReactElement => {
  const [image, setImage] = useState<Image>();

  const handleImport = (dicomImage: DicomImage) => {
    const result = Image_.fromDicomImage(dicomImage);
    if (result._tag === ResultTag.Err) {
      console.log(result.value);
      return;
    }
    setImage(result.value);
  };

  return (
    <>
      <InputDicomImage onImport={handleImport} />
      {image != null && <ImageViewer image={image} width={500} height={500} />}
    </>
  );
};

export default Home;
