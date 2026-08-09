import { describe, expect, it } from "vitest";
import { focusRingToStandards } from "../codemods/fix-focus-ring.js";

describe("focusRingToStandards", () => {
  it("ring-2 + ring-offset-2 を standards §5 の形へ変換する", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("focus-visible:ring-[3px] focus-visible:ring-ring");
    expect(r.source).not.toContain("ring-offset-2");
  });

  it("後続クラスを保持する", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"`;
    const r = focusRingToStandards(src);
    expect(r.source).toContain("resize-none");
    expect(r.source).toContain("font-mono");
  });

  it("offset が無いパターンも ring-[3px] にする", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring"`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("focus-visible:ring-[3px] focus-visible:ring-ring");
  });

  it("ring-offset-background も取り除く", () => {
    const src = `className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"`;
    const r = focusRingToStandards(src);
    expect(r.source).not.toContain("ring-offset-background");
  });

  it("既に standards の形なら変更しない（冪等）", () => {
    const src = `className="focus-visible:ring-[3px] focus-visible:ring-ring"`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(false);
    expect(r.source).toBe(src);
  });

  it("focus-visible 以外の ring-2 は触らない", () => {
    const src = `className="ring-2 ring-border"`;
    expect(focusRingToStandards(src).changed).toBe(false);
  });

  it("前方の JSX 本文に apostrophe があっても変換する", () => {
    const src = `<p>browser's UA</p><textarea className="ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />`;
    const r = focusRingToStandards(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("focus-visible:ring-[3px] focus-visible:ring-ring");
    expect(r.source).not.toContain("ring-offset-background");
  });

  it("透明度合成を新たに生まない", () => {
    const src = `className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"`;
    const r = focusRingToStandards(src);
    expect(r.source).not.toMatch(/ring-ring\/\d/);
  });
});
