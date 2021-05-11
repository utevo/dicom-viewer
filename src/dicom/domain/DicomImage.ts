import { Result } from "../../common/adt";
import {
  Compression,
  DicomObject,
  PhotometricInterpratation,
  PixelRepresentation,
  PlanarConfiguration,
  VoiLutFunction,
  VoiLutModule,
} from "./DicomObject";

export type DicomImage = DicomImageGrayScale | DicomImageRgb;
export enum DicomImageTag {
  GrayScale = "grayScale",
  Rgb = "rgb",
}

export interface DicomImageGrayScale {
  _tag: DicomImageTag.GrayScale;

  rows: number;
  columns: number;
  pixelData: PixelDataGrayScale;

  photometricInterpratation: PhotometricInterpratation.Monochrome1 | PhotometricInterpratation.Monochrome2;
  voiLutModule: VoiLutModule;
}
export interface DicomImageRgb {
  _tag: DicomImageTag.Rgb;

  rows: number;
  columns: number;
  pixelData: PixelDataRgb;
}

const DicomImageGrayScale = (props: Omit<DicomImageGrayScale, "_tag">): DicomImageGrayScale => {
  return {
    _tag: DicomImageTag.GrayScale,

    ...props,
  };
};
const DicomImageRgb = (props: Omit<DicomImageRgb, "_tag">): DicomImageRgb => {
  return {
    _tag: DicomImageTag.Rgb,

    ...props,
  };
};

interface DataFofDicomImageGrayScale {
  rows: number;
  columns: number;

  photometricInterpratation: PhotometricInterpratation.Monochrome1 | PhotometricInterpratation.Monochrome2;
  pixelRepresentation: PixelRepresentation;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  pixelData: Uint8Array;
  pixelDataVr: "OB" | "OW";
  voiLutModule: Partial<VoiLutModule>;
}

interface DataForDicomImageRgb {
  rows: number;
  columns: number;

  planarConfiguration: PlanarConfiguration;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  pixelRepresentation: PixelRepresentation;

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
          pixelData,
          pixelDataVr,
          voiLutModule,
        } = dicomObject;
        return DicomImage._fromDataForDicomImageGrayScale({
          rows,
          columns,
          photometricInterpratation,
          pixelRepresentation,
          bitsAllocated,
          bitsStored,
          highBit,
          pixelData,
          pixelDataVr,
          voiLutModule,
        });
      }
    }
    if (dicomObject.samplePerPixel === 3 && dicomObject.photometricInterpratation === PhotometricInterpratation.Rgb) {
      const {
        rows,
        columns,
        planarConfiguration,
        bitsAllocated,
        bitsStored,
        highBit,
        pixelRepresentation,
        pixelData,
        pixelDataVr,
      } = dicomObject;
      return DicomImage._fromDataForDicomImageRgb({
        rows,
        columns,
        planarConfiguration: planarConfiguration ?? PlanarConfiguration.Interlaced,
        bitsAllocated,
        bitsStored,
        highBit,
        pixelRepresentation,
        pixelData,
        pixelDataVr,
      });
    }

    return Result.Err("Couldn't convert to Image");
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
    voiLutModule: voiLutModulePartial,
  }: DataFofDicomImageGrayScale): Result<DicomImageGrayScale, string> => {
    if (pixelDataVr === "OW" && bitsAllocated !== 16) {
      return Result.Err("Not supported pixelData VR");
    }
    if (highBit + 1 !== bitsStored) {
      return Result.Err("Not supported combination of hightBit and bitsStored");
    }
    if (photometricInterpratation === PhotometricInterpratation.Monochrome1) {
      return Result.Err("Not supported photometricInterpratation");
    }

    const { voiLutFunction, windowCenter = WINDOW_CENTER_DEFAULT, windowWidth = WINDOW_WIDTH_DEFAULT } = voiLutModulePartial;
    if (voiLutFunction != null && voiLutFunction != VoiLutFunction.Linear) {
      return Result.Err("Not supported voiLutFunction");
    }
    const voiLutModule = {
      windowCenter,
      windowWidth,
      voiLutFunction: VoiLutFunction.Linear,
    };

    let imagePixelData;
    switch (pixelRepresentation) {
      case PixelRepresentation.Unsigned:
        switch (bitsAllocated) {
          case 8:
            imagePixelData = new Uint8Array(pixelData.buffer);
            break;
          case 16:
            imagePixelData = new Uint16Array(pixelData.buffer);
            break;
          case 32:
            imagePixelData = new Uint32Array(pixelData.buffer);
            break;
          default:
            return Result.Err("Not supported Bits Allocated");
        }
        break;

      case PixelRepresentation.Signed:
        switch (bitsAllocated) {
          case 8:
            imagePixelData = new Int8Array(pixelData.buffer);
            break;
          case 16:
            imagePixelData = new Int16Array(pixelData.buffer);
            break;
          case 32:
            imagePixelData = new Int32Array(pixelData.buffer);
            break;
          default:
            return Result.Err("Not supported Bits Allocated");
        }
        break;
    }

    return Result.Ok(
      DicomImage.GrayScale({
        rows,
        columns,
        pixelData: imagePixelData,

        photometricInterpratation,
        voiLutModule,
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
    pixelDataVr,
  }: DataForDicomImageRgb): Result<DicomImageRgb, string> => {
    if (bitsAllocated !== 8 || bitsStored !== 8 || highBit !== 7) {
      return Result.Err("Not supported combination of bitsAllocated, bitsStored, highBit");
    }
    if (planarConfiguration === PlanarConfiguration.Separated) {
      return Result.Err("Not supported planarConfiguration (separated)");
    }
    if (pixelRepresentation === PixelRepresentation.Signed) {
      return Result.Err("Not supported pixelRepresentation");
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

    return Result.Ok(
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

const WINDOW_CENTER_DEFAULT = 1024;
const WINDOW_WIDTH_DEFAULT = 4096;
