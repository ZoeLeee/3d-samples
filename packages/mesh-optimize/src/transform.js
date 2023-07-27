import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import path from "path";
import { fileURLToPath } from "url";

import { simplify, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure I/O.
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
    "draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
  });

// Read from URL.
const document = await io.read(path.resolve(__dirname, "../public/Xbot.glb"));

await document.transform(
  weld({ tolerance: 0.0001 }),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.5, error: 0.001 })
);

//判断dist目录是否存在
const distPath = path.resolve(__dirname, "../dist");
if (!fs.existsSync(distPath)) {
  fs.mkdirSync(distPath);
}

await io.write(path.resolve(__dirname, "../dist/output.glb"), document);
