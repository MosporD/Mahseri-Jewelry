const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const rootFiles = [
  "index.html",
  "shop.html",
  "shop-gold.html",
  "shop-silver.html",
  "shop-gems.html",
  "product.html",
  "cart.html",
  "about.html",
  "contact.html",
  "admin.html",
  "robots.txt",
  "sitemap.xml"
];

const directories = ["css", "js"];
const assetsSource = path.join("public", "assets");

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.readdirSync(src, { withFileTypes: true }).forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirectory(srcPath, destPath);
    else if (entry.isFile()) copyFile(srcPath, destPath);
  });
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

rootFiles.forEach((file) => {
  const src = path.join(root, file);
  if (fs.existsSync(src)) copyFile(src, path.join(dist, file));
});

directories.forEach((dir) => {
  copyDirectory(path.join(root, dir), path.join(dist, dir));
});

copyDirectory(path.join(root, assetsSource), path.join(dist, "assets"));

console.log(`Built ${path.relative(root, dist)} from static site files.`);
