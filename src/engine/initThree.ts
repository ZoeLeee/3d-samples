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

  const geometry = new BoxGeometry(1, 1, 1);

  const material = new MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new Mesh(geometry, material);

  camera.position.y = 100;

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
          shader.uniforms.uTopColor = { value: new Color("#aaaeff") };

          // 扩散中心
          shader.uniforms.uCenter = { value: new Vector2(0, 0) }; // 2d
          // 扩散时间
          shader.uniforms.uTime = { value: 0.0 };
          //扩散宽度
          shader.uniforms.uWidth = { value: 40 };
          shader.uniforms.uMaxWidth = { value: maxX };

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
            `
          );
        };
      }
    });
  });

  let time = 0;

  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
    time += 2;
    if (time > 800) {
      time = 0;
    }
    shaders.forEach((shader) => {
      shader.uniforms.uTime.value = time;
    });
  }

  animate();
}
