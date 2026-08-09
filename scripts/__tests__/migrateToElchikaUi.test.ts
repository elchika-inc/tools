/// <reference types="node" />
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  ensureComponentDependencies,
  migrateButtonTest,
  transformToastCalls,
} from "../codemods/migrate-to-elchika-ui.js";

describe("transformToastCalls", () => {
  it("title のみの呼び出しを toast.add へ変換する", () => {
    const src = `toast({ title: "Copied!" });`;
    expect(transformToastCalls(src)).toContain(`toast.add({ title: "Copied!" })`);
  });

  it('variant: "destructive" を type: "error" へ変換する', () => {
    const src = `toast({ title: "Failed", variant: "destructive" });`;
    const out = transformToastCalls(src);
    expect(out).toContain(`type: "error"`);
    expect(out).not.toContain("variant");
  });

  it('variant: "success" を type: "success" へ変換する', () => {
    const src = `toast({ title: "OK", variant: "success" });`;
    expect(transformToastCalls(src)).toContain(`type: "success"`);
  });

  it("description は保持する", () => {
    const src = `toast({ title: "A", description: "B", variant: "destructive" });`;
    const out = transformToastCalls(src);
    expect(out).toContain(`description: "B"`);
    expect(out).toContain(`type: "error"`);
  });

  it("日本語文字列内のコロンを壊さない", () => {
    const src = `toast({ title: "エラー: 変換に失敗", variant: "destructive" });`;
    const out = transformToastCalls(src);
    expect(out).toContain(`title: "エラー: 変換に失敗"`);
    expect(out).toContain(`type: "error"`);
  });

  it("複数行の呼び出しを扱える", () => {
    const src = `toast({\n  title: "A",\n  description: "B",\n  variant: "destructive",\n});`;
    const out = transformToastCalls(src);
    expect(out).toContain(`type: "error"`);
    expect(out).not.toContain("variant");
  });

  it("useToast の分割代入と import を除去する", () => {
    const src = `import { useToast } from "@/hooks/useToast";\nconst { toast } = useToast();\ntoast({ title: "x" });`;
    const out = transformToastCalls(src);
    expect(out).not.toContain("useToast");
    expect(out).not.toContain("const { toast } =");
  });

  it("関数内の useToast 分割代入も除去する", () => {
    const src = `import { useToast } from "@/hooks/useToast";\nfunction App() {\n  const { toast } = useToast();\n  return <div />;\n}`;
    const out = transformToastCalls(src);
    expect(out).not.toContain("useToast");
    expect(out).not.toContain("const { toast } =");
  });

  it("parenthesized JSX を括弧のテキスト無しで ToastToaster に包む", () => {
    const src = `import { Toaster } from "@/components/ui/toaster";\nfunction App() {\n  return (\n    <div><Toaster /></div>\n  );\n}`;
    const out = transformToastCalls(src);
    expect(out).toMatch(/<ToastToaster>\s*<div>/);
    expect(out).not.toContain("<Toaster />");
  });
});

describe("migrateButtonTest", () => {
  it("既存の button test だけを url-encoder 正本へ置換する", () => {
    const appDir = mkdtempSync(path.join(tmpdir(), "elchika-ui-codemod-"));
    const testDir = path.join(appDir, "src", "components", "ui", "__tests__");
    mkdirSync(testDir, { recursive: true });
    const target = path.join(testDir, "button.test.tsx");
    writeFileSync(target, "legacy test");

    try {
      migrateButtonTest(appDir);
      expect(readFileSync(target, "utf8")).toContain('toHaveClass("bg-destructive-subtle")');
    } finally {
      rmSync(appDir, { recursive: true, force: true });
    }
  });

  it("button test が無いアプリには新規作成しない", () => {
    const appDir = mkdtempSync(path.join(tmpdir(), "elchika-ui-codemod-"));
    const target = path.join(appDir, "src", "components", "ui", "__tests__", "button.test.tsx");

    try {
      migrateButtonTest(appDir);
      expect(() => readFileSync(target, "utf8")).toThrow();
    } finally {
      rmSync(appDir, { recursive: true, force: true });
    }
  });
});

describe("ensureComponentDependencies", () => {
  it("toast があり button が無い場合だけ正本 button を追加する", () => {
    const appDir = mkdtempSync(path.join(tmpdir(), "elchika-ui-codemod-"));
    const componentDir = path.join(appDir, "src", "components", "ui");
    mkdirSync(componentDir, { recursive: true });
    writeFileSync(path.join(componentDir, "toast.tsx"), "toast");

    try {
      ensureComponentDependencies(appDir);
      expect(readFileSync(path.join(componentDir, "button.tsx"), "utf8")).toContain(
        "export { Button, buttonVariants }",
      );
    } finally {
      rmSync(appDir, { recursive: true, force: true });
    }
  });

  it("toast が無い場合は button を追加しない", () => {
    const appDir = mkdtempSync(path.join(tmpdir(), "elchika-ui-codemod-"));
    const target = path.join(appDir, "src", "components", "ui", "button.tsx");

    try {
      ensureComponentDependencies(appDir);
      expect(() => readFileSync(target, "utf8")).toThrow();
    } finally {
      rmSync(appDir, { recursive: true, force: true });
    }
  });
});
