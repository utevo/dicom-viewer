import { ImageRawData, ImageRawDataGrayScale, ImageRawDataRgb, ImageRawDataTag } from "./ImageRawData";

export const ImageData_ = {
  fromImage(imageRawData: ImageRawData): ImageData {
    switch (imageRawData._tag) {
      case ImageRawDataTag.GrayScale:
        return ImageData_._fromImageGrayScale(imageRawData);
      case ImageRawDataTag.Rgb:
        return ImageData_._fromImageRGB(imageRawData);
    }
  },
  _fromImageGrayScale(image: ImageRawDataGrayScale): ImageData {
    const imageData = new ImageData(image.columns, image.rows);

    // TODO: LUT

    for (let idx = 0; idx < image.pixelData.length; idx += 1) {
      const value = image.pixelData[idx];
      imageData.data[4 * idx] = value;
      imageData.data[4 * idx + 1] = value;
      imageData.data[4 * idx + 2] = value;
      imageData.data[4 * idx + 3] = 255;
    }

    return imageData;
  },
  _fromImageRGB(image: ImageRawDataRgb): ImageData {
    const imageData = new ImageData(new Uint8ClampedArray(image.pixelData.buffer), image.columns, image.rows);
    return imageData;
  },
};
