import { Result } from "../../adt";
import { DicomImage, DicomImageGrayScale, DicomImageRgb, DicomImageTag } from "./DicomImage";
import { PhotometricInterpratation } from "./DicomObject";

export const ImageData_ = {
  fromDicomImage(dicomImage: DicomImage): Result<ImageData, string> {
    switch (dicomImage._tag) {
      case DicomImageTag.GrayScale:
        return ImageData_._fromDicomImageGrayScale(dicomImage);
      case DicomImageTag.Rgb:
        return ImageData_._fromDicomImageRgb(dicomImage);
    }
  },

  _fromDicomImageGrayScale(dicomImage: DicomImageGrayScale): Result<ImageData, string> {
    if (dicomImage.photometricInterpratation == PhotometricInterpratation.Monochrome1) {
      return Result.Err("Not supported photometricInterpratation");
    }
    const imageData = new ImageData(dicomImage.columns, dicomImage.rows);

    // TODO: LUT

    for (let idx = 0; idx < dicomImage.pixelData.length; idx += 1) {
      const value = dicomImage.pixelData[idx];
      imageData.data[4 * idx] = value;
      imageData.data[4 * idx + 1] = value;
      imageData.data[4 * idx + 2] = value;
      imageData.data[4 * idx + 3] = 255;
    }

    return Result.Ok(imageData);
  },

  _fromDicomImageRgb(dicomImage: DicomImageRgb): Result<ImageData, string> {
    const imageData = new ImageData(
      new Uint8ClampedArray(dicomImage.pixelData.buffer),
      dicomImage.columns,
      dicomImage.rows
    );
    return Result.Ok(imageData);
  },
};
