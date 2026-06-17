const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");
const productsDir = path.join(root, "assets", "Products");

const imageTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif"
};

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  fs.readFileSync(filePath, "utf8").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eq = trimmed.indexOf("=");
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] == null) process.env[key] = value;
  });
}

function walkImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkImages(full);
    if (!entry.isFile()) return [];
    const ext = path.extname(entry.name).toLowerCase();
    return imageTypes[ext] ? [full] : [];
  });
}

function storagePath(filePath) {
  return path.relative(productsDir, filePath).split(path.sep).join("/");
}

async function main() {
  loadEnvFile(path.join(root, ".env"));

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PRODUCTS_BUCKET || "product-images";
  const dryRun = process.argv.includes("--dry-run");
  const noUpsert = process.argv.includes("--no-upsert");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env and fill them in."
    );
  }

  const files = walkImages(productsDir);
  if (!files.length) {
    console.log(`No product images found in ${path.relative(root, productsDir)}.`);
    return;
  }

  console.log(`${dryRun ? "Would upload" : "Uploading"} ${files.length} image(s) to bucket "${bucket}"...`);

  if (dryRun) {
    files.forEach((file) => console.log(`- ${storagePath(file)}`));
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  let uploaded = 0;
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const objectPath = storagePath(file);
    const body = fs.readFileSync(file);
    const { error } = await supabase.storage.from(bucket).upload(objectPath, body, {
      contentType: imageTypes[ext],
      upsert: !noUpsert
    });

    if (error) {
      throw new Error(`Failed to upload ${objectPath}: ${error.message}`);
    }

    uploaded += 1;
    console.log(`Uploaded ${uploaded}/${files.length}: ${objectPath}`);
  }

  console.log(`Done. Uploaded ${uploaded} image(s) to "${bucket}".`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
