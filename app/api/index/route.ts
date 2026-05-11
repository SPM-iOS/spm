import { NextResponse } from "next/server";
import { getIndex } from "@/lib/github";

export const revalidate = 60; // revalidate every 60s

export async function GET() {
  try {
    const index = await getIndex();
    return NextResponse.json(index, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch registry index" }, { status: 500 });
  }
}
