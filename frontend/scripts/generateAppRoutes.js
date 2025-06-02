// scripts/generateAppRoutes.js
const fs = require("fs");
const path = require("path");

function walk(dir, prefix = "") {
  let results = [];
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const relPath = prefix + "/" + file;
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(walk(fullPath, relPath));
    } else if (file.endsWith(".tsx") && !file.startsWith("_")) {
      results.push(relPath.replace(/\\/g, "/").replace(/\.tsx$/, ""));
    }
  });
  return results;
}

const pages = walk(path.join(__dirname, "../frontend/app")).map((route) => ({
  name: route.split("/").pop(),
  route: route.replace(/^\/frontend\/app/, "").replace(/\/index$/, "") || "/",
}));

fs.writeFileSync(
  path.join(__dirname, "../frontend/utils/appRoutes.json"),
  JSON.stringify(pages, null, 2)
);
