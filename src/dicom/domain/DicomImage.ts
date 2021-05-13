import { match, __ } from "ts-pattern";
import { Result } from "../../common/adt";
import {
  Compression,
  DicomObject,
  PhotometricInterpratation,
  PixelRepresentation,
  PlanarConfiguration,
  VoiLutFunction,
  VOI_LUT_FUNCTION_DEFAULT,
} from "./DicomObject";

const { Ok, Err } = Result;

export type DicomImage = DicomImageGrayScale | DicomImageRgb;

export interface DicomImageGrayScale {
  _tag: "GrayScale";

  photometricInterpratation: PhotometricInterpratation.Monochrome1 | PhotometricInterpratation.Monochrome2;
  voiLutModule: VoiLutModule;
  rescale: Rescale;

  rows: number;
  columns: number;
  pixelData: PixelDataGrayScale;
}
export interface DicomImageRgb {
  _tag: "Rgb";

  rows: number;
  columns: number;
  pixelData: PixelDataRgb;
}

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

interface DataFofDicomImageGrayScale {
  photometricInterpratation: PhotometricInterpratation.Monochrome1 | PhotometricInterpratation.Monochrome2;
  pixelRepresentation: PixelRepresentation;

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
}

interface DataForDicomImageRgb {
  planarConfiguration?: PlanarConfiguration;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  pixelRepresentation: PixelRepresentation;

  rows: number;
  columns: number;

  pixelData: Uint8Array;
  pixelDataVr: "OB" | "OW";
}

export const DicomImage = {
  GrayScale: DicomImageGrayScale,
  Rgb: DicomImageRgb,

  fromDicomObject: (dicomObject: DicomObject): Result<DicomImage, string> => {
    if (dicomObject.compression === Compression.None) {
      if (
        (dicomObject.photometricInterpratation === PhotometricInterpratation.Monochrome1 ||
          dicomObject.photometricInterpratation === PhotometricInterpratation.Monochrome2) &&
        dicomObject.samplePerPixel === 1
      ) {
        const {
          rows,
          columns,

          photometricInterpratation,
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

          photometricInterpratation,
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
    }
    if (dicomObject.samplePerPixel === 3 && dicomObject.photometricInterpratation === PhotometricInterpratation.Rgb) {
      const {
        planarConfiguration,

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

    return Err("Couldn't convert to Dicom Image (not gray scale or rgb");
  },

  _fromDataForDicomImageGrayScale: ({
    rows,
    columns,
    photometricInterpratation,
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
    if (photometricInterpratation === PhotometricInterpratation.Monochrome1) {
      return Err("Not supported photometricInterpratation");
    }

    const voiLutModule: VoiLutModule = {
      voiLutFunction: voiLutFunction ?? VOI_LUT_FUNCTION_DEFAULT,
      window: {
        center: windowCenter ?? Window.default().center,
        width: windowWidth ?? Window.default().width,
      },
    };
    if (voiLutModule.voiLutFunction !== VoiLutFunction.Linear) {
      return Err("Not supported voiLutFunction");
    }

    const rescale: Rescale = {
      slope: rescaleSlope ?? Rescale.default().slope,
      intercept: rescaleIntercept ?? Rescale.default().intercept,
    };

    const maybeImagePixelData = match<[PixelRepresentation, number], Result<PixelDataGrayScale, string>>([
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
    if (maybeImagePixelData._tag === "Err") {
      return Err(maybeImagePixelData.error);
    }
    const imagePixelData = maybeImagePixelData.value;

    return Ok(
      DicomImage.GrayScale({
        photometricInterpratation,

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
        rows,
        columns,
        pixelData: rgbPixelData,
      })
    );
  },
};

type PixelDataGrayScale = Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;
type PixelDataRgb = Uint32Array;

interface Rescale {
  readonly slope: number;
  readonly intercept: number;
}
const Rescale = {
  default: (): Rescale => ({
    slope: 1,
    intercept: 0,
  }),
};

interface Window {
  readonly center: number;
  readonly width: number;
}
const Window = {
  default: (): Window => ({
    center: 1024,
    width: 4096,
  }),
};

export interface VoiLutModule {
  window: Window;
  voiLutFunction: VoiLutFunction;
}
