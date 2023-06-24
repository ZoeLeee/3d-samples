import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Clock,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
} from "three";

import vertex from "./flyLine.vs?raw";
console.log("vertex: ", vertex);
import fragment from "./flyLine.fs?raw";
import { gsap } from "gsap";

export class ThreeFlyLine {
  public mesh: Mesh;
  constructor(scene: Scene) {
    //Create a closed wavey loop
    const curve = new CatmullRomCurve3([
      new Vector3(-10, 0, 10),
      new Vector3(-5, 5, 5),
      new Vector3(0, 0, 0),
    ]);

    const points = curve.getPoints(1000);
    const geometry = new BufferGeometry().setFromPoints(points);

    const aSizeArray = new Float32Array(points.length);

    for (let i = 0; i < points.length; i++) {
      aSizeArray[i] = i;
    }

    //设置集合体顶点属性
    geometry.setAttribute("aSize", new BufferAttribute(aSizeArray, 1));

    const mtl = new ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTime: { value: 0 },
        uLength: { value: points.length },
        uColor: { value: new Color(0x99dd99) },
      },
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });

    // Create the final object to add to the scene
    const curveObject = new Points(geometry, mtl);

    scene.add(curveObject);

    gsap.to(mtl.uniforms.uTime, {
      value: 1000,
      repeat: -1,
      duration: 10,
      ease: "none",
    });
  }
}
