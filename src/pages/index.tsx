import { useState } from "react";
import { DicomImage } from "../dicom/domain/DicomImage";
import { ImageRawData } from "../dicom/domain/ImageRawData";
import { ImageViewer } from "../dicom/ImageViewer";
import { InputDicomImage } from "../dicom/InputDicomImage";
import { ResultTag } from "../adt";

const Home = (): React.ReactElement => {
  const [image, setImage] = useState<ImageRawData>();

  const handleImport = (dicomImage: DicomImage) => {
    const result = ImageRawData.fromDicomImage(dicomImage);
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
