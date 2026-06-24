import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".html": "text/html"
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const requestedPath = params.path.join("/");
  const assetRoot = path.join(process.cwd(), "assets");
  const filePath = path.normalize(path.join(assetRoot, requestedPath));

  if (!filePath.startsWith(assetRoot)) {
    return new NextResponse("Invalid asset path", { status: 400 });
  }

  try {
    const body = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new NextResponse(body, {
      headers: {
        "content-type": mimeTypes[ext] || "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable"
      }
    });
  } catch {
    return new NextResponse("Asset not found", { status: 404 });
  }
}
