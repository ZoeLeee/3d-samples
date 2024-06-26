import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  AmbientLight,
  Color,
  Vector2,
  AxesHelper,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { ThreeFlyLine } from "./fly-line/trhee-fly-line";

export function initThreejs(canvas: HTMLCanvasElement) {
  console.log("canvas: ", canvas);
  const [width, height] = [canvas.clientWidth, canvas.clientHeight];
  console.log("height: ", height);
  console.log("width: ", width);

  const scene = new Scene();
  const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
  const renderer = new WebGLRenderer({ canvas: canvas });
  renderer.setSize(width, height);

  const controls = new OrbitControls(camera, canvas);

  controls.update();

  const axesHelper = new AxesHelper(50);
  scene.add(axesHelper);

  camera.position.y = 100;

  new ThreeFlyLine(scene);

  const loader = new GLTFLoader();

  let shaders = new Set();

  loader.load("/models/city.glb", function (gltf) {
    console.log("gltf: ", gltf);
    scene.add(gltf.scene);
    gltf.scene.traverse((child) => {
      if (child.type === "Mesh") {
        const mtl = new MeshBasicMaterial({ color: 0x0c0e6f });
        const mesh = child as Mesh;
        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox!;
        console.log("box: ", box);
        mesh.material = mtl;
        const y = box.max.y - box.min.y;
        const maxX = box.max.x - box.min.x;
        mtl.onBeforeCompile = (shader) => {
          shaders.add(shader);
          // console.log(shader.fragmentShader);
          // console.log(shader.vertexShader);
          shader.uniforms.uHeight = { value: y };
          shader.uniforms.uTopColor = { value: new Color(0xaaaeff) };

          // 扩散中心
          shader.uniforms.uCenter = { value: new Vector2(0, 0) }; // 2d
          // 扩散时间
          shader.uniforms.uTime = { value: 0.0 };
          //扩散宽度
          shader.uniforms.uWidth = { value: 40 };
          shader.uniforms.uMaxWidth = { value: maxX };

          // 线型扩散时间
          shader.uniforms.uLineTime = { value: -200 };
          // 线型扩散宽度
          shader.uniforms.uLineWidth = { value: 40 };

          // 垂直扩散时间
          shader.uniforms.uVerticalTime = { value: 0 };
          // 垂直扩散宽度
          shader.uniforms.uVerticalWidth = { value: 200 };

          shader.vertexShader = shader.vertexShader.replace(
            "#include <common>",
            `#include <common>
            varying vec3 vPosition;
            `
          );
          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `#include <begin_vertex>
            vPosition=position;
            `
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <common>",
            `#include <common>
            uniform float uHeight;
            uniform vec3 uTopColor;

            uniform vec2 uCenter;
            uniform float uTime;
            uniform float uWidth;
            uniform float uMaxWidth;

            uniform float uLineTime;
            uniform float uLineWidth;

            uniform float uVerticalTime;
            uniform float uVerticalWidth;


            varying vec3 vPosition;
            
            `
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `#include <dithering_fragment>
            vec4 distGradColor=gl_FragColor;

            // 设置混合的百分比
            float gradMix=(vPosition.y+uHeight/2.0)/uHeight;
            //计算出混合颜色
            vec3 mixColor=mix(distGradColor.xyz,uTopColor,gradMix);
            gl_FragColor=vec4(mixColor,1.0);

            // 离中心电距离
            float dist=distance(vPosition.xz,uCenter);

            // 扩散范围函数
            float spreadIndex=-pow(dist-uTime,2.0)+uWidth;


            if(spreadIndex>0.0){
              gl_FragColor=mix(gl_FragColor,vec4(1.0),spreadIndex/uWidth);
            }


            // 线型扩散函数
            float lineSpreadIndex=-pow(vPosition.x-vPosition.z-uLineTime,2.0)+uLineWidth;

            if(lineSpreadIndex>0.0){
              gl_FragColor=mix(gl_FragColor,vec4(1.0,0.8,0.8,1.0),lineSpreadIndex/uLineWidth);
            }

            // 垂直扩散函数
            float verticalSpreadIndex=-pow(vPosition.y-uVerticalTime,2.0)+uVerticalWidth;

            if(verticalSpreadIndex>0.0){
              gl_FragColor=mix(gl_FragColor,vec4(0.8,0.8,1.0,1.0),verticalSpreadIndex/uVerticalWidth);
            }

            `
          );
        };
      }
    });
  });

  let time = 0;
  let time2 = -400;

  let time3 = -40;

  let start3 = false;

  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
    time += 2;
    time2 += 4;
    if (start3) time3 += 0.5;

    if (time > 800) {
      time = 0;
    }
    if (time2 > 800) {
      time2 = -400;
      start3 = true;
    }

    if (time3 > 18) {
      time3 = -40;
      start3 = false;
    }

    shaders.forEach((shader) => {
      //@ts-ignore
      shader.uniforms.uTime.value = time;
      //@ts-ignore
      shader.uniforms.uLineTime.value = time2;
      //@ts-ignore
      shader.uniforms.uVerticalTime.value = time3;
    });
  }

  animate();

  window.addEventListener("resize", () => {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
}
