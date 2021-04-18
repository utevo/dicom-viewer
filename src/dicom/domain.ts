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

export interface Image {
  rows: number;
  columns: number;

  type: "grayScale" | "rgb";
  pixelData: Uint8Array;
}

export const Image_ = {
  fromDicomImage(dicomImage: DicomImage): Image {
    return {
      rows: dicomImage.rows,
      columns: dicomImage.columns,

      type: "grayScale",
      pixelData: dicomImage.pixelData,
    }
  }
}

const ImageData_ = {
  fromImage(image: Image): ImageData {
    if (image.type === "grayScale") {
      const imageData = new ImageData(image.columns, image.rows);

      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i + 0] = 255;
      }

    }
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
