import { globSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "../..");

const REPLACEMENTS = [
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
];

export function updateClaudeMd(source) {
  return REPLACEMENTS.reduce(
    (updated, [before, after]) => updated.replaceAll(before, after),
    source,
  );
}

function main() {
  const files = globSync(path.join(ROOT_DIR, "apps", "*", "CLAUDE.md"));
  let updatedCount = 0;
  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const updated = updateClaudeMd(source);
    if (updated === source) continue;
    writeFileSync(file, updated);
    updatedCount += 1;
  }
  console.log(`更新した CLAUDE.md: ${updatedCount} / ${files.length}`);
}

if (process.argv[1] && process.argv[1].endsWith("update-app-claude-md.js")) {
  main();
}
