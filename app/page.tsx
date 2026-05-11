"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ color: "var(--muted)", marginBottom: 8, fontSize: 12 }}>
          $ spm --version
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 12 }}>
          <span style={{ color: "var(--accent)" }}>SPM</span>
          <span style={{ color: "var(--muted)", fontWeight: 400, fontSize: 20 }}> — Shortcuts Package Manager</span>
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 520, lineHeight: 1.7 }}>
          Install, update, and publish iOS Shortcuts with dependency management.
          Works with custom repositories. Free and open source.
        </p>
      </div>

      {/* Quick install */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "20px 24px",
        marginBottom: 48,
      }}>
        <div style={{ color: "var(--muted)", fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Get started
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "# Add the SPM shortcut to iOS",
            "SPM > Add > Search > keylympi.icongetter",
            "SPM > Manage > Update > All",
            "SPM > Add > Search > music",
          ].map((cmd, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: i === 0 ? "var(--muted)" : "var(--green)", userSelect: "none" }}>
                {i === 0 ? "#" : "$"}
              </span>
              <span style={{ color: i === 0 ? "var(--muted)" : "var(--text)" }}>{cmd.replace(/^[#$] /, "")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 48 }}>
        {[
          { href: "/packages", label: "Browse packages", desc: "Search the registry", badge: "registry", color: "var(--accent)" },
          { href: "/publish", label: "Publish", desc: "Submit your shortcut", badge: "upload", color: "var(--green)" },
          { href: "/docs", label: "Docs", desc: "API & repo spec", badge: "docs", color: "var(--accent2)" },
          { href: "/api/index", label: "index.json", desc: "Raw registry feed", badge: "api", color: "var(--amber)" },
        ].map(({ href, label, desc, badge, color }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "18px 20px",
              transition: "border-color 0.15s",
              cursor: "pointer",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = color)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ fontSize: 11, color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                {badge}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ color: "var(--muted)", fontSize: 12, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
        <span>SPM is open source — </span>
        <a href="https://github.com/spm-ios/spm-registry" style={{ color: "var(--accent)" }}>
          shortcutspackageman/registry
        </a>
        <span style={{ margin: "0 12px", color: "var(--border)" }}>|</span>
        <span>API: </span>
        <a href="/api/packages" style={{ color: "var(--accent)" }}>/api/packages</a>
      </div>
    </main>
  );
}
