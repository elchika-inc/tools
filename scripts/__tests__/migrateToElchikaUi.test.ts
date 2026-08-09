import { describe, expect, it } from "vitest";
import { transformToastCalls } from "../codemods/migrate-to-elchika-ui.js";

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
