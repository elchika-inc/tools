import { gzipSync } from 'fflate';
import { describe, expect, test } from 'vitest';
import { Zlib } from '../zlib-gunzip';

describe('zlib-gunzip shim', () => {
  test('kuromoji が期待する同期 API で gzip を展開する', () => {
    const source = new Uint8Array([0, 1, 2, 3, 255]);
    const compressed = gzipSync(source);

    expect(new Zlib.Gunzip(compressed).decompress()).toEqual(source);
  });

  test('配信層で解凍済みの入力はそのまま返す', () => {
    const source = new Uint8Array([0, 1, 2, 3, 255]);

    expect(new Zlib.Gunzip(source).decompress()).toEqual(source);
  });
});
