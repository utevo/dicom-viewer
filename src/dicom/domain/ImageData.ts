import { match } from "ts-pattern";

import { err, ok, Result } from "../../common/adt";
import { WindowingOffset } from "../browser/common";
import { PhotometricInterpratation, VoiLutFunction, VoiLutModule } from "./common";
import { DicomImage, DicomImageGrayScale, DicomImageRgb } from "./DicomImage";

export const ImageData_ = {
  fromDicomImage: (dicomImage: DicomImage, voiLutModuleOffset: WindowingOffset): Result<ImageData, string> =>
    match<DicomImage, Result<ImageData, string>>(dicomImage)
      .with({ _tag: "grayScale" }, (dicomImage) => ImageData_._fromDicomImageGrayScale(dicomImage, voiLutModuleOffset))
      .with({ _tag: "rgb" }, (dicomImage) => ImageData_._fromDicomImageRgb(dicomImage))
      .exhaustive(),

  _fromDicomImageGrayScale: (
    dicomImage: DicomImageGrayScale,
    voiLutModuleOffset: WindowingOffset
  ): Result<ImageData, string> => {
    if (dicomImage.photometricInterpratation == PhotometricInterpratation.Monochrome1) {
      return err(`Not supported Photometric Interpratation (${dicomImage.photometricInterpratation})`);
    }

    const lutResult = Lut.fromVoiLutModuleAndConfig(dicomImage.voiLutModule, voiLutModuleOffset);
    if (lutResult._tag === "err") {
      return lutResult;
    }
    const lut = lutResult.value;

    const imageData = new ImageData(dicomImage.columns, dicomImage.rows);
    for (let idx = 0; idx < dicomImage.pixelData.length; idx += 1) {
      const value = lut(dicomImage.pixelData[idx] * dicomImage.rescale.slope + dicomImage.rescale.intercept);
      imageData.data[4 * idx] = value;
      imageData.data[4 * idx + 1] = value;
      imageData.data[4 * idx + 2] = value;
      imageData.data[4 * idx + 3] = 255;
    }

    return ok(imageData);
  },

  _fromDicomImageRgb: (dicomImage: DicomImageRgb): Result<ImageData, string> => {
    const imageData = new ImageData(
      new Uint8ClampedArray(dicomImage.pixelData.buffer),
      dicomImage.columns,
      dicomImage.rows
    );
    return ok(imageData);
  },
};

type Lut = (pixelValue: number) => number;
const Lut = {
  fromVoiLutModuleAndConfig: (voiLutModule: VoiLutModule, windowingOffset: WindowingOffset): Result<Lut, string> => {
    if (voiLutModule.voiLutFunction !== VoiLutFunction.Linear) {
      return err(`Not supported VOI LUT Functions (${voiLutModule.voiLutFunction})`);
    }
    const windowCenter = voiLutModule.window.center + windowingOffset.windowCenterOffset;
    const windowWidth = voiLutModule.window.width + windowingOffset.windowWidthOffset;

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

    return ok(func);
  },
};
