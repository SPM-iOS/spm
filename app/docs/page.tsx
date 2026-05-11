"use client";

const sections = [
  {
    title: "API endpoints",
    items: [
      { method: "GET", path: "/api/index", desc: "Full registry index with search index and all packages" },
      { method: "GET", path: "/api/packages", desc: "List packages. Query: ?search=music ?tag=automation ?type=bundle" },
      { method: "GET", path: "/api/packages/:id", desc: "Single package with all versions" },
      { method: "POST", path: "/api/publish", desc: "Publish a new package or version. Requires x-spm-key header." },
      { method: "DELETE", path: "/api/packages/:id?version=1.0.0", desc: "Yank a version or entire package. Requires x-spm-key header." },
    ],
  },
  {
    title: "Custom repository spec",
    content: `Any URL that returns a valid index.json can be used as a custom repo.

The client Shortcut stores repo URLs in its config file (iCloud Drive/SPM/config.json).
When searching or installing, SPM fetches all repo indexes and merges them,
with the official registry taking precedence on ID conflicts.

Repo index.json format:`,
    code: `{
  "meta": {
    "name": "My Custom Repo",
    "url": "https://my-repo.vercel.app",
    "maintainer": "your-name",
    "version": 1,
    "generatedAt": "2026-05-01T00:00:00Z"
  },
  "searchIndex": {
    "gaming": ["author.shortcut-name"]
  },
  "packages": [ ...same format as official registry... ]
}`,
  },
  {
    title: "Package ID format",
    content: `Package IDs follow the pattern:  {author}.{name}

Examples:
  keylympi.shazam-auto
  john.morning-stack
  acme.productivity-bundle

Both author and name are slugified (lowercase, hyphens). IDs are unique
across the official registry. Custom repos may use the same IDs as the
official registry only if they are the original author republishing.`,
  },
  {
    title: "Version constraints",
    content: `SPM supports two version constraint formats:

  Exact:     "1.2.0"       — install exactly this version
  Minimum:   ">= 1.0.0"   — install this version or higher

When resolving dependencies, SPM picks the highest installed version that
satisfies all constraints. If a dep is not installed, SPM installs the
latest version that satisfies ">= x.x.x".`,
  },
  {
    title: "Publish via API",
    code: `// Single shortcut
fetch("https://shortcutspackagemanager.vercel.app/api/publish", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-spm-key": "YOUR_KEY"
  },
  body: JSON.stringify({
    name: "Shazam Auto",
    authorName: "KeyLymPi",
    authorUrl: "https://keylympi.dev",
    description: "Auto-Shazams and saves to playlist.",
    type: "shortcut",
    version: "1.0.0",
    minIOS: "16.0",
    license: "MIT",
    tags: ["music", "automation"],
    changelog: "Initial release.",
    dependencies: [],
    shortcutFile: "<base64 encoded .shortcut file>",
    shortcutFileName: "shazam-auto.shortcut"
  })
})`,
  },
];

export default function DocsPage() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>$ spm docs</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        <span style={{ color: "var(--accent)" }}>Documentation</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 48 }}>
        API reference, custom repo spec, and publish guide.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {sections.map((section) => (
          <div key={section.title}>
            <div style={{
              fontSize: 11,
              color: "var(--accent2)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}>
              {section.title}
            </div>

            {"items" in section && section.items && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {section.items.map((item) => (
                  <div key={item.path} style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "12px 16px",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}>
                    <span style={{
                      color: item.method === "GET" ? "var(--green)" : item.method === "POST" ? "var(--accent)" : "#f87171",
                      minWidth: 52,
                      fontSize: 12,
                    }}>
                      {item.method}
                    </span>
                    <span style={{ color: "var(--text)", flex: 1 }}>{item.path}</span>
                    <span style={{ color: "var(--muted)", fontSize: 13 }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            )}

            {"content" in section && section.content && (
              <pre style={{
                color: "var(--muted)",
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                marginBottom: section.code ? 16 : 0,
              }}>
                {section.content}
              </pre>
            )}

            {"code" in section && section.code && (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "16px 20px",
                overflowX: "auto",
              }}>
                <pre style={{ color: "var(--text)", fontSize: 13, lineHeight: 1.7 }}>
                  {section.code}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, color: "var(--muted)", fontSize: 12 }}>
        <a href="/" style={{ color: "var(--accent)" }}>← back to home</a>
      </div>
    </main>
  );
}
