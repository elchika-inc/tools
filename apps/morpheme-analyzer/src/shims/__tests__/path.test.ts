import { describe, expect, test } from 'vitest';
import { join } from '../path';

describe('path shim', () => {
  test.each([
    [['a', 'b'], 'a/b'],
    [['a/', '/b'], 'a/b'],
    [['', 'b'], 'b'],
    [['dict', 'base.dat.gz'], 'dict/base.dat.gz'],
  ])('辞書パスを POSIX 形式で結合する', (parts, expected) => {
    expect(join(...parts)).toBe(expected);
  });
});
