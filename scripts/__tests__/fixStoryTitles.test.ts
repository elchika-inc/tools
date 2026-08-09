import { describe, expect, it } from "vitest";
import { namespaceTitle } from "../codemods/fix-story-titles.js";

describe("namespaceTitle", () => {
  it("title にアプリ名の名前空間を付ける", () => {
    const src = `const meta = {\n  title: 'UI/Button',\n  component: Button,\n};`;
    const r = namespaceTitle(src, "aes-encrypt");
    expect(r.changed).toBe(true);
    expect(r.source).toContain("title: 'aes-encrypt/UI/Button'");
  });

  it("既に名前空間化済みなら変更しない（冪等）", () => {
    const src = `title: 'aes-encrypt/UI/Button',`;
    const r = namespaceTitle(src, "aes-encrypt");
    expect(r.changed).toBe(false);
    expect(r.source).toBe(src);
  });

  it("ダブルクォートも扱える", () => {
    const src = `title: "UI/Card",`;
    const r = namespaceTitle(src, "bmi-calculator");
    expect(r.source).toContain(`title: "bmi-calculator/UI/Card"`);
  });

  it("title が無いファイルは変更しない", () => {
    const src = `export const Default = {};`;
    expect(namespaceTitle(src, "x").changed).toBe(false);
  });
});
