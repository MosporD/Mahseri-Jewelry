const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createClient } = require("@supabase/supabase-js");

const root = path.resolve(__dirname, "..");
const dataFile = path.join(root, "js", "data.js");
const productsDir = path.join(root, "public", "assets", "Products");

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

function loadProducts() {
  const source = fs.readFileSync(dataFile, "utf8") + "\nthis.__products = MAHSERI_PRODUCTS;";
  const context = {
    localStorage: {
      getItem: () => null
    },
    console
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: dataFile });
  return context.__products || [];
}

function productImageFile(product) {
  if (!product.image || /^https?:\/\//i.test(product.image)) return null;
  const relative = product.image.replace(/^\/?assets\/Products\//i, "");
  const fullPath = path.join(productsDir, relative);
  return fs.existsSync(fullPath) ? fullPath : null;
}

function storagePath(filePath) {
  return path.relative(productsDir, filePath).split(path.sep).join("/");
}

function productRow(product, publicUrl, sortOrder) {
  return {
    id: product.id,
    sku: product.sku || product.id,
    name: product.name,
    name_ar: product.name_ar || null,
    collection: product.collection || "gold",
    category: product.category,
    material: product.material,
    gender: product.gender || "Both",
    price: Number(product.price) || 1,
    weight: product.weight || "",
    making_fee: Number(product.making_fee != null ? product.making_fee : product.makingFee) || 0,
    badge: product.badge || null,
    art: product.art || null,
    image: publicUrl || product.image || null,
    description: product.description || null,
    description_ar: product.description_ar || null,
    in_stock: product.in_stock != null ? Boolean(product.in_stock) : product.inStock !== false,
    sort_order: sortOrder
  };
}

async function uploadImage(supabase, bucket, product) {
  const file = productImageFile(product);
  if (!file) return product.image || null;

  const ext = path.extname(file).toLowerCase();
  const objectPath = storagePath(file);
  const { error } = await supabase.storage.from(bucket).upload(objectPath, fs.readFileSync(file), {
    contentType: imageTypes[ext] || "application/octet-stream",
    upsert: true
  });
  if (error) throw new Error(`Failed to upload ${objectPath}: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function main() {
  loadEnvFile(path.join(root, ".env.local"));
  loadEnvFile(path.join(root, ".env"));

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_PRODUCTS_BUCKET || "product-images";
  const table = process.env.SUPABASE_PRODUCTS_TABLE || "products";
  const dryRun = process.argv.includes("--dry-run");

  const products = loadProducts();
  if (!products.length) {
    console.log("No products found in js/data.js.");
    return;
  }

  console.log(`${dryRun ? "Would import" : "Importing"} ${products.length} product(s).`);
  if (dryRun) {
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.sku || product.id} ${product.name}`);
    });
    return;
  }

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });

  const rows = [];
  for (const [index, product] of products.entries()) {
    const publicUrl = await uploadImage(supabase, bucket, product);
    rows.push(productRow(product, publicUrl, index + 1));
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw error;

  console.log(`Done. Imported ${rows.length} product(s) into "${table}".`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
