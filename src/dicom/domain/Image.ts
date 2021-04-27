import { Result, ResultTag } from "../../types";
import {
  Compression,
  DicomImage,
  PhotometricInterpratation,
  PixelRepresentation,
  PlanarConfiguration,
} from "./DicomImage";

export type Image = ImageGrayScale | ImageRGB;

export interface ImageGrayScale {
  _tag: "grayScale";

  rows: number;
  columns: number;
  pixelData: Uint8Array | Uint16Array | Uint32Array;
}

export interface ImageRGB {
  _tag: "rgb";

  rows: number;
  columns: number;
  pixelData: Uint32Array;
}

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

export const Image_ = {
  fromDicomImage: (dicomImage: DicomImage): Result<Image, string> => {
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
        return Image_._fromDataForImageGrayScale({
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
      return Image_._fromDataForImageRGB({
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

    return {
      _tag: ResultTag.Err,
      value: "Couldn't convert to Image",
    };
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
  }: DataForImageGrayScale): Result<ImageGrayScale, string> => {
    if (pixelDataVr === "OW" && bitsAllocated !== 16)
      return { _tag: ResultTag.Err, value: "Not supported pixelData VR" };
    if (highBit + 1 !== bitsStored)
      return { _tag: ResultTag.Err, value: "Not supported combination of hightBit and bitsStored" };
    if (photometricInterpratation === PhotometricInterpratation.Monochrome1)
      return { _tag: ResultTag.Err, value: "Not supported photometricInterpratation" };
    if (pixelRepresentation === PixelRepresentation.Signed)
      return { _tag: ResultTag.Err, value: "Not supported pixelRepresentation" };

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
        return { _tag: ResultTag.Err, value: "Not supported bitsAllocated" };
    }

    return {
      _tag: ResultTag.Ok,
      value: {
        _tag: "grayScale",

        rows,
        columns,
        pixelData: imagePixelData,
      },
    };
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
  }: DataForImageRGB): Result<ImageRGB, string> => {
    if (bitsAllocated !== 8 || bitsStored !== 8 || highBit !== 7) {
      return {
        _tag: ResultTag.Err,
        value: "Not supported combination of bitsAllocated, bitsStored, highBit",
      };
    }
    if (planarConfiguration === PlanarConfiguration.Separated) {
      return {
        _tag: ResultTag.Err,
        value: "Not supported planarConfiguration (separated)",
      };
    }
    if (pixelRepresentation === PixelRepresentation.Signed) {
      return { _tag: ResultTag.Err, value: "Not supported pixelRepresentation" };
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

    return {
      _tag: ResultTag.Ok,
      value: {
        _tag: "rgb",

        rows,
        columns,
        pixelData: rgbPixelData,
      },
    };
  },
};
