import { readFileSync } from "node:fs";
import path from "node:path";
import { fetch as nodeFetch } from "undici";
import { describe, expect, it } from "vitest";

// vp test はリポジトリルートから実行される前提（リポ CLAUDE.md）。
// import.meta.url は Vite+ の transform 下で使えないため process.cwd() 基準。
const PKG = path.resolve(process.cwd(), "packages/design-tokens-elchika");
const REGISTRY_URL = "https://ui.elchika.dev/r/button.json";

// 配布パス → ローカルパス
const FILE_MAP: Record<string, string> = {
  "src/styles/global.css": "tokens.css",
  "src/styles/design-system/tokens.css": "design-system/tokens.css",
  "src/styles/design-system/brands.css": "design-system/brands.css",
};

// 意図的な局所編集(upstream の Google Fonts CDN import を削除し、共有配信 /fonts/fonts.css を
// index.html の <link> で読む方式へ変更)だけを比較から除外する
const isFontImport = (line: string): boolean => line.includes("fonts.googleapis.com");

const normalize = (body: string): string =>
  body
    .split("\n")
    .filter((line) => !isFontImport(line))
    .join("\n");

describe("upstream drift", () => {
  it("ローカル3ファイルは upstream 配布物とフォント import 行以外一致する", async () => {
    let res: Awaited<ReturnType<typeof nodeFetch>>;
    try {
      res = await nodeFetch(REGISTRY_URL);
    } catch {
      console.warn("SKIP: ui.elchika.dev に到達できないため upstream drift 検査をスキップ");
      return;
    }
    expect(res.ok, `registry が HTTP ${res.status} を返した`).toBe(true);
    const registry = (await res.json()) as {
      files: Array<{ path: string; content: string }>;
    };
    for (const [remotePath, localPath] of Object.entries(FILE_MAP)) {
      const remote = registry.files.find((f) => f.path === remotePath);
      expect(remote, `${remotePath} が配布物に存在すること`).toBeDefined();
      const local = readFileSync(path.resolve(PKG, localPath), "utf8");
      expect(normalize(local), `${localPath} が upstream と乖離`).toBe(
        normalize(remote?.content ?? ""),
      );
    }
  }, 30_000);
});
