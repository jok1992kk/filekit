/**
 * Carries the files picked on the dashboard over to the editor.
 *
 * A `File` cannot survive sessionStorage or a query string, but it does
 * survive a client-side `router.push` — that is the same JavaScript runtime,
 * so a module-level holder is enough. A hard reload clears it, and the editor
 * falls back to its own dropzone, which is the correct behaviour: those files
 * are genuinely gone at that point.
 */

type Staged = { files: File[]; marketplaceId: string };

let staged: Staged | null = null;

export function stageFiles(files: File[], marketplaceId: string): void {
  staged = { files, marketplaceId };
}

/** Reads and clears in one go, so a back-navigation cannot re-add the files. */
export function takeStagedFiles(): Staged | null {
  const value = staged;
  staged = null;
  return value;
}
