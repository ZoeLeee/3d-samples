import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import draco3d from "draco3dgltf";
import path from "path";
import { fileURLToPath } from "url";

import { simplify, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import fs from "fs";
import { PropertyType } from "@gltf-transform/core";
import { join, flatten, dedup } from "@gltf-transform/functions";

import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure I/O.
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.decoder": await draco3d.createDecoderModule(), // Optional.
    "draco3d.encoder": await draco3d.createEncoderModule(), // Optional.
  });

export const demos = ["Xbot.glb", "LittlestTokyo.glb"];

export async function optimize(fileName, options) {
  const { ratio, error = 0.001, compress, maxSize, quality } = options;

  const name = fileName.split(".")[0];

  let outputFileName =
    name +
    `_output_${(ratio * 100).toFixed(0)}_${error}_${compress ? 1 : 0}.glb`;

  let d = "../public/";

  if (!demos.includes(fileName)) {
    if (fileName.includes("DamagedHelmet")) {
      d += "DamagedHelmet/";
    } else {
      d += "upload/";
    }
  }

  //判断文件是否存在
  let filePath = path.resolve(__dirname, d + outputFileName);

  // if (fs.existsSync(filePath)) {
  //   return { code: 0, result: outputFileName };
  // }

  filePath = path.resolve(__dirname, d + fileName);

  if (!fs.existsSync(filePath)) {
    return { code: 1, message: "文件不存在" };
  }

  // Read from URL.
  const document = await io.read(path.resolve(__dirname, d + `${fileName}`));

  await document.transform(
    weld({ tolerance: 0.0001 }),
    simplify({
      simplifier: MeshoptSimplifier,
      ratio: ratio,
      error,
      lockBorder: false,
    })
  );

  if (compress) {
    await document.transform(
      textureCompress({
        encoder: sharp,
        resize: [maxSize, maxSize],
        quality: quality * 100,
      })
    );
  }

  await io.write(path.resolve(__dirname, d + outputFileName), document);

  return { code: 0, result: outputFileName };
}

export function clearFiles() {
  //清理目录中的文件
  const files = fs.readdirSync(path.resolve(__dirname, "../public/"));
  const files2 = fs.readdirSync(
    path.resolve(__dirname, "../public/DamagedHelmet")
  );
  files.forEach((file) => {
    if (file.indexOf("output") > -1) {
      fs.unlinkSync(path.resolve(__dirname, "../public/" + file));
    }
  });
  files2.forEach((file) => {
    if (file.indexOf("output") > -1) {
      fs.unlinkSync(path.resolve(__dirname, "../public/DamagedHelmet/" + file));
    }
  });
}

export async function optimizeGLTF(url, options = {}) {
  const {
    ratio = 0.5,
    error = 0.001,
    out = path.join(__dirname, "../public/upload/output.glb"),
    compress,
    maxSize,
    quality,
  } = options;

  const document = await io.read(url);

  await document.transform(
    weld({ tolerance: 0.0001 }),
    simplify({
      simplifier: MeshoptSimplifier,
      ratio: ratio,
      error,
      lockBorder: false,
    })
  );

  await io.write(out, document);

  return out;
}
