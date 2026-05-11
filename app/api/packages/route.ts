import { NextRequest, NextResponse } from "next/server";
import { getIndex } from "@/lib/github";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const index = await getIndex();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const tag = searchParams.get("tag")?.toLowerCase();
    const type = searchParams.get("type"); // "shortcut" | "bundle"

    let packages = index.packages;

    if (search) {
      // Use search index for keyword lookup
      const matchedIds = new Set<string>();
      search.split(/\s+/).forEach((word) => {
        const hits = index.searchIndex[word] ?? [];
        hits.forEach((id) => matchedIds.add(id));
        // Partial match fallback
        Object.keys(index.searchIndex).forEach((key) => {
          if (key.startsWith(word)) {
            index.searchIndex[key].forEach((id) => matchedIds.add(id));
          }
        });
      });
      packages = packages.filter((p) => matchedIds.has(p.id));
    }

    if (tag) {
      packages = packages.filter((p) => p.tags.map((t) => t.toLowerCase()).includes(tag));
    }

    if (type === "shortcut" || type === "bundle") {
      packages = packages.filter((p) => p.type === type);
    }

    return NextResponse.json(
      { total: packages.length, packages },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}
