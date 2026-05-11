import { getIndex } from "@/lib/github";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function PackagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const packageId = decodeURIComponent(id);
  const index = await getIndex();
  const pkg = index.packages.find((p) => p.id === packageId);
  if (!pkg) notFound();

  const latest = pkg.versions[0];

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>
        $ spm info {pkg.id}
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{pkg.name}</h1>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 12 }}>
            {pkg.id} — by{" "}
            {pkg.author.url ? (
              <a href={pkg.author.url}>{pkg.author.name}</a>
            ) : (
              pkg.author.name
            )}
          </div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{pkg.description}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 11,
            color: pkg.type === "bundle" ? "var(--accent2)" : "var(--green)",
            border: `1px solid ${pkg.type === "bundle" ? "var(--accent2)" : "var(--green)"}`,
            borderRadius: 4,
            padding: "4px 12px",
            marginBottom: 8,
          }}>
            {pkg.type}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>iOS {latest?.minIOS}+</div>
          <div style={{ color: "var(--muted)", fontSize: 12 }}>{pkg.license}</div>
        </div>
      </div>

      {/* Install command */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "14px 20px",
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ color: "var(--green)" }}>$</span>
        <span>spm install {pkg.id}</span>
        <span style={{ marginLeft: "auto", color: "var(--muted)", fontSize: 12 }}>v{pkg.latestVersion}</span>
      </div>

      {/* Tags */}
      {pkg.tags.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 32, flexWrap: "wrap" }}>
          {pkg.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 12,
              color: "var(--accent)",
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: "3px 10px",
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Latest version files */}
      {latest && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Files — v{latest.version}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pkg.type === "shortcut" && latest.download && (
              <a href={latest.download.url} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                color: "var(--text)",
              }}>
                <span>{pkg.name}.shortcut</span>
                <span style={{ color: "var(--accent)", fontSize: 12 }}>download ↓</span>
              </a>
            )}
            {pkg.type === "bundle" && latest.shortcuts?.map((s) => (
              <a key={s.name} href={s.download.url} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                textDecoration: "none",
                color: "var(--text)",
              }}>
                <div>
                  <span>{s.name}.shortcut</span>
                  {s.description && <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{s.description}</div>}
                </div>
                <span style={{ color: "var(--accent)", fontSize: 12 }}>download ↓</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {latest?.dependencies && latest.dependencies.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Dependencies
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {latest.dependencies.map((dep) => (
              <a key={dep.id} href={`/packages/${dep.id}`} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "10px 16px",
                display: "flex",
                justifyContent: "space-between",
                color: "var(--text)",
                textDecoration: "none",
              }}>
                <span>{dep.id}</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>{dep.version}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Version history */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, color: "var(--accent2)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
          Version history
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {pkg.versions.map((v) => (
            <div key={v.version} style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "12px 16px",
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
            }}>
              <span style={{
                color: v.version === pkg.latestVersion ? "var(--green)" : "var(--muted)",
                minWidth: 60,
              }}>
                v{v.version}
              </span>
              <span style={{ color: "var(--muted)", fontSize: 13, flex: 1 }}>{v.changelog}</span>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>
                {new Date(v.releasedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ color: "var(--muted)", fontSize: 12 }}>
        <a href="/packages" style={{ color: "var(--accent)" }}>← back to packages</a>
      </div>
    </main>
  );
}
