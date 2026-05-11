import { NextRequest, NextResponse } from "next/server";
import {
  getIndex,
  getIndexSha,
  writeIndex,
  uploadShortcutFile,
  buildSearchIndex,
  slugify,
} from "@/lib/github";
import type { Package, PackageVersion, UploadPayload } from "@/lib/types";

// Simple API key auth — set SPM_PUBLISH_KEY in Vercel env vars
function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-spm-key");
  return key === process.env.SPM_PUBLISH_KEY;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: UploadPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Basic validation
  const required = ["name", "authorName", "description", "type", "version", "minIOS", "license"];
  for (const field of required) {
    if (!payload[field as keyof UploadPayload]) {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }
  if (payload.type === "shortcut" && !payload.shortcutFile) {
    return NextResponse.json({ error: "shortcutFile required for type=shortcut" }, { status: 400 });
  }
  if (payload.type === "bundle" && (!payload.bundleFiles || payload.bundleFiles.length < 2)) {
    return NextResponse.json({ error: "bundleFiles (>=2) required for type=bundle" }, { status: 400 });
  }

  const packageId = `${slugify(payload.authorName)}.${slugify(payload.name)}`;
  const now = new Date().toISOString();

  try {
    const [index, sha] = await Promise.all([getIndex(), getIndexSha()]);
    const existingIdx = index.packages.findIndex((p) => p.id === packageId);

    // Check version not already published
    if (existingIdx >= 0) {
      const existing = index.packages[existingIdx];
      if (existing.versions.some((v) => v.version === payload.version)) {
        return NextResponse.json(
          { error: `Version ${payload.version} already exists for ${packageId}` },
          { status: 409 }
        );
      }
    }

    // Upload files to GitHub
    let newVersion: PackageVersion;

    if (payload.type === "shortcut") {
      const fileName = payload.shortcutFileName ?? `${slugify(payload.name)}.shortcut`;
      const url = await uploadShortcutFile(packageId, payload.version, fileName, payload.shortcutFile!);
      newVersion = {
        version: payload.version,
        minIOS: payload.minIOS,
        changelog: payload.changelog ?? "",
        releasedAt: now,
        dependencies: payload.dependencies ?? [],
        download: { url, sha256: "" }, // sha256 populated client-side or via future pipeline
      };
    } else {
      const shortcuts = [];
      for (const bf of payload.bundleFiles!) {
        const url = await uploadShortcutFile(packageId, payload.version, bf.fileName, bf.file);
        shortcuts.push({ name: bf.name, description: bf.description, download: { url, sha256: "" } });
      }
      newVersion = {
        version: payload.version,
        minIOS: payload.minIOS,
        changelog: payload.changelog ?? "",
        releasedAt: now,
        dependencies: payload.dependencies ?? [],
        shortcuts,
      };
    }

    // Update or create package entry
    if (existingIdx >= 0) {
      const pkg = index.packages[existingIdx];
      pkg.versions.unshift(newVersion);
      pkg.latestVersion = payload.version;
      pkg.updatedAt = now;
      // Update mutable fields
      pkg.description = payload.description;
      pkg.tags = payload.tags ?? pkg.tags;
    } else {
      const newPkg: Package = {
        id: packageId,
        name: payload.name,
        type: payload.type,
        description: payload.description,
        author: { name: payload.authorName, url: payload.authorUrl },
        license: payload.license,
        tags: payload.tags ?? [],
        latestVersion: payload.version,
        versions: [newVersion],
        createdAt: now,
        updatedAt: now,
      };
      index.packages.unshift(newPkg);
    }

    // Rebuild search index
    index.searchIndex = buildSearchIndex(index.packages);
    index.meta.generatedAt = now;

    await writeIndex(index, sha);

    return NextResponse.json({ success: true, packageId, version: payload.version }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to publish package" }, { status: 500 });
  }
}
