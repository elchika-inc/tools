import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve(process.cwd(), "scripts/fix-font-link.js");
const tempDirs = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

describe("fix-font-link", () => {
  it("ビルド後の相対フォント参照を共有配信の絶対パスへ戻す", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fix-font-link-"));
    tempDirs.push(dir);
    writeFileSync(
      path.join(dir, "index.html"),
      '<link rel="stylesheet" href="./fonts/fonts.css" />',
    );

    const result = spawnSync(process.execPath, [SCRIPT, dir], { encoding: "utf8" });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 件");
    expect(readFileSync(path.join(dir, "index.html"), "utf8")).toContain('href="/fonts/fonts.css"');
  });

  it("index.html が存在しない場合は非0で終了する", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "fix-font-link-"));
    tempDirs.push(dir);
    mkdirSync(path.join(dir, "empty"));

    const result = spawnSync(process.execPath, [SCRIPT, path.join(dir, "empty")], {
      encoding: "utf8",
    });

    expect(result.status).not.toBe(0);
  });
});
