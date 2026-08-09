// kuromoji の DictionaryLoader が require("path") して path.join だけを使う
// (DictionaryLoader.js:51/71/91/103)。ブラウザには path が無いため最小実装を与える。
// 辞書パスの結合のみが用途なので、POSIX 形式の単純結合で足りる。
export function join(...parts: string[]): string {
  return parts
    .filter((p) => p !== '' && p !== undefined && p !== null)
    .join('/')
    .replace(/\/{2,}/g, '/');
}

export default { join };
