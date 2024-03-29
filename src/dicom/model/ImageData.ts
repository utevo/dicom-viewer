import { match } from "ts-pattern";

import { Err, Ok, Result } from "src/common/result";
import { WindowingOffset } from "src/dicom/browser/utils";
import { PhotometricInterpretation, VoiLutFunction, VoiLutModule } from "src/dicom/model/attributes";
import { DicomImage, DicomImageGrayScale, DicomImageRgb } from "src/dicom/model/DicomImage";

export type ImageData = globalThis.ImageData;
export const ImageData = {
  fromDicomImage: (dicomImage: DicomImage, voiLutModuleOffset: WindowingOffset): Result<ImageData, string> =>
    match<DicomImage, Result<ImageData, string>>(dicomImage)
      .with({ _tag: "GrayScale" }, (dicomImage) => ImageData._fromDicomImageGrayScale(dicomImage, voiLutModuleOffset))
      .with({ _tag: "Rgb" }, (dicomImage) => ImageData._fromDicomImageRgb(dicomImage))
      .exhaustive(),

  _fromDicomImageGrayScale: (
    dicomImage: DicomImageGrayScale,
    voiLutModuleOffset: WindowingOffset
  ): Result<ImageData, string> => {
    if (dicomImage.photometricInterpretation == PhotometricInterpretation.Monochrome1) {
      return Err(`Not supported Photometric Interpratation (${dicomImage.photometricInterpretation})`);
    }

    const lutResult = Lut.fromVoiLutModuleAndConfig(dicomImage.voiLutModule, voiLutModuleOffset);
    if (lutResult._tag === "Err") {
      return lutResult;
    }
    const lut = lutResult.value;

    const imageData = new globalThis.ImageData(dicomImage.columns, dicomImage.rows);
    for (let idx = 0; idx < dicomImage.pixelData.length; idx += 1) {
      const value = lut(dicomImage.pixelData[idx] * dicomImage.rescale.slope + dicomImage.rescale.intercept);
      imageData.data[4 * idx] = value;
      imageData.data[4 * idx + 1] = value;
      imageData.data[4 * idx + 2] = value;
      imageData.data[4 * idx + 3] = 255;
    }

    return Ok(imageData);
  },

  _fromDicomImageRgb: (dicomImage: DicomImageRgb): Result<ImageData, string> => {
    const imageData = new globalThis.ImageData(
      new Uint8ClampedArray(dicomImage.pixelData.buffer),
      dicomImage.columns,
      dicomImage.rows
    );
    return Ok(imageData);
  },
};

type Lut = (pixelValue: number) => number;
const Lut = {
  fromVoiLutModuleAndConfig: (voiLutModule: VoiLutModule, windowingOffset: WindowingOffset): Result<Lut, string> => {
    if (voiLutModule.voiLutFunction !== VoiLutFunction.Linear) {
      return Err(`Not supported VOI LUT Functions (${voiLutModule.voiLutFunction})`);
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

    return Ok(func);
  },
};
