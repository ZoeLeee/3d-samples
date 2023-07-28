import { FramingBehavior } from "@babylonjs/core/Behaviors/Cameras/framingBehavior";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Scene } from "@babylonjs/core/scene";

export function ZoomAll(camera: ArcRotateCamera, scene: Scene) {
    camera.alpha += Math.PI;
    // Enable camera's behaviors
    camera.useFramingBehavior = true;

    const framingBehavior = camera.getBehaviorByName("Framing") as FramingBehavior;
    framingBehavior.framingTime = 0;
    framingBehavior.elevationReturnTime = -1;

    if (scene.meshes.length) {
        camera.lowerRadiusLimit = null;

        const worldExtends = scene.getWorldExtends(function (mesh) {
            return mesh.isVisible && mesh.isEnabled() && !mesh.name.startsWith("Background")
        });
        framingBehavior.zoomOnBoundingInfo(worldExtends.min, worldExtends.max);
    }

    camera.useAutoRotationBehavior = true;


    camera.pinchPrecision = 200 / camera.radius;
    camera.upperRadiusLimit = 5 * camera.radius;

    camera.wheelDeltaPercentage = 0.01;
    camera.pinchDeltaPercentage = 0.01;
}