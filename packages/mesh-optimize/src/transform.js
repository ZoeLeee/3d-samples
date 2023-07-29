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

export async function optimize(fileName, ratio, error = 0.001) {
  const name = fileName.split(".")[0];
  const type = fileName.split(".")[1];

  let outputFileName =
    name + `_output_${(ratio * 100).toFixed(0)}_${error}.${type}`;

  //判断文件是否存在
  let filePath = path.resolve(__dirname, "../public/" + outputFileName);

  if (fs.existsSync(filePath)) {
    return { code: 0, result: outputFileName };
  }

  filePath = path.resolve(__dirname, "../public/" + fileName);

  if (!fs.existsSync(filePath)) {
    return { code: 1, message: "文件不存在" };
  }

  // Read from URL.
  const document = await io.read(
    path.resolve(__dirname, `../public/${fileName}`)
  );

  await document.transform(
    weld({ tolerance: 0.0001 }),
    simplify({
      simplifier: MeshoptSimplifier,
      ratio: ratio,
      error,
      lockBorder: false,
    })
  );

  await io.write(
    path.resolve(__dirname, "../public/" + outputFileName),
    document
  );

  return { code: 0, result: outputFileName };
}
