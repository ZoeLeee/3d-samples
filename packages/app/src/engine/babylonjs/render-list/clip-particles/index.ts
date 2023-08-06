import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Scalar, Vector3 } from "@babylonjs/core/Maths";
import { Plane } from "@babylonjs/core/Maths/math.plane";
import { Mesh } from "@babylonjs/core/Meshes";
import { PointColor, PointsCloudSystem } from "@babylonjs/core/Particles/pointsCloudSystem";
import { ZoomAll } from "../../../utils";
import { InitCanvas } from "../../common/init";

export function renderClip2ParticleEffect(canvas: HTMLCanvasElement) {
    const [engine, scene, camera, gui] = InitCanvas(canvas)

    const plane = new Plane(0, 1, 0, -800);

    SceneLoader.LoadAssetContainer(
        "/models/",
        "seagulf.glb",
        scene,
        (container) => {
            container.addAllToScene();
            setTimeout(() => {
                ZoomAll(camera,scene)

                let isReady=false

                const pcs = new PointsCloudSystem("pcs", 2, scene);

                const meshes = container.meshes as Mesh[];

                const model = container.meshes[0] as Mesh;
                // meshes[0].setEnabled(false);
                // model.setEnabled(false);
        
        
                model.position.x = -100;
        
                pcs.addSurfacePoints(meshes[1] as Mesh, 50000, PointColor.Color, 0);
        
                pcs.buildMeshAsync().then(() => {
                  // pcs.mesh?.setEnabled(false);
                  pcs.setParticles();
                });
        
                meshes[1].renderingGroupId = 1;
                meshes[1].material!.clipPlane = plane;
                const mtl = meshes[1].material;
        
        
                pcs.updateParticle = function (particle) {
                  if (isReady) {
                    particle.velocity.addInPlace(new Vector3(Scalar.RandomRange(0, 2), Scalar.RandomRange(0, 2), Scalar.RandomRange(0, 2)));
                    particle.position.addInPlace(new Vector3(Scalar.RandomRange(0, 100), 2, Scalar.RandomRange(0, 100)));
        
                  }
                };

                let i=0

                scene.onAfterRenderObservable.add(()=>{
                    if (plane.d >= 800) {
                        if (model) {
                          model.setEnabled(false);
                        }
                        isReady = true;
                        if (isReady) {
                          pcs.setParticles(i, i + 20000);
                        }
                        i += 100;
              
                        if (i >= 30000) {
                          pcs.dispose();
              
                        }
                      }
                      else {
                        plane.d += 5;
                      }
                })
        

            }, 100);
        }
    );

    return () => {
        engine.dispose()
    }
}