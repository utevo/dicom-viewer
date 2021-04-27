import { Image, ImageGrayScale, ImageRGB } from "./Image";

export const ImageData_ = {
  fromImage(image: Image): ImageData {
    switch (image._tag) {
      case "grayScale":
        return ImageData_._fromImageGrayScale(image);
      case "rgb":
        return ImageData_._fromImageRGB(image);
    }
  },
  _fromImageGrayScale(image: ImageGrayScale): ImageData {
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
  _fromImageRGB(image: ImageRGB): ImageData {
    const imageData = new ImageData(new Uint8ClampedArray(image.pixelData.buffer), image.columns, image.rows);
    return imageData;
  },
};
