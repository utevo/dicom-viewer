import { DataSet } from "dicom-parser";

export interface DicomImage {
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

  windowCenter?: number;
  windowWidth?: number;

  pixelData: Uint8Array;
}

export const DicomImage_ = {
  fromDataSet: (dataSet: DataSet): DicomImage => {
    const transferSyntax = TransferSyntax_.fromTransferSyntaxUID(dataSet.string("x00020012"));

    const [compression, endianness] = TransferSyntax_.toCompressionAndEndianness(transferSyntax);

    const rows =
      dataSet.uint16("x00280010") ??
      (() => {
        throw Error("DicomImage need to have rows");
      })();

    const columns =
      dataSet.uint16("x00280011") ??
      (() => {
        throw Error("DicomImage need to have columns");
      })();

    const samplePerPixel =
      dataSet.uint16("x00280002") ??
      (() => {
        throw Error("DicomImage need to have samplePerPixel");
      })();
    const photometricInterpratation =
      (dataSet.string("x00280004") as PhotometricInterpratation) ??
      (() => {
        throw Error("DicomImage need to have photometricInterpratation");
      })();

    const planarConfigurationValue =
      dataSet.uint16("x00280006") ??
      (() => {
        throw Error("DicomImage need to have planarConfiguration");
      });
    const planarConfiguration: PlanarConfiguration | undefined =
      planarConfigurationValue == null
        ? undefined
        : planarConfigurationValue === 0
        ? PlanarConfiguration.Interlaced
        : planarConfigurationValue === 1
        ? PlanarConfiguration.Separated
        : (() => {
            throw Error("Unexpected value of planarConfiguration");
          })();

    const bitsAllocated =
      dataSet.uint16("x00280100") ??
      (() => {
        throw Error("DicomImage need to have bitsAllocated");
      })();
    const bitsStored =
      dataSet.uint16("x00280101") ??
      (() => {
        throw Error("DicomImage need to have bitsStored");
      })();
    const highBit =
      dataSet.uint16("x00280102") ??
      (() => {
        throw Error("DicomImage need to have highBit");
      })();

    const pixelRepresentationValue =
      dataSet.uint16("x00280103") ??
      (() => {
        throw Error("DicomImage need to have pixelRepresentationValue");
      })();
    const pixelRepresentation: PixelRepresentation =
      pixelRepresentationValue === 0
        ? PixelRepresentation.Unsigned
        : pixelRepresentationValue === 1
        ? PixelRepresentation.Signed
        : (() => {
            throw Error("Unexpected value of pixelRepresentation");
          })();

    const windowCenter = dataSet.floatString("x00281050");
    const windowWidth = dataSet.floatString("x00281051");

    const pixelDataElement = dataSet.elements.x7fe00010;
    const pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);

    return {
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

      pixelData,
    };
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
  fromTransferSyntaxUID: (transferSyntaxUID: string): TransferSyntax => {
    switch (transferSyntaxUID) {
      case "1.2.840.10008.1.2.4.90":
      case "1.2.840.10008.1.2.4.91":
        return TransferSyntax.JPEG2000;

      case "1.2.840.10008.1.2.5":
        return TransferSyntax.DecodeRLE;

      case "1.2.840.10008.1.2.4.57":
      case "1.2.840.10008.1.2.4.70":
        return TransferSyntax.JPEGLossless;

      case "1.2.840.10008.1.2.4.50":
      case "1.2.840.10008.1.2.4.51":
        return TransferSyntax.JPEGBaseline;

      case "1.2.840.10008.1.2":
      case "1.2.840.10008.1.2.1":
        return TransferSyntax.UncompressedLE;

      case "1.2.840.10008.1.2.2":
      default:
        return TransferSyntax.UncompressedBE;
    }
  },

  toCompressionAndEndianness: (transferSyntax: TransferSyntax): [Compression, Endianness] => {
    switch (transferSyntax) {
      case TransferSyntax.UncompressedBE:
        return [Compression.None, Endianness.BigEndian];
      case TransferSyntax.UncompressedLE:
        return [Compression.None, Endianness.LittleEndian];
      case TransferSyntax.DecodeRLE:
        return [Compression.Rle, Endianness.LittleEndian];
      case TransferSyntax.JPEGLossless:
        return [Compression.JpegLossless, Endianness.LittleEndian];
      case TransferSyntax.JPEG2000:
        return [Compression.Jpeg2000, Endianness.LittleEndian];
      case TransferSyntax.JPEGBaseline:
        return [Compression.JpegBaseline, Endianness.LittleEndian]
      }
  }
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
