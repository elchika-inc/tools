// kuromoji が require する zlibjs/bin/gunzip.min.js の代替。
// zlibjs は「モジュールスコープの this がグローバルを指す」前提の UMD で、
// ESM バンドル下では this が undefined に束縛され動かない（生成物に .call(void 0) が残る）。
// kuromoji が使うのは Zlib.Gunzip の同期 decompress のみなので、そこだけを fflate で実装する。
// 標準の DecompressionStream は非同期のため、同期呼び出しの kuromoji には使えない。
import { gunzipSync } from 'fflate';

class Gunzip {
  private readonly input: Uint8Array;

  constructor(input: Uint8Array) {
    this.input = input;
  }

  decompress(): Uint8Array {
    // Vite preview などが Content-Encoding: gzip を付けると、ブラウザが
    // レスポンスを自動解凍する。gzip magic が無い入力は解凍済みとして扱う。
    if (this.input[0] !== 0x1f || this.input[1] !== 0x8b) {
      return this.input;
    }

    return gunzipSync(this.input);
  }
}

export const Zlib = { Gunzip };
export default { Zlib };
