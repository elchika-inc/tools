import { describe, expect, it } from "vitest";
import { updateClaudeMd } from "../codemods/update-app-claude-md.js";

const replacements = [
  ["React 18", "React 19"],
  ["Vite 6", "Vite+ (Vite 8 + Rolldown)"],
  ["Tailwind CSS 3.4", "Tailwind CSS v4"],
  ["shadcn/ui (Radix UI)", "elchika-inc/ui (Base UI)"],
  ["Cloudflare Pages", "Cloudflare Workers + Static Assets"],
  ["bun run dev", "vp dev"],
  ["bun run build", "vp build"],
  ["bun test", "vp test"],
  ["bun run deploy", "bash scripts/build-all.sh"],
  ["bun run lint", "vp check"],
  ["linter: Biome", "linter/formatter: Oxlint + Oxfmt (vp check)"],
  ["テスト: bun test", "テスト: vp test"],
] as const;

describe("updateClaudeMd", () => {
  it.each(replacements)("%s を %s へ置換する", (before, after) => {
    expect(updateClaudeMd(before)).toBe(after);
  });

  it("2回適用しても結果が変わらない", () => {
    const source = replacements.map(([before]) => before).join("\n");
    const once = updateClaudeMd(source);
    expect(updateClaudeMd(once)).toBe(once);
  });
});
