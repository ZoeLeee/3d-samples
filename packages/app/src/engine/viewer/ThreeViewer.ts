import { CDN_IMG_URL, CDN_URL } from "@/utils/host";
import { LoadHDR } from "@/utils/loaders";
import { AmbientLight, AxesHelper, BufferGeometry, Color, DirectionalLight, Mesh, MeshBasicMaterial, PerspectiveCamera, ReinhardToneMapping, Scene, Shader, TextureLoader, Vector3, WebGLRenderer } from "three";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { sleep } from "@/utils/utils";

const CDNHOST = "https://cdn.jsdelivr.net/gh/ZoeLeee/cdn/";

const PREVIEWs = ["zd01.jpg", "zd02.jpg", "banner01.jpg", "banner02.jpg", "banner03.jpg"];

const gtlfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath(CDNHOST + "script/");

gtlfLoader.setDRACOLoader(dracoLoader);
const Width = 32;

export class ThreeViewer {
    Renderer: WebGLRenderer = new WebGLRenderer(
        {
            antialias: true,//antialias:true/false是否开启反锯齿
            precision: "highp",//precision:highp/mediump/lowp着色精度选择
            alpha: false,//alpha:true/false是否可以设置背景色透明
            logarithmicDepthBuffer: true,
        }
    );
    private _Scene = new Scene();
    _Camera: PerspectiveCamera;
    private _Width: number;
    private _Height: number;
    private _container: HTMLElement;
    private frontlight = new DirectionalLight(16711680, .5);
    private backlight = new DirectionalLight(65280, .5);
    Shaders: Shader[] = [];
    needUpdate = true;
    Screen: Mesh;
    private defaultMaterial: MeshBasicMaterial = new MeshBasicMaterial();
    constructor(container: HTMLElement) {
        this._Width = container.clientWidth;
        this._Height = container.clientHeight;
        this._container = container;

        //校验.成为2的倍数 避免外轮廓错误.
        if (this._Width % 2 === 1)
            this._Width -= 1;
        if (this._Height % 2 === 1)
            this._Height -= 1;
        this.InitCamera();
        this.InitScene();
        this.InitLight();
        this.InitRender(container);

        // let axes = new AxesHelper(100);
        // this._Scene.add(axes);

        this.StartRender();

        let control = new OrbitControls(this._Camera, this.Renderer.domElement);

        //@ts-ignore
        window["viewer"] = this;
    }
    get Scene() {
        return this._Scene;
    }
    InitRender(canvasContainer: HTMLElement) {
        //加到画布
        canvasContainer.appendChild(this.Renderer.domElement);

        this.Renderer.autoClear = true;
        this.Renderer.sortObjects = false;
        this.Renderer.setPixelRatio(window.devicePixelRatio),
            //如果设置，那么它希望所有的纹理和颜色都是预乘的伽玛。默认值为false。
            this.Renderer.shadowMap.enabled = true;
        this.Renderer.setPixelRatio(window.devicePixelRatio);

        //设置它的背景色为黑色
        this.Renderer.setClearColor(0x000000, 1);

        this.Renderer.toneMappingExposure = 1;
        this.Renderer.toneMapping = ReinhardToneMapping;

        this.OnSize(this._Width, this._Height);
    }
    InitLight() {
        const amlight = new AmbientLight(0x444444, 1);
        this.Scene.add(amlight);
        this.frontlight.position.set(4, 2, 0);
        this.backlight.position.set(-6, 2, 0);
        this._Scene.add(this.frontlight);
        this._Scene.add(this.backlight);
    }
    InitCamera() {
        this._Camera = new PerspectiveCamera(35, this._Width / this._Height, 0.1, 100);
        this._Camera.position.copy(new Vector3(-0, 0.2, 3.5));
        this._Camera.lookAt(0, 0, 0);
    }
    InitScene() {
        this._Scene.background = new Color(3359822);
        gtlfLoader.load(CDN_URL + 'scene.glb', async (gltf) => {
            const group = gltf.scene;
            for (let o of group.children as Mesh[]) {
                let url = CDN_URL + `${o.name}_baked.hdr`;
                switch (o.name) {
                    case "ChairPied":
                        url = CDN_URL + "Chair.Pied_baked.hdr";
                        break;
                    case "DeskDrawers":
                        url = CDN_URL + "Desk.Drawers_baked.hdr";
                        break;
                    case "DeskHandles":
                        url = CDN_URL + "Desk.Handles_baked.hdr";
                        break;
                    case "DeskTable":
                        url = CDN_URL + "Desk.Table_baked.hdr";
                        break;
                    case "ScreenFrame":
                        url = CDN_URL + "Screen.Frame_baked.hdr";
                        break;
                    case "Screen":
                        {
                            //TODO:轮播项目和文章图片，鼠标移入停止
                            this.Screen = o;
                            const buffer = o.geometry as BufferGeometry;
                            const uv = buffer.attributes.uv;
                            for (let i = 0; i < uv.count; i++) {
                                const x = uv.getX(i);
                                const y = uv.getY(i);
                                uv.setXY(i, y, x);
                            }
                            break;
                        }
                    default:
                        break;
                }
                if (!url) continue;
                const e = o.geometry as BufferGeometry;
                e.setAttribute("uv2", e.getAttribute("uv").clone());
                console.log('url: ', url);
                const texture = await LoadHDR(url);
                if (texture) {
                    o.material = new MeshBasicMaterial({
                        //@ts-ignore
                        lightMap: texture,
                        lightMapIntensity: 1,
                        dithering: true,
                        color: new Color(2241341)
                    });
                    o.material.onBeforeCompile = (shader: Shader) => {
                        shader.uniforms.progress = {
                            value: 10
                        };
                        shader.uniforms.colorDest = {
                            value: new Color(2241341)
                        };
                        shader.uniforms.center = {
                            value: new Vector3(1.04, .968, .35)
                        };

                        shader.vertexShader = "varying vec4 vMvPosition;\n" + shader.vertexShader;
                        shader.vertexShader = shader.vertexShader.replace(
                            "#include <project_vertex>",
                            `
                                vec4 mvPosition = vec4( transformed, 1.0 );
                                mvPosition = modelViewMatrix * mvPosition;
                                vMvPosition = vec4( transformed, 1.0 ) * modelMatrix;
                                gl_Position = projectionMatrix * mvPosition;
                            `
                        );

                        shader.fragmentShader = `
                                                    uniform float progress;
                                                    uniform vec3 colorDest;
                                                    uniform vec3 center;
                                                    varying vec4 vMvPosition;` + shader.fragmentShader;

                        let fsShader = `
                                                    float edge = 0.001;
                                                    float gradient = 0.01;
                                                    float d = distance(vMvPosition.xyz, center);
                                                    float t = progress * 5.674;
                                                    float frontiere = step(t, d);
                                                    float circle = 1.0 + smoothstep(t,t + gradient, d) - smoothstep(t - gradient, t, d);
                                                    vec4 diffuseColor = mix(vec4(vec3(4.0), 1.0),vec4( mix(colorDest, diffuse, frontiere), opacity ), circle);
                                                    `;
                        shader.fragmentShader = shader.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );", fsShader);

                        this.Shaders.push(shader);
                    };
                }
            }
            group.position.setY(-1.25);
            this.Scene.add(group);
            this.do([])
            this.Update();
        });
    }
    async do(data: any[]) {
        this.Screen.material = this.defaultMaterial;
        for (const img of PREVIEWs) {
            let texture = new TextureLoader().load(CDN_IMG_URL + img);
            this.defaultMaterial.map = texture;
            await sleep(1);
        }
    }
    OnSize(width?: number, height?: number) {
        this._Width = width ?? this._container.clientWidth;
        this._Height = height ?? this._container.clientHeight;

        //校验.成为2的倍数 避免外轮廓错误.
        if (this._Width % 2 === 1)
            this._Width -= 1;
        if (this._Height % 2 === 1)
            this._Height -= 1;

        this.Renderer.setSize(this._Width, this._Height);
        this._Camera.aspect = this._Width / this._Height;
        this._Camera.updateProjectionMatrix();
    }
    StartRender = () => {
        requestAnimationFrame(this.StartRender);
        this.Render();
    };
    Render() {
        // if (!this.needUpdate)
        //     return;
        // this.needUpdate = false;
        this.Renderer.render(this._Scene, this._Camera);
    }
    Update() {
        this.needUpdate = true;
    }
}