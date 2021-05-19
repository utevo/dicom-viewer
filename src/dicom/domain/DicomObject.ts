import { DataSet, parseDicom } from "dicom-parser";
import { match, __ } from "ts-pattern";
import { Result, ok, err } from "../../common/adt";
import {
  PhotometricInterpratation,
  PixelRepresentation,
  PlanarConfiguration,
  TransferSyntax,
  TransferSyntax_,
  VoiLutFunction,
} from "./common";

export type DicomObject = {
  modality?: string;
  patientId?: string;
  patientAge?: string;
  studyInstanceUid?: string;
  patientName?: string;
  studyDate?: string;
  seriesInstanceUid?: string;
  seriesDescription?: string;
  seriesDate?: string;
  studyId?: string;
  seriesNumber?: string;
  acquisitionNumber?: string;
  instanceNumber?: string;

  transferSyntax?: TransferSyntax;

  rows: number;
  columns: number;

  samplePerPixel: number;
  photometricInterpratation: PhotometricInterpratation;

  planarConfiguration?: PlanarConfiguration;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  pixelRepresentation: PixelRepresentation;

  pixelData: Uint8Array;
  pixelDataVr: "OB" | "OW";

  windowCenter?: number;
  windowWidth?: number;
  voiLutFunction?: VoiLutFunction;

  rescaleIntercept?: number;
  rescaleSlope?: number;
};

export type DicomObjectMetadata = Omit<DicomObject, "pixelData">;

export const DicomObject = {
  fromFile: async (file: File): Promise<Result<DicomObject, string>> => {
    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    let dataSet;
    try {
      dataSet = parseDicom(byteArray);
    } catch (e) {
      return err(String(e));
    }

    return DicomObject._fromDataSet(dataSet);
  },
  _fromDataSet: (dataSet: DataSet): Result<DicomObject, string> => {
    const modality = dataSet.string("x00080060");
    const patientId = dataSet.string("x00100020");
    const patientAge = dataSet.string("x00101010");
    const studyInstanceUid = dataSet.string("x0020000D");
    const patientName = dataSet.string("x00100010");
    const studyDate = dataSet.string("x00080020");
    const seriesInstanceUid = dataSet.string("x0020000E");
    const seriesDescription = dataSet.string("x00081030");
    const seriesDate = dataSet.string("x00080021");
    const studyId = dataSet.string("x00200010)");
    const seriesNumber = dataSet.string("x00200011");
    const acquisitionNumber = dataSet.string("x00200012");
    const instanceNumber = dataSet.string("x00200013");

    const pixelSpacing = dataSet.string("x00280030");

    const transferSyntaxValue = dataSet.string("x00020010");
    const maybeTransferSyntax: Result<TransferSyntax | undefined, string> = match(transferSyntaxValue)
      .with(undefined, () => ok(undefined))
      .with(__.string, (transferSyntaxValue) => TransferSyntax_.fromTransferSyntaxUID(transferSyntaxValue))
      .exhaustive();
    if (maybeTransferSyntax._tag === "err") {
      return maybeTransferSyntax;
    }
    const transferSyntax = maybeTransferSyntax.value;

    const rows = dataSet.uint16("x00280010");
    if (rows == null) return err("Dicom Object need to have rows");

    const columns = dataSet.uint16("x00280011");
    if (columns == null) {
      return err("Dicom Object need to have columns");
    }
    const samplePerPixel = dataSet.uint16("x00280002");
    if (samplePerPixel == null) return err("Dicom Object need to have samplePerPixel");

    const photometricInterpratationValue = dataSet.string("x00280004");
    if (photometricInterpratationValue == null) {
      return err("Dicom Object need to have photometricInterpratation");
    }

    const photometricInterpratation = photometricInterpratationValue as PhotometricInterpratation; // ToDo: Need validation

    const planarConfigurationValue = dataSet.uint16("x00280006") ?? 0;
    const maybePlanarConfiguration = match(planarConfigurationValue)
      .with(0, () => ok(PlanarConfiguration.Interlaced))
      .with(1, () => ok(PlanarConfiguration.Separated))
      .with(__, () => err("Dicom Image have incorrect Planar Configuration"))
      .exhaustive();
    if (maybePlanarConfiguration._tag === "err") {
      return maybePlanarConfiguration;
    }
    const planarConfiguration = maybePlanarConfiguration.value;

    const bitsAllocated = dataSet.uint16("x00280100");
    if (bitsAllocated == null) return err("Dicom Image need to have Bits Allocated");

    const bitsStored = dataSet.uint16("x00280101");
    if (bitsStored == null) return err("Dicom Image need to have Bits Stored");

    const highBit = dataSet.uint16("x00280102");
    if (highBit == null) return err("Dicom Image need to have High Bit");

    const pixelRepresentationValue = dataSet.uint16("x00280103");
    if (pixelRepresentationValue == null) return err("Dicom Object need to have Pixel Representation value");

    const maybePixelRepresentation = match<number, Result<PixelRepresentation, string>>(pixelRepresentationValue)
      .with(0, () => ok(PixelRepresentation.Unsigned))
      .with(1, () => ok(PixelRepresentation.Signed))
      .with(__, () => err("Unexpected value of Pixel Representation"))
      .exhaustive();
    if (maybePixelRepresentation._tag === "err") {
      return maybePixelRepresentation;
    }
    const pixelRepresentation = maybePixelRepresentation.value;

    const pixelDataElement = dataSet.elements.x7fe00010;
    const pixelDataVrValue = pixelDataElement.vr ?? "OB";

    const maybePixelDataVr = match<string, Result<"OB" | "OW", string>>(pixelDataVrValue)
      .with("OB", () => ok("OB"))
      .with("OW", () => ok("OW"))
      .with(__, () => err("Unexpected Pixel Data VR"))
      .exhaustive();
    if (maybePixelDataVr._tag === "err") {
      return maybePixelDataVr;
    }
    const pixelDataVr = maybePixelDataVr.value;

    const pixelData = new Uint8Array(pixelDataElement.length);
    for (let idx = 0; idx < pixelDataElement.length; idx += 1) {
      pixelData[idx] = dataSet.byteArray[pixelDataElement.dataOffset + idx];
    }

    const windowCenter = dataSet.floatString("x00281050") as number | undefined;
    const windowWidth = dataSet.floatString("x00281051") as number | undefined;

    const rescaleIntercept = dataSet.floatString("x00281052") as number | undefined;
    const rescaleSlope = dataSet.floatString("x00281053") as number | undefined;

    const voiLutFunction =
      dataSet.string("x00281056") != null ? (dataSet.string("x00281056") as VoiLutFunction) : undefined; // ToDo: Need validation

    const voiLutSequenceElement = dataSet.elements.x00283010;

    if (voiLutSequenceElement != null) {
      return err("Not supported Voi Lut Sequence");
    }

    return ok({
      modality,
      patientId,
      patientAge,
      studyInstanceUid,
      patientName,
      studyDate,
      seriesInstanceUid,
      seriesDescription,
      seriesDate,
      studyId,
      seriesNumber,
      acquisitionNumber,
      instanceNumber,

      pixelSpacing,

      transferSyntax,

      rows,
      columns,

      samplePerPixel,
      photometricInterpratation,

      planarConfiguration,

      bitsAllocated,
      bitsStored,
      highBit,

      pixelRepresentation,

      windowCenter,
      windowWidth,
      rescaleIntercept,
      rescaleSlope,
      voiLutFunction,

      pixelData,
      pixelDataVr,
    });
  },
};
