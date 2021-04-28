import { Result } from "../../adt";
import {
  Compression,
  DicomImage,
  PhotometricInterpratation,
  PixelRepresentation,
  PlanarConfiguration,
} from "./DicomImage";

export type ImageRawData = ImageRawDataGrayScale | ImageRawDataRgb;
export enum ImageRawDataTag {
  GrayScale = "grayScale",
  Rgb = "rgb",
}

export interface ImageRawDataGrayScale {
  _tag: ImageRawDataTag.GrayScale;

  rows: number;
  columns: number;
  pixelData: Uint8Array | Uint16Array | Uint32Array;
}
export interface ImageRawDataRgb {
  _tag: ImageRawDataTag.Rgb;

  rows: number;
  columns: number;
  pixelData: Uint32Array;
}

const ImageRawDataGrayScale = ({
  rows,
  columns,
  pixelData,
}: Omit<ImageRawDataGrayScale, "_tag">): ImageRawDataGrayScale => {
  return {
    _tag: ImageRawDataTag.GrayScale,

    rows,
    columns,
    pixelData,
  };
};
const ImageRawDataRgb = ({ rows, columns, pixelData }: Omit<ImageRawDataRgb, "_tag">): ImageRawDataRgb => {
  return {
    _tag: ImageRawDataTag.Rgb,

    rows,
    columns,
    pixelData,
  };
};

interface DataForImageGrayScale {
  rows: number;
  columns: number;

  photometricInterpratation: PhotometricInterpratation.Monochrome1 | PhotometricInterpratation.Monochrome2;
  pixelRepresentation: PixelRepresentation;

  bitsAllocated: number;
  bitsStored: number;
  highBit: number;

  pixelData: Uint8Array;
  pixelDataVr: "OB" | "OW";
}

interface DataForImageRGB {
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

export const ImageRawData = {
  GrayScale: ImageRawDataGrayScale,
  Rgb: ImageRawDataRgb,
  fromDicomImage: (dicomImage: DicomImage): Result<ImageRawData, string> => {
    if (dicomImage.compression === Compression.None) {
      if (
        (dicomImage.photometricInterpratation === PhotometricInterpratation.Monochrome1 ||
          dicomImage.photometricInterpratation === PhotometricInterpratation.Monochrome2) &&
        dicomImage.samplePerPixel === 1
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
        } = dicomImage;
        return ImageRawData._fromDataForImageGrayScale({
          rows,
          columns,
          photometricInterpratation,
          pixelRepresentation,
          bitsAllocated,
          bitsStored,
          highBit,
          pixelData,
          pixelDataVr,
        });
      }
    }
    if (dicomImage.samplePerPixel === 3 && dicomImage.photometricInterpratation === PhotometricInterpratation.Rgb) {
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
      } = dicomImage;
      return ImageRawData._fromDataForImageRGB({
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
  _fromDataForImageGrayScale: ({
    rows,
    columns,
    photometricInterpratation,
    pixelRepresentation,
    bitsAllocated,
    bitsStored,
    highBit,
    pixelData,
    pixelDataVr,
  }: DataForImageGrayScale): Result<ImageRawDataGrayScale, string> => {
    if (pixelDataVr === "OW" && bitsAllocated !== 16) {
      return Result.Err("Not supported pixelData VR");
    }
    if (highBit + 1 !== bitsStored) {
      return Result.Err("Not supported combination of hightBit and bitsStored");
    }
    if (photometricInterpratation === PhotometricInterpratation.Monochrome1) {
      return Result.Err("Not supported photometricInterpratation");
    }
    if (pixelRepresentation === PixelRepresentation.Signed) {
      return Result.Err("Not supported pixelRepresentation");
    }

    let imagePixelData;
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
        return Result.Err("Not supported bitsAllocated");
    }

    return Result.Ok(
      ImageRawData.GrayScale({
        rows,
        columns,
        pixelData: imagePixelData,
      })
    );
  },
  _fromDataForImageRGB: ({
    rows,
    columns,
    planarConfiguration,
    bitsAllocated,
    bitsStored,
    highBit,
    pixelRepresentation,
    pixelData,
    pixelDataVr,
  }: DataForImageRGB): Result<ImageRawDataRgb, string> => {
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
      ImageRawData.Rgb({
        rows,
        columns,
        pixelData: rgbPixelData,
      })
    );
  },
};
