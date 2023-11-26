import { Stage } from "konva/lib/Stage";
import { Layer } from "konva/lib/Layer";
import { Circle } from "konva/lib/shapes/Circle";
import { useEffect, useRef } from "react";

export const VisualList = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const stage = new Stage({
        container: ref.current,
        width: ref.current.clientWidth,
        height: ref.current.clientWidth,
      });
      // then create layer
      const layer = new Layer();

      // create our shape
      const circle = new Circle({
        x: stage.width() / 2,
        y: stage.height() / 2,
        radius: 70,
        fill: "red",
        stroke: "black",
        strokeWidth: 4,
      });

      // add the shape to the layer
      layer.add(circle);

      // add the layer to the stage
      stage.add(layer);

      // draw the image
      layer.draw();
    }
  }, []);

  return (
    <div
      ref={ref}
      style={{
        width: "100vw",
        height: "100vh",
      }}
    ></div>
  );
};
