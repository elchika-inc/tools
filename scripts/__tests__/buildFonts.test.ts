import { describe, expect, it } from "vitest";
import { rewriteFontFaceCss } from "../build-fonts.js";

describe("rewriteFontFaceCss", () => {
  it("相対 files パスを /fonts/ の絶対パスへ書き換える", () => {
    const input = `@font-face {
  font-family: 'IBM Plex Sans JP';
  src: url(./files/ibm-plex-sans-jp-0-400-normal.woff2) format('woff2'), url(./files/ibm-plex-sans-jp-0-400-normal.woff) format('woff');
  unicode-range: U+25ee8;
}`;
    const out = rewriteFontFaceCss(input);
    expect(out).toContain("url(/fonts/ibm-plex-sans-jp-0-400-normal.woff2) format('woff2')");
  });

  it("woff フォールバックを落とす（モダンブラウザは woff2 のみ使う）", () => {
    const input = `src: url(./files/a.woff2) format('woff2'), url(./files/a.woff) format('woff');`;
    const out = rewriteFontFaceCss(input);
    expect(out).not.toContain(".woff)");
    expect(out).not.toContain("format('woff')");
  });

  it("unicode-range と font-family は保持する", () => {
    const input = `@font-face {
  font-family: 'IBM Plex Mono';
  font-weight: 600;
  src: url(./files/m.woff2) format('woff2'), url(./files/m.woff) format('woff');
  unicode-range: U+0000-00FF;
}`;
    const out = rewriteFontFaceCss(input);
    expect(out).toContain("font-family: 'IBM Plex Mono'");
    expect(out).toContain("font-weight: 600");
    expect(out).toContain("unicode-range: U+0000-00FF");
  });
});
