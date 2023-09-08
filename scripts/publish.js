const fs = require("fs");
const axios = require("axios");
const path = require("path");
const FormData = require("form-data");
const { execSync } = require("child_process");

function getFiles(path, resultFiles) {
  let files = fs.readdirSync(path);
  for (let file of files) {
    let name = path + "/" + file;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, resultFiles);
    } else resultFiles.push(name);
  }
  return resultFiles;
}

let dir = path.resolve(__dirname, "../packages/app/dist");

let files = getFiles(dir, []).filter((f) => {
  if (path.basename(f) === "log.txt") return true;
  return (
    path.extname(f) !== ".txt" &&
    path.extname(f) !== ".map" &&
    "manifest.json" !== path.basename(f)
  );
});

let formData = new FormData();

for (let f of files) {
  formData.append(f.substr(dir.length + 1), fs.createReadStream(f));
}

let url = `http://report.dodream.cn/publish-samples3d`;

axios
  .post(url, formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  })
  .then((res) => {
    console.log(res.data);
  });
