"use client";
import { useState } from "react";
import type { PackageType, Dependency } from "@/lib/types";

type BundleFile = { name: string; description: string; file: File | null };

export default function PublishPage() {
  const [step, setStep] = useState<"form" | "submitting" | "done" | "error">("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [resultId, setResultId] = useState("");

  // Form state
  const [type, setType] = useState<PackageType>("shortcut");
  const [name, setName] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");
  const [description, setDescription] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [minIOS, setMinIOS] = useState("16.0");
  const [license, setLicense] = useState("MIT");
  const [tags, setTags] = useState("");
  const [changelog, setChangelog] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [deps, setDeps] = useState<Dependency[]>([]);
  const [newDepId, setNewDepId] = useState("");
  const [newDepVer, setNewDepVer] = useState(">= 1.0.0");

  // Single shortcut
  const [shortcutFile, setShortcutFile] = useState<File | null>(null);
  // Bundle
  const [bundleFiles, setBundleFiles] = useState<BundleFile[]>([
    { name: "", description: "", file: null },
    { name: "", description: "", file: null },
  ]);

  const toBase64 = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res((reader.result as string).split(",")[1]);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

  const addDep = () => {
    if (newDepId.trim()) {
      setDeps([...deps, { id: newDepId.trim(), version: newDepVer.trim() || ">= 1.0.0" }]);
      setNewDepId("");
      setNewDepVer(">= 1.0.0");
    }
  };

  const submit = async () => {
    setStep("submitting");
    try {
      let body: Record<string, unknown> = {
        name, authorName, authorUrl, description,
        type, version, minIOS, license, changelog,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        dependencies: deps,
      };

      if (type === "shortcut") {
        if (!shortcutFile) throw new Error("Please select a .shortcut file");
        body.shortcutFile = await toBase64(shortcutFile);
        body.shortcutFileName = shortcutFile.name;
      } else {
        for (const bf of bundleFiles) {
          if (!bf.name || !bf.file) throw new Error("All bundle files need a name and file");
        }
        body.bundleFiles = await Promise.all(
          bundleFiles.map(async (bf) => ({
            name: bf.name,
            description: bf.description,
            file: await toBase64(bf.file!),
            fileName: bf.file!.name,
          }))
        );
      }

      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-spm-key": apiKey },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setResultId(data.packageId);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "10px 14px",
    color: "var(--text)",
    fontFamily: "inherit",
    fontSize: 14,
    outline: "none",
    width: "100%",
  };

  const labelStyle = {
    fontSize: 11,
    color: "var(--muted)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: 6,
    display: "block",
  };

  if (step === "done") return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>✓</div>
      <h2 style={{ color: "var(--green)", marginBottom: 8 }}>Published!</h2>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>
        <code style={{ color: "var(--text)" }}>{resultId}</code> is now live in the registry.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <a href={`/packages/${resultId}`} style={{ color: "var(--accent)" }}>view package →</a>
        <a href="/publish" style={{ color: "var(--muted)" }} onClick={() => setStep("form")}>publish another</a>
      </div>
    </main>
  );

  if (step === "error") return (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 16 }}>✗</div>
      <h2 style={{ color: "#f87171", marginBottom: 8 }}>Publish failed</h2>
      <p style={{ color: "var(--muted)", marginBottom: 24 }}>{errorMsg}</p>
      <button onClick={() => setStep("form")} style={{ ...inputStyle, width: "auto", cursor: "pointer", color: "var(--accent)" }}>
        try again
      </button>
    </main>
  );

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>$ spm publish</div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        <span style={{ color: "var(--accent)" }}>Publish a package</span>
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: 40 }}>
        Upload your Shortcut or bundle to the SPM registry.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Type */}
        <div>
          <span style={labelStyle}>Package type</span>
          <div style={{ display: "flex", gap: 10 }}>
            {(["shortcut", "bundle"] as PackageType[]).map((t) => (
              <button key={t} onClick={() => setType(t)} style={{
                ...inputStyle, width: "auto", cursor: "pointer",
                background: type === t ? "var(--accent)" : "var(--surface)",
                color: type === t ? "#000" : "var(--muted)",
                border: `1px solid ${type === t ? "var(--accent)" : "var(--border)"}`,
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Name + author */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <span style={labelStyle}>Package name *</span>
            <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="Shazam Auto" />
          </div>
          <div>
            <span style={labelStyle}>Author name *</span>
            <input style={inputStyle} value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="KeyLymPi" />
          </div>
        </div>

        <div>
          <span style={labelStyle}>Author URL</span>
          <input style={inputStyle} value={authorUrl} onChange={(e) => setAuthorUrl(e.target.value)} placeholder="https://keylympi.dev" />
        </div>

        <div>
          <span style={labelStyle}>Description *</span>
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
            value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your shortcut do?" />
        </div>

        {/* Version + iOS + license */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div>
            <span style={labelStyle}>Version *</span>
            <input style={inputStyle} value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
          </div>
          <div>
            <span style={labelStyle}>Min iOS *</span>
            <input style={inputStyle} value={minIOS} onChange={(e) => setMinIOS(e.target.value)} placeholder="16.0" />
          </div>
          <div>
            <span style={labelStyle}>License *</span>
            <input style={inputStyle} value={license} onChange={(e) => setLicense(e.target.value)} placeholder="MIT" />
          </div>
        </div>

        <div>
          <span style={labelStyle}>Tags (comma-separated)</span>
          <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="music, automation, productivity" />
        </div>

        <div>
          <span style={labelStyle}>Changelog</span>
          <input style={inputStyle} value={changelog} onChange={(e) => setChangelog(e.target.value)} placeholder="Initial release." />
        </div>

        {/* File upload */}
        {type === "shortcut" ? (
          <div>
            <span style={labelStyle}>.shortcut file *</span>
            <input type="file" accept=".shortcut"
              onChange={(e) => setShortcutFile(e.target.files?.[0] ?? null)}
              style={{ ...inputStyle, cursor: "pointer" }} />
          </div>
        ) : (
          <div>
            <span style={labelStyle}>Bundle shortcuts (min 2)</span>
            {bundleFiles.map((bf, i) => (
              <div key={i} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6, padding: 16, marginBottom: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input style={inputStyle} placeholder="Shortcut name" value={bf.name}
                    onChange={(e) => { const c = [...bundleFiles]; c[i].name = e.target.value; setBundleFiles(c); }} />
                  <input style={inputStyle} placeholder="Description (optional)" value={bf.description}
                    onChange={(e) => { const c = [...bundleFiles]; c[i].description = e.target.value; setBundleFiles(c); }} />
                </div>
                <input type="file" accept=".shortcut"
                  onChange={(e) => { const c = [...bundleFiles]; c[i].file = e.target.files?.[0] ?? null; setBundleFiles(c); }}
                  style={{ ...inputStyle, cursor: "pointer" }} />
              </div>
            ))}
            <button onClick={() => setBundleFiles([...bundleFiles, { name: "", description: "", file: null }])}
              style={{ ...inputStyle, width: "auto", cursor: "pointer", color: "var(--accent)" }}>
              + add shortcut
            </button>
          </div>
        )}

        {/* Dependencies */}
        <div>
          <span style={labelStyle}>Dependencies</span>
          {deps.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
              <span style={{ flex: 1, color: "var(--text)" }}>{d.id}</span>
              <span style={{ color: "var(--muted)" }}>{d.version}</span>
              <button onClick={() => setDeps(deps.filter((_, j) => j !== i))}
                style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontFamily: "inherit" }}>
                ×
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...inputStyle, flex: 2 }} placeholder="keylympi.base-utils" value={newDepId}
              onChange={(e) => setNewDepId(e.target.value)} />
            <input style={{ ...inputStyle, flex: 1 }} placeholder=">= 1.0.0" value={newDepVer}
              onChange={(e) => setNewDepVer(e.target.value)} />
            <button onClick={addDep}
              style={{ ...inputStyle, width: "auto", cursor: "pointer", color: "var(--accent)" }}>
              add
            </button>
          </div>
        </div>

        {/* API key */}
        <div>
          <span style={labelStyle}>SPM publish key *</span>
          <input type="password" style={inputStyle} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-..." />
          <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
            Contact the SPM maintainer to get a publish key.
          </div>
        </div>

        <button
          onClick={submit}
          disabled={step === "submitting"}
          style={{
            ...inputStyle,
            background: "var(--accent)",
            color: "#000",
            fontWeight: 600,
            cursor: step === "submitting" ? "wait" : "pointer",
            width: "auto",
            opacity: step === "submitting" ? 0.7 : 1,
          }}
        >
          {step === "submitting" ? "publishing..." : "publish package →"}
        </button>
      </div>

      <div style={{ marginTop: 40, color: "var(--muted)", fontSize: 12 }}>
        <a href="/docs" style={{ color: "var(--accent)" }}>read the publish docs</a>
        <span style={{ margin: "0 12px", color: "var(--border)" }}>|</span>
        <a href="/" style={{ color: "var(--accent)" }}>← home</a>
      </div>
    </main>
  );
}
