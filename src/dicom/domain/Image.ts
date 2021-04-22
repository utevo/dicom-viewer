import { Image } from "react-konva";
import { Compression, DicomImage } from "./DicomImage";

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

  bitsAllocated: number;

  pixelData:
}

export const Image_ = {
  fromDicomImage: (dicomImage: DicomImage): Image => {
    if (dicomImage.compression !== Compression.None) {
      switch (dicomImage.samplePerPixel) {
        case 1:
          return Image_._grayScaleFrom(dicomImage);
        case 3:
          if (dicomImage.p)

      }
    }


      throw Error("Couldn't convert to Image")
  },
  _grayScaleFrom: ({rows, columns, bitsAllocated, pixelData}: DataForImageGrayScale): Image => {
    const imagePixelData = (function () {
      if (bitsAllocated <= 8) {
        return new Uint8Array(pixelData.buffer);
      }
      if (bitsAllocated <= 16) {
        return new Uint16Array(pixelData.buffer);
      }
      if (bitsAllocated <= 32) {
        return new Uint32Array(pixelData.buffer);
      }
      throw Error("Unexpected bitsAllocated");
    })();

    return {
      type: "grayScale",

      rows,
      columns,
      pixelData: imagePixelData,
    };
  },
  _rgbFrom: (dicomImage: DicomImage): Image => {

    // depends on planarConfiguration, bitsAllocated (bitsStored), highBit, pixelRepresentation,
    dicomImage.samplePerPixel
      return {
          type: "rgb",

          rows: dicomImage.rows,
          columns: dicomImage.columns,
          pixelData: new Uint32Array(dicomImage.pixelData.buffer),
      }
  }
};
