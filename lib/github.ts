import { Octokit } from "@octokit/rest";
import type { Package, RegistryIndex, SearchIndex } from "./types";

const OWNER = "SPM-iOS";
const REPO = "spm-registry";
const INDEX_PATH = "index.json";
const PACKAGES_PATH = "packages";

function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN not set");
  return new Octokit({ auth: token });
}

export async function getIndex(): Promise<RegistryIndex> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: INDEX_PATH,
  });
  if ("content" in data) {
    const json = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(json) as RegistryIndex;
  }
  throw new Error("Could not fetch index.json");
}

export async function getIndexSha(): Promise<string> {
  const octokit = getOctokit();
  const { data } = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: INDEX_PATH,
  });
  if ("sha" in data) return data.sha;
  throw new Error("No SHA for index.json");
}

export async function writeIndex(index: RegistryIndex, sha: string): Promise<void> {
  const octokit = getOctokit();
  const content = Buffer.from(JSON.stringify(index, null, 2)).toString("base64");
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: INDEX_PATH,
    message: `chore: update index.json [${new Date().toISOString()}]`,
    content,
    sha,
  });
}

export async function uploadShortcutFile(
  packageId: string,
  version: string,
  fileName: string,
  fileBase64: string
): Promise<string> {
  const octokit = getOctokit();
  const path = `${PACKAGES_PATH}/${packageId}/${version}/${fileName}`;

  // Check if file already exists (get sha if so)
  let sha: string | undefined;
  try {
    const { data } = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path });
    if ("sha" in data) sha = data.sha;
  } catch {
    // File doesn't exist yet, that's fine
  }

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path,
    message: `feat: add ${packageId}@${version} - ${fileName}`,
    content: fileBase64,
    ...(sha ? { sha } : {}),
  });

  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${path}`;
}

export function buildSearchIndex(packages: Package[]): SearchIndex {
  const index: SearchIndex = {};

  function addKeyword(keyword: string, id: string) {
    const k = keyword.toLowerCase().trim();
    if (k.length < 2) return;
    if (!index[k]) index[k] = [];
    if (!index[k].includes(id)) index[k].push(id);
  }

  for (const pkg of packages) {
    // From name (split on spaces and camelCase)
    pkg.name.split(/[\s\-_]+/).forEach((w) => addKeyword(w, pkg.id));
    // From description words
    pkg.description.split(/\s+/).forEach((w) => addKeyword(w.replace(/[^a-zA-Z0-9]/g, ""), pkg.id));
    // From tags
    pkg.tags.forEach((t) => addKeyword(t, pkg.id));
    // Author name
    addKeyword(pkg.author.name, pkg.id);
    // Type
    addKeyword(pkg.type, pkg.id);
  }

  return index;
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
