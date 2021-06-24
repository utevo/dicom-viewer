import { __, match } from "ts-pattern";

import { Err, Ok, Result } from "src/common/result";
import {
  Compression,
  PhotometricInterpretation,
  PixelRepresentation,
  PixelSpacing,
  PlanarConfiguration,
  TransferSyntax,
  VoiLutFunction,
  VoiLutModule,
  VoiLutWindow,
} from "src/dicom/domain/common";
import { DicomObject } from "src/dicom/domain/DicomObject";

export type DicomImage = DicomImageGrayScale | DicomImageRgb;

export type DicomImageGrayScale = Readonly<{
  _tag: "GrayScale";

  photometricInterpretation:
    | typeof PhotometricInterpretation.Monochrome1
    | typeof PhotometricInterpretation.Monochrome2;
  voiLutModule: VoiLutModule;
  rescale: Rescale;

  pixelSpacing?: PixelSpacing;

  rows: number;
  columns: number;
  pixelData: PixelDataGrayScale;
}>;
export type DicomImageRgb = Readonly<{
  _tag: "Rgb";

  pixelSpacing?: PixelSpacing;

  rows: number;
  columns: number;
  pixelData: PixelDataRgb;
}>;

const DicomImageGrayScale = (props: Omit<DicomImageGrayScale, "_tag">): DicomImageGrayScale => {
  return {
    _tag: "GrayScale",
    ...props,
  };
};
const DicomImageRgb = (props: Omit<DicomImageRgb, "_tag">): DicomImageRgb => {
  return {
    _tag: "Rgb",
    ...props,
  };
};

type DataFofDicomImageGrayScale = {
  photometricInterpretation:
    | typeof PhotometricInterpretation.Monochrome1
    | typeof PhotometricInterpretation.Monochrome2;
  pixelRepresentation: PixelRepresentation;

  pixelSpacing?: string;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  windowCenter?: number;
  windowWidth?: number;
  voiLutFunction?: VoiLutFunction;

  rescaleIntercept?: number;
  rescaleSlope?: number;

  rows: number;
  columns: number;

  pixelData: Uint8Array;
  pixelDataVr: "OB" | "OW";
};

type DataForDicomImageRgb = {
  planarConfiguration?: PlanarConfiguration;

  pixelSpacing?: string;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  pixelRepresentation: PixelRepresentation;

  rows: number;
  columns: number;

  pixelData: Uint8Array;
  pixelDataVr: "OB" | "OW";
};

export const DicomImage = {
  GrayScale: DicomImageGrayScale,
  Rgb: DicomImageRgb,

  fromDicomObject: (dicomObject: DicomObject): Result<DicomImage, string> => {
    const transferSyntax = dicomObject.transferSyntax ?? TransferSyntax.default();
    const [dicomObjectCompression, endianness] = TransferSyntax.toCompressionAndEndianness(transferSyntax);

    if (dicomObjectCompression !== Compression.None) {
      return Err("Compressed images not supported");
    }

    if (
      (dicomObject.photometricInterpretation === PhotometricInterpretation.Monochrome1 ||
        dicomObject.photometricInterpretation === PhotometricInterpretation.Monochrome2) &&
      dicomObject.samplePerPixel === 1
    ) {
      const {
        rows,
        columns,

        pixelSpacing,

        photometricInterpretation: photometricInterpratation,
        pixelRepresentation,

        bitsAllocated,
        bitsStored,
        highBit,

        windowCenter,
        windowWidth,
        voiLutFunction,

        rescaleIntercept,
        rescaleSlope,

        pixelData,
        pixelDataVr,
      } = dicomObject;
      return DicomImage._fromDataForDicomImageGrayScale({
        rows,
        columns,

        pixelSpacing,

        photometricInterpretation: photometricInterpratation,
        pixelRepresentation,

        bitsAllocated,
        bitsStored,
        highBit,

        windowCenter,
        windowWidth,
        voiLutFunction,

        rescaleIntercept,
        rescaleSlope,

        pixelData,
        pixelDataVr,
      });
    }

    if (dicomObject.samplePerPixel === 3 && dicomObject.photometricInterpretation === "RGB") {
      const {
        planarConfiguration,

        pixelSpacing,

        bitsAllocated,
        bitsStored,
        highBit,

        pixelRepresentation,

        rows,
        columns,

        pixelData,
        pixelDataVr,
      } = dicomObject;
      return DicomImage._fromDataForDicomImageRgb({
        planarConfiguration,

        pixelSpacing,

        bitsAllocated,
        bitsStored,
        highBit,

        pixelRepresentation,

        rows,
        columns,

        pixelData,
        pixelDataVr,
      });
    }

    return Err("Supported only gray scale and rgb images");
  },

  _fromDataForDicomImageGrayScale: ({
    rows,
    columns,
    pixelSpacing: rawPixelSpacing,
    photometricInterpretation: photometricInterpretationFromData,
    pixelRepresentation,
    bitsAllocated,
    bitsStored,
    highBit,
    pixelData,
    pixelDataVr,
    windowCenter,
    windowWidth,
    voiLutFunction,
    rescaleIntercept,
    rescaleSlope,
  }: DataFofDicomImageGrayScale): Result<DicomImageGrayScale, string> => {
    if (pixelDataVr === "OW" && bitsAllocated !== 16) {
      return Err("Not supported pixelData VR");
    }
    if (highBit + 1 !== bitsStored) {
      return Err("Not supported combination of hightBit and bitsStored");
    }
    if (photometricInterpretationFromData === PhotometricInterpretation.Monochrome1) {
      return Err("Not supported photometricInterpretation");
    }

    const pixelSpacingResult = rawPixelSpacing == null ? Ok(undefined) : PixelSpacing.fromString(rawPixelSpacing);
    if (pixelSpacingResult._tag === "Err") {
      return pixelSpacingResult;
    }
    const pixelSpacing = pixelSpacingResult.value;

    const voiLutModule: VoiLutModule = {
      voiLutFunction: voiLutFunction ?? VoiLutFunction.default(),
      window: {
        center: windowCenter ?? VoiLutWindow.default().center,
        width: windowWidth ?? VoiLutWindow.default().width,
      },
    };
    if (voiLutModule.voiLutFunction !== VoiLutFunction.Linear) {
      return Err("Not supported voiLutFunction");
    }

    const rescale: Rescale = {
      slope: rescaleSlope ?? Rescale.default().slope,
      intercept: rescaleIntercept ?? Rescale.default().intercept,
    };

    const imagePixelDataResult = match<[PixelRepresentation, number], Result<PixelDataGrayScale, string>>([
      pixelRepresentation,
      bitsAllocated,
    ])
      .with([PixelRepresentation.Unsigned, 8], () => Ok(new Uint8Array(pixelData.buffer)))
      .with([PixelRepresentation.Unsigned, 16], () => Ok(new Uint16Array(pixelData.buffer)))
      .with([PixelRepresentation.Unsigned, 32], () => Ok(new Uint32Array(pixelData.buffer)))
      .with([PixelRepresentation.Signed, 8], () => Ok(new Int8Array(pixelData.buffer)))
      .with([PixelRepresentation.Signed, 16], () => Ok(new Int16Array(pixelData.buffer)))
      .with([PixelRepresentation.Signed, 32], () => Ok(new Int32Array(pixelData.buffer)))
      .with([__, __], () => Err("Not supported Bits Allocated"))
      .exhaustive();
    if (imagePixelDataResult._tag === "Err") {
      return Err(imagePixelDataResult.error);
    }
    const imagePixelData = imagePixelDataResult.value;

    return Ok(
      DicomImage.GrayScale({
        photometricInterpretation: photometricInterpretationFromData,

        pixelSpacing,

        voiLutModule,
        rescale,

        rows,
        columns,
        pixelData: imagePixelData,
      })
    );
  },

  _fromDataForDicomImageRgb: ({
    rows,
    columns,
    pixelSpacing: rawPixelSpacing,
    planarConfiguration,
    bitsAllocated,
    bitsStored,
    highBit,
    pixelRepresentation,
    pixelData,
    pixelDataVr, // ToDo: Maybe I should do something with it?
  }: DataForDicomImageRgb): Result<DicomImageRgb, string> => {
    if (bitsAllocated !== 8 || bitsStored !== 8 || highBit !== 7) {
      return Err("Not supported combination of bitsAllocated, bitsStored, highBit");
    }
    if (planarConfiguration === PlanarConfiguration.Separated) {
      return Err("Not supported planarConfiguration (separated)");
    }
    if (pixelRepresentation === PixelRepresentation.Signed) {
      return Err("Not supported pixelRepresentation");
    }

    const pixelSpacingResult = rawPixelSpacing == null ? Ok(undefined) : PixelSpacing.fromString(rawPixelSpacing);
    if (pixelSpacingResult._tag === "Err") {
      return pixelSpacingResult;
    }
    const pixelSpacing = pixelSpacingResult.value;

    const pixelsCount = rows * columns;
    const rgbPixelData = new Uint32Array(pixelsCount);
    for (let idx = 0; idx < pixelsCount; idx += 1) {
      rgbPixelData[idx] =
        (pixelData[3 * idx] & 0x000000ff) |
        (pixelData[3 * idx + 1] & 0x0000ff00) |
        (pixelData[3 * idx + 2] & 0x00ff0000) |
        0xff000000;
    }

    return Ok(
      DicomImage.Rgb({
        pixelSpacing,

        rows,
        columns,
        pixelData: rgbPixelData,
      })
    );
  },
};

type PixelDataGrayScale = Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;
type PixelDataRgb = Uint32Array;

type Rescale = Readonly<{
  slope: number;
  intercept: number;
}>;
const Rescale = {
  default: (): Rescale => ({
    slope: 1,
    intercept: 0,
  }),
};
