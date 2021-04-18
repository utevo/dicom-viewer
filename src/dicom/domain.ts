import { DataSet } from "dicom-parser";

export interface DicomImage {
  rows: number;
  columns: number;

  transferSyntax: TransferSyntax;

  windowCenter?: number;
  windowWidth?: number;

  bitsAllocated: number;
  bitsStored: number;

  pixelData: Uint8Array;
}

export const DicomImage_ = {
  fromDataSet: (dataSet: DataSet): DicomImage => {
    const rows = dataSet.uint16("x00280010");
    const columns = dataSet.uint16("x00280011");

    const transferSyntax = TransferSyntax_.fromTransferSyntaxUID(
      dataSet.string("x00020012")
    );

    const windowCenter = dataSet.floatString("x00281050")
    const windowWidth = dataSet.floatString("x00281051");

    const bitsAllocated = dataSet.uint16('x00280100');
    const bitsStored = dataSet.uint16('x00280101');

    const pixelDataElement = dataSet.elements.x7fe00010;
    const pixelData = new Uint8Array(dataSet.byteArray.buffer, pixelDataElement.dataOffset, pixelDataElement.length);

    console.log({ pixelData })
    return {
      rows,
      columns,
      transferSyntax,
      windowCenter,
      windowWidth,
      bitsAllocated,
      bitsStored,
      pixelData,
    };
  },
};

export type Image = ImageGrayScale | ImageRGB;

interface ImageGrayScale {
  type: "grayScale";

  rows: number;
  columns: number;
  pixelData: Uint8Array | Uint16Array | Uint32Array;
}

interface ImageRGB {
  type: "rgb";

  rows: number;
  columns: number;
  pixelData: Uint32Array;
}

export const Image_ = {
  fromDicomImage({ rows, columns, bitsAllocated, pixelData}: DicomImage): Image {

    const imagePixelData = function() {
      if (bitsAllocated <= 8) {
        return new Uint8Array(pixelData);
      }
      if (bitsAllocated <= 16) {
        return new Uint16Array(pixelData);
      }
      if (bitsAllocated <= 32) {
        return new Uint32Array(pixelData);
      }
      throw Error("Unexpected bitsAllocated");
    }()

    return {
      type: "grayScale",

      rows,
      columns,
      pixelData: imagePixelData
    }
  }
}

export const ImageData_ = {
  fromImage(image: Image): ImageData {
    if (image.type === "grayScale") {
      const imageData = new ImageData(image.columns, image.rows);
      console.log({ image })

      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = image.pixelData[Math.floor(i / 2)];
        imageData.data[i + 0] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255;
      }

      return imageData;
    }
    throw Error("Not Implemented")
  }
}

export enum TransferSyntax {
  JPEG2000 = "JPEG2000",
  DecodeRLE = "DecodeRLE",
  JPEGLossless = "JPEGLossless",
  JPEGBaseline = "JPEGBaseline",
  UncompressedLE = "UncompressedLE",
  UncompressedBE = "UncompressedBE",
}

export const TransferSyntax_ = {
  fromTransferSyntaxUID(transferSyntaxUID: string): TransferSyntax {
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
};
