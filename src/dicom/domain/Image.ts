import { Image } from "react-konva";
import {
  Compression,
  DicomImage,
  PhotometricInterpratation,
  PixelRepresentation,
  PlanarConfiguration,
} from "./DicomImage";

export type Image = ImageGrayScale | ImageRGB;

export interface ImageGrayScale {
  type: "grayScale";

  rows: number;
  columns: number;
  pixelData: Uint8Array | Uint16Array | Uint32Array;
}

export interface ImageRGB {
  type: "rgb";

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
  fromDicomImage: (dicomImage: DicomImage): Image => {
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

    throw Error("Couldn't convert to Image");
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
  }: DataForImageGrayScale): ImageGrayScale => {
    if (pixelDataVr === "OW" && bitsAllocated !== 16) {
      throw Error("Not supported pixelData VR");
    }
    if (highBit + 1 !== bitsStored) {
      throw Error("Not supported combination of hightBit and bitsStored");
    }
    if (photometricInterpratation === PhotometricInterpratation.Monochrome1) {
      throw Error("Not supported photometricInterpratation");
    }
    if (pixelRepresentation === PixelRepresentation.Signed) {
      throw Error("Not supported pixelRepresentation");
    }

    const imagePixelData = (function () {
      if (bitsAllocated === 8) {
        return new Uint8Array(pixelData.buffer);
      }
      if (bitsAllocated === 16) {
        return new Uint16Array(pixelData.buffer);
      }
      if (bitsAllocated === 32) {
        return new Uint32Array(pixelData.buffer);
      }
      throw Error("Not supported bitsAllocated");
    })();

    return {
      type: "grayScale",

      rows,
      columns,
      pixelData: imagePixelData,
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
  }: DataForImageRGB): ImageRGB => {
    if (bitsAllocated !== 8 || bitsStored !== 8 || highBit !== 7) {
      throw new Error("Not supported combination of bitsAllocated, bitsStored, highBit");
    }

    const pixelsCount = rows * columns;
    const rgbPixelData = new Uint32Array(pixelsCount);
    for (let idx = 0; idx < pixelsCount; idx += 1) {
      rgbPixelData[idx] = (pixelData[3 * idx] & 0x000000FF) | (pixelData[3 * idx + 1] & 0x0000FF00) | ((pixelData[3 * idx + 2] & 0x00FF0000)) | 0xFF000000;
    }

    return {
      type: "rgb",

      rows,
      columns,
      pixelData: rgbPixelData,
    };
  },
};
