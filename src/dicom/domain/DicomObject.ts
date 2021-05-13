import { DataSet, parseDicom } from "dicom-parser";
import { match, __ } from "ts-pattern";
import { Result } from "../../common/adt";

const { Ok, Err } = Result;
export interface DicomObject {
  compression: Compression;
  endianness: Endianness;

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
}

export const DicomObject = {
  fromFile: async (file: File): Promise<Result<DicomObject, string>> => {
    const arrayBuffer = await file.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    let dataSet;
    try {
      dataSet = parseDicom(byteArray);
    } catch (e) {
      return Err(String(e));
    }

    return DicomObject._fromDataSet(dataSet);
  },
  _fromDataSet: (dataSet: DataSet): Result<DicomObject, string> => {
    const transferSyntax = TransferSyntax_.fromTransferSyntaxUID(dataSet.string("x00020012"));
    if (transferSyntax == null) {
      return Err("DicomImage need to have Transfer Syntax");
    }

    const [compression, endianness] = TransferSyntax_.toCompressionAndEndianness(transferSyntax);

    const rows = dataSet.uint16("x00280010");
    if (rows == null) return Err("DicomImage need to have rows");

    const columns = dataSet.uint16("x00280011");
    if (columns == null) {
      return Err("DicomImage need to have columns");
    }
    const samplePerPixel = dataSet.uint16("x00280002");
    if (samplePerPixel == null) return Err("DicomImage need to have samplePerPixel");

    const photometricInterpratationValue = dataSet.string("x00280004");
    if (photometricInterpratationValue == null) {
      return Err("DicomImage need to have photometricInterpratation");
    }

    const photometricInterpratation = photometricInterpratationValue as PhotometricInterpratation; // ToDo: Need validation

    const planarConfigurationValue = dataSet.uint16("x00280006") ?? 0;
    const maybePlanarConfiguration = match<PlanarConfiguration, Result<PlanarConfiguration, string>>(
      planarConfigurationValue
    )
      .with(0, () => Ok(PlanarConfiguration.Interlaced))
      .with(1, () => Ok(PlanarConfiguration.Separated))
      .with(__, () => Err("Dicom Image have incorrect Planar Configuration"))
      .exhaustive();
    if (maybePlanarConfiguration._tag === "Err") {
      return maybePlanarConfiguration;
    }
    const planarConfiguration = maybePlanarConfiguration.value;

    const bitsAllocated = dataSet.uint16("x00280100");
    if (bitsAllocated == null) return Err("Dicom Image need to have Bits Allocated");

    const bitsStored = dataSet.uint16("x00280101");
    if (bitsStored == null) return Err("Dicom Image need to have Bits Stored");

    const highBit = dataSet.uint16("x00280102");
    if (highBit == null) return Err("Dicom Image need to have High Bit");

    const pixelRepresentationValue = dataSet.uint16("x00280103");
    if (pixelRepresentationValue == null) return Err("DicomImage need to have Pixel Representation value");

    const maybePixelRepresentation = match<number, Result<PixelRepresentation, string>>(pixelRepresentationValue)
      .with(0, () => Ok(PixelRepresentation.Unsigned))
      .with(1, () => Ok(PixelRepresentation.Signed))
      .with(__, () => Err("Unexpected value of Pixel Representation"))
      .exhaustive();
    if (maybePixelRepresentation._tag === "Err") {
      return maybePixelRepresentation;
    }
    const pixelRepresentation = maybePixelRepresentation.value;

    const pixelDataElement = dataSet.elements.x7fe00010;
    const pixelDataVrValue = pixelDataElement.vr ?? "OB";

    const maybePixelDataVr = match<string, Result<"OB" | "OW", string>>(pixelDataVrValue)
      .with("OB", () => Ok("OB"))
      .with("OW", () => Ok("OW"))
      .with(__, () => Err("Unexpected Pixel Data VR"))
      .exhaustive();
    if (maybePixelDataVr._tag === "Err") {
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
      return Err("Not supported voiLutSequence");
    }

    return Ok({
      compression,
      endianness,

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

export enum TransferSyntax {
  JPEG2000 = "JPEG2000",
  DecodeRLE = "DecodeRLE",
  JPEGLossless = "JPEGLossless",
  JPEGBaseline = "JPEGBaseline",
  UncompressedLE = "UncompressedLE",
  UncompressedBE = "UncompressedBE",
}

export const TransferSyntax_ = {
  fromTransferSyntaxUID: (transferSyntax: string): TransferSyntax | null =>
    match<string, TransferSyntax | null>(transferSyntax)
      .with("1.2.840.10008.1.2", "1.2.840.10008.1.2.1", () => TransferSyntax.UncompressedLE)
      .with("1.2.840.10008.1.2.2", () => TransferSyntax.UncompressedBE)
      .with("1.2.840.10008.1.2.4.90", "1.2.840.10008.1.2.4.91", () => TransferSyntax.JPEG2000)
      .with("1.2.840.10008.1.2.5", () => TransferSyntax.DecodeRLE)
      .with("1.2.840.10008.1.2.4.57", "1.2.840.10008.1.2.4.70", () => TransferSyntax.JPEGLossless)
      .with("1.2.840.10008.1.2.4.50", "1.2.840.10008.1.2.4.51", () => TransferSyntax.JPEGBaseline)
      .with(__, () => null)
      .exhaustive(),

  toCompressionAndEndianness: (transferSyntax: TransferSyntax): [Compression, Endianness] =>
    match<TransferSyntax, [Compression, Endianness]>(transferSyntax)
      .with(TransferSyntax.UncompressedBE, () => [Compression.None, Endianness.BigEndian])
      .with(TransferSyntax.UncompressedLE, () => [Compression.None, Endianness.LittleEndian])
      .with(TransferSyntax.DecodeRLE, () => [Compression.Rle, Endianness.LittleEndian])
      .with(TransferSyntax.JPEGLossless, () => [Compression.JpegLossless, Endianness.LittleEndian])
      .with(TransferSyntax.JPEG2000, () => [Compression.Jpeg2000, Endianness.LittleEndian])
      .with(TransferSyntax.JPEGBaseline, () => [Compression.JpegBaseline, Endianness.LittleEndian])
      .exhaustive(),
};

export enum Endianness {
  LittleEndian = "LITTLE_ENDIAN",
  BigEndian = "BIG_ENDIAN",
}

export enum Compression {
  None = "NONE",
  JpegLossless = "JPEG_LOSSLESS",
  JpegBaseline = "JPEG_BASELINE",
  Jpeg2000 = "JPEG_2000",
  Rle = "RLE",
}

export enum PhotometricInterpratation { // DON'T CHANGE VALUES!
  Monochrome1 = "MONOCHROME1",
  Monochrome2 = "MONOCHROME2",
  PaletteColor = "PALETTE COLOR",
  Rgb = "RGB",
  Hsv = "HSV",
  Argb = "ARGB",
  Cmyk = "CMYK",
  YbrFull = "YBR_FULL",
  YbrFull422 = "YBR_FULL_422",
  YbrPartial422 = "YBR_PARTIAL_422",
  YbrPartial420 = "YBR_PARTIAL_420",
  YbrIct = "YBR_ICT",
  YbrRct = "YBR_RCT",
}

export enum PixelRepresentation {
  Unsigned = "UNSIGNED",
  Signed = "SIGNED",
}

export enum PlanarConfiguration {
  Interlaced = 0,
  Separated = 1,
}

export enum VoiLutFunction {
  Linear = "LINEAR",
  LinearExact = "LINEAR_EXACT",
  Sigmoid = "SIGMOID",
}

export const VOI_LUT_FUNCTION_DEFAULT = VoiLutFunction.Linear;
