import { ImageViewer } from "../dicom/ImageViewer";
import { ImportDicomImage } from "../dicom/ImportDicomImage";

const Home = (): React.ReactElement => {
  return <><ImportDicomImage /><ImageViewer width={500} height={500}/></>;
};

export default Home;
