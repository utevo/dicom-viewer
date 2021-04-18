import React from "react"
import { Layer, Rect, Stage, Text } from "react-konva"
import { Image } from "./domain"

interface Props {
  image?: Image
  width: number
  height: number
}

export const ImageViewer = ({ image, width, height }: Props): React.ReactElement => {

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Rect x={0} y={0} width={width} height={height} fill={"red"} shadowBlur={5} />
      </Layer>
    </Stage>
  )
}
