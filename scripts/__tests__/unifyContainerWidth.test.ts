import { describe, expect, it } from "vitest";
import { unifyContainerWidth } from "../codemods/unify-container-width.js";

describe("unifyContainerWidth", () => {
  it("mx-auto と同居する max-w-4xl を max-w-5xl にする", () => {
    const src = `<div className="mx-auto max-w-4xl space-y-6">`;
    const r = unifyContainerWidth(src);
    expect(r.changed).toBe(true);
    expect(r.source).toContain("mx-auto max-w-5xl");
  });

  it("max-w が先に来る並びも扱える", () => {
    const src = `<div className="max-w-2xl mx-auto space-y-6">`;
    const r = unifyContainerWidth(src);
    expect(r.source).toContain("max-w-5xl mx-auto");
  });

  it("mx-auto と同居しない max-w には触れない", () => {
    const src = `<div className="max-w-md rounded border">`;
    expect(unifyContainerWidth(src).changed).toBe(false);
  });

  it("max-w-full には触れない", () => {
    const src = `<div className="mx-auto max-w-full">`;
    expect(unifyContainerWidth(src).changed).toBe(false);
  });

  it("任意値 max-w-[250px] には触れない", () => {
    const src = `<div className="mx-auto max-w-[250px]">`;
    expect(unifyContainerWidth(src).changed).toBe(false);
  });

  it("既に max-w-5xl なら変更しない（冪等）", () => {
    const src = `<div className="mx-auto max-w-5xl">`;
    const r = unifyContainerWidth(src);
    expect(r.changed).toBe(false);
    expect(r.source).toBe(src);
  });

  it("既に max-w-6xl / 7xl のものは変更しない（準拠済みの幅を狭めない）", () => {
    expect(unifyContainerWidth(`<div className="mx-auto max-w-6xl">`).changed).toBe(false);
    expect(unifyContainerWidth(`<div className="mx-auto max-w-7xl">`).changed).toBe(false);
  });

  it("他のクラスを保持する", () => {
    const src = `<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">`;
    const r = unifyContainerWidth(src);
    expect(r.source).toContain("px-4");
    expect(r.source).toContain("lg:px-8");
  });

  it("変換件数を返す", () => {
    const src = `<div className="mx-auto max-w-4xl"><div className="mx-auto max-w-2xl">`;
    expect(unifyContainerWidth(src).count).toBe(2);
  });
});
