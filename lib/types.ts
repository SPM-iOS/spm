export type PackageType = "shortcut" | "bundle";

export interface PackageDownload {
  url: string;
  sha256: string;
}

export interface BundleShortcut {
  name: string;
  description?: string;
  download: PackageDownload;
}

export interface Dependency {
  id: string;        // e.g. "keylympi.shazam-auto"
  version: string;   // exact "1.2.0" or ">= 1.0.0"
}

export interface PackageVersion {
  version: string;
  minIOS: string;
  changelog: string;
  releasedAt: string;
  dependencies: Dependency[];
  // Single shortcut
  download?: PackageDownload;
  // Bundle
  shortcuts?: BundleShortcut[];
}

export interface Package {
  id: string;            // "{author}.{name}"
  name: string;
  type: PackageType;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  license: string;
  tags: string[];
  latestVersion: string;
  versions: PackageVersion[];
  createdAt: string;
  updatedAt: string;
}

export interface RegistryMeta {
  name: string;
  url: string;
  maintainer: string;
  version: number;
  generatedAt: string;
}

export interface SearchIndex {
  [keyword: string]: string[]; // keyword -> package IDs
}

export interface RegistryIndex {
  meta: RegistryMeta;
  searchIndex: SearchIndex;
  packages: Package[];
}

// Upload payload from the portal
export interface UploadPayload {
  name: string;
  authorName: string;
  authorUrl?: string;
  description: string;
  type: PackageType;
  version: string;
  minIOS: string;
  license: string;
  tags: string[];
  changelog: string;
  dependencies: Dependency[];
  // For single shortcut: base64 encoded .shortcut file
  shortcutFile?: string;
  shortcutFileName?: string;
  // For bundle: array of {name, description, file (base64)}
  bundleFiles?: { name: string; description?: string; file: string; fileName: string }[];
}
