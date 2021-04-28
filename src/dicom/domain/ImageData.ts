import { Result, ResultTag } from "../../common/adt";
import { VoiLutModuleOffset } from "../browser/types";
import { DicomImage, DicomImageGrayScale, DicomImageRgb, DicomImageTag } from "./DicomImage";
import { PhotometricInterpratation, VoiLutFunction, VoiLutModule } from "./DicomObject";

export const ImageData_ = {
  fromDicomImage(dicomImage: DicomImage, voiLutModuleOffset: VoiLutModuleOffset): Result<ImageData, string> {
    switch (dicomImage._tag) {
      case DicomImageTag.GrayScale:
        return ImageData_._fromDicomImageGrayScale(dicomImage, voiLutModuleOffset);
      case DicomImageTag.Rgb:
        return ImageData_._fromDicomImageRgb(dicomImage);
    }
  },

  _fromDicomImageGrayScale(
    dicomImage: DicomImageGrayScale,
    voiLutModuleOffset: VoiLutModuleOffset
  ): Result<ImageData, string> {
    if (dicomImage.photometricInterpratation == PhotometricInterpratation.Monochrome1) {
      return Result.Err(`Not supported Photometric Interpratation (${dicomImage.photometricInterpratation})`);
    }

    const lut = Lut.fromVoiLutModuleAndConfig(dicomImage.voiLutModule, voiLutModuleOffset);
    if (lut._tag === ResultTag.Err) {
      return lut;
    }

    const imageData = new ImageData(dicomImage.columns, dicomImage.rows);
    for (let idx = 0; idx < dicomImage.pixelData.length; idx += 1) {
      const value = lut.value(dicomImage.pixelData[idx]);
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

type Lut = (pixelValue: number) => number;
const Lut = {
  fromVoiLutModuleAndConfig: (
    voiLutModule: VoiLutModule,
    voiLutModuleOffset: VoiLutModuleOffset
  ): Result<Lut, string> => {
    if (voiLutModule.voiLutFunction !== VoiLutFunction.Linear) {
      return Result.Err(`Not supported VOI LUT Functions (${voiLutModule.voiLutFunction})`);
    }
    const windowCenter = voiLutModule.windowCenter + voiLutModuleOffset.windowCenterOffset;
    const windowWidth = voiLutModule.windowWidth + voiLutModuleOffset.windowWidthOffset;

    const func = (pixelData: number): number => {
      if (pixelData < windowCenter - windowWidth / 2) {
        return 0;
      }
      if (pixelData > windowCenter + windowWidth / 2) {
        return 255;
      }
      const a = 255 / windowWidth;
      const b = 255 / 2 - windowCenter * a;
      return Math.round(a * pixelData + b);
    };

    return Result.Ok(func);
  },
};
