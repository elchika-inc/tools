import { describe, expect, it } from "vitest";
import { fixDesignAuditSource, replaceSemanticStatusColors } from "../codemods/fix-design-audit.js";

describe("fixDesignAuditSource", () => {
  it("既存 header の内側へ backlink を加えて h1 class を正規化する", () => {
    const source = `export function App() {
  return <header className="border-b">
    <div className="mx-auto px-4">
      <h1 className="text-2xl font-bold">Title</h1>
      <p>Description</p>
    </div>
  </header>;
}`;

    const result = fixDesignAuditSource(source, "sample");

    expect(result.source).toContain("← Tools トップに戻る");
    expect(result.source).toContain('className="text-3xl font-bold tracking-tight"');
    expect(result.ds002Changed).toBe(true);
  });

  it("h1 と説明だけの div を header に変換する", () => {
    const source = `export function App() {
  return <div>
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Title</h1>
      <p>Description</p>
    </div>
  </div>;
}`;

    const result = fixDesignAuditSource(source, "sample");

    expect(result.source).toContain('<header className="space-y-2">');
    expect(result.source).toContain("← Tools トップに戻る");
    expect(result.source).toContain("</header>");
  });

  it("Card のページ見出しを重複させず semantic header に変換する", () => {
    const source = `export function App() {
  return <main>
    <Card>
      <CardHeader>
        <CardTitle>Tool Name</CardTitle>
        <CardDescription>Tool description</CardDescription>
      </CardHeader>
    </Card>
  </main>;
}`;

    const result = fixDesignAuditSource(source, "sample");

    expect(result.source).toContain("<header>");
    expect(result.source).toContain(
      '<h1 className="text-3xl font-bold tracking-tight">Tool Name</h1>',
    );
    expect(result.source).toContain(
      '<p className="mt-2 text-sm text-muted-foreground">Tool description</p>',
    );
    expect(result.source).not.toContain("<CardTitle>");
    expect(result.source).not.toContain("<CardDescription>");
  });

  it("2回適用しても結果が変わらない", () => {
    const source = `export function App() {
  return <header><h1>Title</h1><p>Description</p></header>;
}`;
    const once = fixDesignAuditSource(source, "sample").source;

    expect(fixDesignAuditSource(once, "sample").source).toBe(once);
  });
});

describe("replaceSemanticStatusColors", () => {
  it("意味が一意な status 色だけ semantic token へ置換する", () => {
    expect(
      replaceSemanticStatusColors(
        '<div role="alert" className="bg-red-50 dark:bg-red-950 text-red-700 border-red-500">{error}</div>',
        "sample",
        "src/App.tsx",
      ).source,
    ).toBe(
      '<div role="alert" className="bg-destructive-subtle dark:bg-destructive-subtle text-destructive border-destructive">{error}</div>',
    );
    expect(
      replaceSemanticStatusColors(
        "const success = 'bg-green-500 text-green-800'",
        "sample",
        "src/App.tsx",
      ).source,
    ).toBe("const success = 'bg-success text-success-foreground'");
  });

  it("意味が不明な色と syntax/code/chart 系を変更しない", () => {
    const ambiguous = '<span className="text-red-500">Value</span>';
    expect(replaceSemanticStatusColors(ambiguous, "sample", "src/App.tsx").source).toBe(ambiguous);
    const codeStatus = "const error = 'text-red-500'";
    expect(replaceSemanticStatusColors(codeStatus, "code-http-status", "src/App.tsx").source).toBe(
      codeStatus,
    );
  });
});
