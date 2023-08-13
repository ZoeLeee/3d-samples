import { Color, Mesh, MeshBasicMaterial, Raycaster, VideoTexture } from "three";
import { ThreeViewer } from "./ThreeViewer";

const CanSelectNames = [
    "Keyboard", "Mouse", "Lamp", "Moleskine"
];

const SceenList = [{
    toneMappingExposure: 1,
    background: 3359822,
    frontLight: 16711680,
    backLight: 65280,
    room: 2241341,
    text: "#ffffff",
    voile: "#19252b"
}, {
    toneMappingExposure: 10,
    background: 16777215,
    frontLight: 16432492,
    backLight: 16730112,
    room: 10714748,
    text: "#4a4a4a",
    voile: "#D3C9C9"
}, {
    toneMappingExposure: .5,
    background: 16307314,
    frontLight: 16555641,
    backLight: 12165322,
    room: 16429909,
    text: "#ffffff",
    voile: "#3C2F19"
}, {
    toneMappingExposure: 1,
    background: 16777215,
    frontLight: 16777215,
    backLight: 16777215,
    room: 5066061,
    text: "#ffffff",
    voile: "#2E2F2F"
}, {
    toneMappingExposure: 1,
    background: 16384061,
    frontLight: 16711680,
    backLight: 0,
    room: 9701898,
    text: "#ffffff",
    voile: "#490707"
}, {
    toneMappingExposure: 20,
    background: 16777215,
    frontLight: 16777215,
    backLight: 16777215,
    room: 5066061,
    text: "#555555",
    voile: "#D0D1D1"
}, {
    toneMappingExposure: 1,
    background: 16440368,
    frontLight: 16759891,
    backLight: 16724992,
    room: 16771293,
    text: "#ffffff",
    voile: "#5F5B58"
}, {
    toneMappingExposure: 20,
    background: 16777215,
    frontLight: 16068142,
    backLight: 159743,
    room: 1099541,
    text: "#454545",
    voile: "#7DEC8F"
}];

export class RenderRoom {
    raycaster = new Raycaster();
    currentObject: Mesh = null;
    private _currentIndex = 1;
    mouse = {
        x: 0, y: 0
    };
    private _timeer: NodeJS.Timeout;
    private isPlaying = false;
    constructor(private viewer: ThreeViewer) {
        this.register();
        this.Update()
    }
    register() {
        window.addEventListener('mousemove', e => this.onMouseMove(e), false);
        this.viewer.Renderer.domElement.addEventListener('click', this.onMouseDown, false);
        window.addEventListener("resize", () => {
            this.viewer.OnSize();
        });
    }

    onMouseMove(event: MouseEvent) {

        if (this.currentObject) {
            let material = this.currentObject.material as MeshBasicMaterial;
            //@ts-ignore
            material.lightMapIntensity = 1;
            this.currentObject = null;
        }

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

        // 通过摄像机和鼠标位置更新射线
        this.raycaster.setFromCamera(this.mouse, this.viewer._Camera);

        // 计算物体和射线的焦点
        const intersects = this.raycaster.intersectObjects(this.viewer.Scene.children, true);

        for (let i = 0; i < intersects.length; i++) {

            if (CanSelectNames.includes(intersects[i].object.name)) {
                this.currentObject = intersects[i].object as Mesh;
                let material = this.currentObject.material as MeshBasicMaterial;
                //@ts-ignore
                material.lightMapIntensity = 2;
                return;
            }
        }

    };
    onMouseDown = () => {
        const name = this.currentObject?.name;
        if (!name) return;
        switch (name) {
            case "Lamp":
                this._currentIndex++;
                if (this._currentIndex === SceenList.length)
                    this._currentIndex = 0;
                this.Update();
                break;
            case "Mouse":
                this.play();
                break;
        }
    };
    play() {
        const video = document.getElementById('video') as HTMLVideoElement;
        video.volume = 0.1;
        if (this.isPlaying) {
            video.pause();
            this.isPlaying = false;
        }
        else {
            video.play();
            this.isPlaying = true;
            const texture = new VideoTexture(video);
            this.viewer.Screen.material = new MeshBasicMaterial({ map: texture, color: 0xffffff });
        }

    }
    Update() {
        let currentScene = SceenList[this._currentIndex];
        (this.viewer.Scene.background as Color).set(currentScene.background);
        let process = 0;
        if (this._timeer) {
            clearInterval(this._timeer);
            this._timeer = null;
        }
        this._timeer = setInterval(() => {
            for (const shader of this.viewer.Shaders) {
                shader.uniforms.colorDest = {
                    value: new Color(currentScene.room)
                };
                shader.uniforms.progress = {
                    value: process
                };
                process += 0.001;
                if (process >= 10) {
                    clearInterval(this._timeer);
                }
            }
        }, 16);
    }
}