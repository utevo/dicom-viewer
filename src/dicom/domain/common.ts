import { __, match } from "ts-pattern";
import { ValueOf } from "ts-pattern/lib/types/helpers";

import { Err, Ok, Result } from "src/common/result";

const transferSyntax = {
  JPEG2000: "JPEG2000",
  DecodeRLE: "DecodeRLE",
  JPEGLossless: "JPEGLossless",
  JPEGBaseline: "JPEGBaseline",
  UncompressedLE: "UncompressedLE",
  UncompressedBE: "UncompressedBE",
} as const;
export type TransferSyntax = ValueOf<typeof transferSyntax>;
export const TransferSyntax = {
  ...transferSyntax,
  default: (): TransferSyntax => "UncompressedLE",

  fromTransferSyntaxUID: (transferSyntax: string): Result<TransferSyntax, string> =>
    match<string, Result<TransferSyntax, string>>(transferSyntax)
      .with("1.2.840.10008.1.2", "1.2.840.10008.1.2.1", () => Ok("UncompressedLE"))
      .with("1.2.840.10008.1.2.2", () => Ok("UncompressedBE"))
      .with("1.2.840.10008.1.2.4.90", "1.2.840.10008.1.2.4.91", () => Ok("JPEG2000"))
      .with("1.2.840.10008.1.2.5", () => Ok("DecodeRLE"))
      .with("1.2.840.10008.1.2.4.57", "1.2.840.10008.1.2.4.70", () => Ok("JPEGLossless"))
      .with("1.2.840.10008.1.2.4.50", "1.2.840.10008.1.2.4.51", () => Ok("JPEGBaseline"))
      .with(__, () => Err("Unexpected transfer syntax"))
      .exhaustive(),

  toCompressionAndEndianness: (transferSyntax: TransferSyntax): [Compression, Endianness] =>
    match<TransferSyntax, [Compression, Endianness]>(transferSyntax)
      .with("UncompressedBE", () => [Compression.None, "BigEndian"])
      .with("UncompressedLE", () => [Compression.None, "LittleEndian"])
      .with("DecodeRLE", () => [Compression.Rle, "LittleEndian"])
      .with("JPEGLossless", () => [Compression.JpegLossless, "LittleEndian"])
      .with("JPEG2000", () => [Compression.Jpeg2000, "LittleEndian"])
      .with("JPEGBaseline", () => [Compression.JpegBaseline, "LittleEndian"])
      .exhaustive(),
};

export const endianness = { LittleEndian: "LittleEndian", BigEndian: "BigEndian" } as const;
export type Endianness = ValueOf<typeof endianness>;
export const Endianness = { ...endianness };

const compression = {
  None: "NONE",
  JpegLossless: "JPEG_LOSSLESS",
  JpegBaseline: "JPEG_BASELINE",
  Jpeg2000: "JPEG_2000",
  Rle: "RLE",
} as const;
export type Compression = ValueOf<typeof compression>;
export const Compression = { ...compression };

const photometricInterpretation = {
  Monochrome1: "MONOCHROME1",
  Monochrome2: "MONOCHROME2",
  Palette: "PALETTE COLOR",
  Rgb: "RGB",
  Hsv: "HSV",
  Argb: "ARGB",
  Cmyk: "CMYK",
  YbrFull: "YBR_FULL",
  YbrFull422: "YBR_FULL_422",
  YbrPartial422: "YBR_PARTIAL_422",
  YbrPartial420: "YBR_PARTIAL_420",
  YbrIct: "YBR_ICT",
  YbrRct: "YBR_RCT",
} as const;
export type PhotometricInterpretation = ValueOf<typeof photometricInterpretation>;
export const PhotometricInterpretation = { ...photometricInterpretation };

const pixelRepresentation = {
  Unsigned: "UNSIGNED",
  Signed: "SIGNED",
} as const;
export type PixelRepresentation = ValueOf<typeof pixelRepresentation>;
export const PixelRepresentation = { ...pixelRepresentation };

const planarConfiguration = {
  Interlaced: 0,
  Separated: 1,
} as const;
export type PlanarConfiguration = ValueOf<typeof planarConfiguration>;
export const PlanarConfiguration = { ...planarConfiguration };

const voiLutFunction = {
  Linear: "LINEAR",
  LinearExact: "LINEAR_EXACT",
  Sigmoid: "SIGMOID",
} as const;
export type VoiLutFunction = ValueOf<typeof voiLutFunction>;
export const VoiLutFunction = {
  ...voiLutFunction,
  default: (): VoiLutFunction => VoiLutFunction.Linear,
};

export type VoiLutModule = Readonly<{
  window: VoiLutWindow;
  voiLutFunction: VoiLutFunction;
}>;

export type VoiLutWindow = Readonly<{
  center: number;
  width: number;
}>;
export const VoiLutWindow = {
  default: (): VoiLutWindow => ({
    center: 1024,
    width: 4096,
  }),
};

export type PixelSpacing = Readonly<{
  row: number;
  column: number;
}>;
export const PixelSpacing = {
  fromString: (str: string): Result<PixelSpacing, string> => {
    const rawNumbers = str.split("\\");
    if (rawNumbers.length != 2) {
      return Err("Invalid value of Pixel Spacing");
    }

    try {
      return Ok({
        row: Number.parseFloat(rawNumbers[0]),
        column: Number.parseFloat(rawNumbers[1]),
      });
    } catch (e) {
      return Err("Invalid value of Pixel Spacing");
    }
  },
};
