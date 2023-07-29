import Koa from "koa";
import Router from "koa-router";
import koaStatic from "koa-static";
import { koaBody } from "koa-body";
import multer from "multer";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { optimize } from "./transform.js";

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

// 设置静态资源目录为public
app.use(koaStatic(join(__dirname, "../public")));

// 配置multer中间件用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, "public/uploads/"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// 编写文件上传路由
router.post("/upload", upload.single("file"), (ctx) => {
  const file = ctx.req.file;
  if (!file) {
    ctx.status = 400;
    ctx.body = { message: "No file uploaded" };
  } else {
    ctx.body = {
      message: "File uploaded successfully",
      filename: file.filename,
    };
  }
});

// 编写优化接口路由
router.post("/optimize", koaBody(), async (ctx) => {
  const { radio, fileName, error } = ctx.request.body;

  if (radio === undefined || !fileName) {
    ctx.status = 400;
    ctx.body = { message: 'Missing "radio" parameter' };
  } else {
    const result = await optimize(fileName, radio, error);
    ctx.body = { message: "Optimization completed", ...result };
  }
});

app.use(router.routes());

// 启动服务
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
