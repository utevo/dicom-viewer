import React from "react";
import { Image as KonvaImage, Layer, Stage } from "react-konva";
import { Image, ImageData_ } from "./domain";

interface Props {
  image: Image;
  width: number;
  height: number;
}

function imageDataToImageElement(imageData: ImageData): HTMLImageElement {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (ctx == null) {
    throw new Error("Imposable");
  }
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  const image = document.createElement("img");
  image.src = canvas.toDataURL();
  return image;
}

export const ImageViewer = ({ image, width, height }: Props): React.ReactElement => {
  const imageData = ImageData_.fromImage(image);
  const imageElement = imageDataToImageElement(imageData);

  return (
    <Stage width={width} height={height}>
      <Layer>
        <KonvaImage image={imageElement} />
      </Layer>
    </Stage>
  );
};
