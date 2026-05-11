import { NextRequest, NextResponse } from "next/server";
import { getIndex, getIndexSha, writeIndex, buildSearchIndex } from "@/lib/github";

function isAuthorized(req: NextRequest): boolean {
  return req.headers.get("x-spm-key") === process.env.SPM_PUBLISH_KEY;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const packageId = decodeURIComponent(id);
  const version = new URL(req.url).searchParams.get("version");

  try {
    const [index, sha] = await Promise.all([getIndex(), getIndexSha()]);
    const pkgIdx = index.packages.findIndex((p) => p.id === packageId);

    if (pkgIdx === -1) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (version) {
      // Yank specific version
      const pkg = index.packages[pkgIdx];
      pkg.versions = pkg.versions.filter((v) => v.version !== version);
      if (pkg.versions.length === 0) {
        index.packages.splice(pkgIdx, 1);
      } else {
        pkg.latestVersion = pkg.versions[0].version;
        pkg.updatedAt = new Date().toISOString();
      }
    } else {
      // Remove entire package
      index.packages.splice(pkgIdx, 1);
    }

    index.searchIndex = buildSearchIndex(index.packages);
    index.meta.generatedAt = new Date().toISOString();

    await writeIndex(index, sha);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
