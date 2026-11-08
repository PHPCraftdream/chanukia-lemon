// SPDX-License-Identifier: GPL-3.0-only
// Chanukia Lemon by PHPCraftdream — https://github.com/PHPCraftdream/chanukia-lemon
/** Types for the part of `@ktav-lang/polydoc` used by src/tools/docs.ts (the package ships none). */
declare module '@ktav-lang/polydoc' {
  export interface PolydocConfig {
    langs: string[];
    rootDocuments?: string[];
  }
  /** Generated root documents: document -> language -> file contents. */
  export type RootDocs = Map<string, Map<string, Buffer>>;
  export interface SourceUnit {
    unit: string;
    parts: Array<Record<string, string>>;
  }

  export function configure(config: PolydocConfig): void;
  export function buildRootDocs(repoRoot: string, options?: { rootMarker?: string }): RootDocs;
  export function writeRootDocs(repoRoot: string, docs: RootDocs): void;
  /** Human-readable divergences between generated and on-disk documents; empty if identical. */
  export function checkRootDocs(repoRoot: string, docs: RootDocs): string[];
  export function readUnits(contentDir: string): SourceUnit[];
  export function checkSources(units: SourceUnit[]): { problems: string[]; notes: string[] };
  export function rootDocUnitsDir(repoRoot: string, doc: string): string;
}
