import { describe, expect, test } from "vitest";
import { aesDecrypt, aesEncrypt, desDecrypt, desEncrypt } from "../des";

describe("des", () => {
  test("roundtrip encrypt/decrypt", () => {
    const plaintext = "Hello, World!";
    const key = "secret123";
    const encrypted = desEncrypt(plaintext, key);
    const decrypted = desDecrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  test("encrypted output is not plaintext", () => {
    const encrypted = desEncrypt("test", "key");
    expect(encrypted).not.toBe("test");
    expect(encrypted.length).toBeGreaterThan(0);
  });

  // ランダムな salt に依存せず、誤鍵で起きる各結果を固定した暗号文で確認する。
  test.each([
    ["空の復号結果", "U2FsdGVkX1/tUnDs0cCALv4V/PM+HC9lW1p2lIMtmw4=", "Decryption failed"],
    ["不正な UTF-8", "U2FsdGVkX1+7euDSfIkG08gpmzCtI920qeIwckh86eA=", "Malformed UTF-8 data"],
  ])("%s になる暗号文と誤った鍵 → 例外になる", (_condition, encrypted, message) => {
    expect(desDecrypt(encrypted, "correct-key")).toBe("secret data");
    expect(() => desDecrypt(encrypted, "wrong-key")).toThrow(message);
  });

  test("誤った鍵で UTF-8 として読める場合 → 元の平文を復元しない", () => {
    // TripleDES は認証を行わないため、誤鍵でも例外を出さず文字列を返すことがある。
    const encrypted = "U2FsdGVkX1/DrPT80EoeqaThj901CDZAxB/Y7WlsB5k=";
    expect(desDecrypt(encrypted, "correct-key")).toBe("secret data");
    expect(desDecrypt(encrypted, "wrong-key")).not.toBe("secret data");
  });
});

describe("AES-256-GCM", () => {
  test("encrypt and decrypt roundtrip", async () => {
    const plaintext = "Hello, World!";
    const key = "my-secret-key-123";
    const encrypted = await aesEncrypt(plaintext, key);
    const decrypted = await aesDecrypt(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  test("wrong key fails to decrypt", async () => {
    const encrypted = await aesEncrypt("secret", "key1");
    await expect(aesDecrypt(encrypted, "key2")).rejects.toThrow();
  });

  test("empty string roundtrip", async () => {
    const encrypted = await aesEncrypt("", "key");
    const decrypted = await aesDecrypt(encrypted, "key");
    expect(decrypted).toBe("");
  });
});
