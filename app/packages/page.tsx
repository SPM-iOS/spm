"use client";
import { useState, useEffect, useCallback } from "react";
import type { Package } from "@/lib/types";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "shortcut" | "bundle">("all");
  const [loading, setLoading] = useState(true);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (type !== "all") params.set("type", type);
    const res = await fetch(`/api/packages?${params}`);
    const data = await res.json();
    setPackages(data.packages ?? []);
    setLoading(false);
  }, [search, type]);

  useEffect(() => {
    const t = setTimeout(fetchPackages, 250);
    return () => clearTimeout(t);
  }, [fetchPackages]);

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>$ spm search</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        <span style={{ color: "var(--accent)" }}>Packages</span>
      </h1>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        <input
          type="text"
          placeholder="search packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "10px 14px",
            color: "var(--text)",
            fontFamily: "inherit",
            fontSize: 14,
            outline: "none",
          }}
        />
        {(["all", "shortcut", "bundle"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              background: type === t ? "var(--accent)" : "var(--surface)",
              border: `1px solid ${type === t ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 6,
              padding: "10px 16px",
              color: type === t ? "#000" : "var(--muted)",
              fontFamily: "inherit",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div style={{ color: "var(--muted)" }}>fetching...</div>
      ) : packages.length === 0 ? (
        <div style={{ color: "var(--muted)" }}>no packages found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {packages.map((pkg) => (
            <a key={pkg.id} href={`/packages/${encodeURIComponent(pkg.id)}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                padding: "16px 20px",
                transition: "border-color 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>{pkg.name}</span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{pkg.id}</span>
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: pkg.type === "bundle" ? "var(--accent2)" : "var(--green)",
                    border: `1px solid ${pkg.type === "bundle" ? "var(--accent2)" : "var(--green)"}`,
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}>
                    {pkg.type}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>v{pkg.latestVersion}</span>
                </div>
                <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>{pkg.description}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {pkg.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      background: "var(--surface2)",
                      borderRadius: 4,
                      padding: "2px 8px",
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      <div style={{ marginTop: 48, color: "var(--muted)", fontSize: 12 }}>
        <a href="/" style={{ color: "var(--accent)" }}>← back to home</a>
        <span style={{ margin: "0 12px", color: "var(--border)" }}>|</span>
        <a href="/publish" style={{ color: "var(--accent)" }}>publish a package →</a>
      </div>
    </main>
  );
}
