import Koa from "koa";
import Router from "koa-router";
import koaStatic from "koa-static";
import { koaBody } from "koa-body";

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { clearFiles, optimize, optimizeGLTF } from "./transform.js";
import path from "path";
import fs from "fs";
import { convertSTEPorIGES } from "./convert.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = new Koa();
const router = new Router();

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Content-Length, Authorization, Accept, X-Requested-With"
  );
  ctx.set("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, OPTIONS");
  if (ctx.method == "OPTIONS") {
    ctx.body = 200;
  } else {
    await next();
  }
});

app.use(async (ctx, next) => {
  if (ctx.request.url === "/upload") {
    const dir = path.resolve(__dirname, `../public/upload`);
    // 检查文件夹是否存在如果不存在则新建文件夹
    if (!fs.existsSync(dir)) {
      //新建文件夹
      fs.mkdirSync(dir);
    } else {
      //清理目录中的文件
      // const files = fs.readdirSync(dir);
      // files.forEach((file) => {
      //   fs.unlinkSync(path.resolve(dir, file));
      // });
    }
  }
  await next();
});

app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.resolve(__dirname, "../public/upload/"), // 设置文件上传目录
      keepExtensions: true, // 保持文件的后缀
      maxFieldsSize: 20 * 1024 * 1024, // 文件上传大小限制
      filename: (name, ext) => {
        return `${name}${ext}`;
      },
      onError: (error) => {
        app.status = 400;
        log4js.error(error);
        // 这里可以定义自己的返回内容
        app.body = { code: 400, msg: "上传失败", data: {} };
        return;
      },
    },
  })
);

// 设置静态资源目录为public
app.use(
  koaStatic(join(__dirname, "../public"), {
    maxAge: 1,
  })
);

// 编写文件上传路由
router.post("/upload", (ctx) => {
  try {
    // 获取上传文件
    const files = ctx.request.files;

    let path;

    for (const key in files) {
      const file = files[key];
      const name = file.newFilename;
      if (name.endsWith("glb") || name.endsWith("gltf")) {
        path = name;
        break;
      }
    }
    ctx.body = { code: 0, msg: "", data: { url: `/upload/${path}` } };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { code: 400, msg: "上传失败", data: {} };
  }
});

router.post("/model-viewer", async (ctx) => {
  try {
    // 获取上传文件
    const files = ctx.request.files;

    let path;
    let writePath;

    for (const key in files) {
      const file = files[key];
      const name = file.newFilename;
      if (name.endsWith("glb") || name.endsWith("gltf")) {
        path = name;
        break;
      } else if (name.endsWith(".STEP")) {
        // 处理Step
        [path, writePath] = await convertSTEPorIGES({
          filename: name,
          path: file.filepath,
        });

        await optimizeGLTF(writePath, {
          out: writePath,
        });

        break;
      }
    }

    ctx.body = { code: 0, msg: "", data: { url: `/upload/${path}` } };
  } catch (error) {
    ctx.status = 400;
    ctx.body = { code: 400, msg: "上传失败", data: {} };
  }
});

// 编写优化接口路由
router.post("/optimize", async (ctx) => {
  const { ratio, fileName, error, compress } = ctx.request.body;

  if (ratio === undefined || !fileName) {
    ctx.status = 400;
    ctx.body = { message: 'Missing "radio" parameter' };
  } else {
    const result = await optimize(fileName, ctx.request.body);
    ctx.body = { message: "Optimization completed", ...result };
  }
});

router.post("/clear", (ctx) => {
  clearFiles();
  ctx.body = { message: "Clear completed" };
});

app.use(router.routes());

// 启动服务
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
