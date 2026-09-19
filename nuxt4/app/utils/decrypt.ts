export async function decrypt<T>(
  cipher: { salt: string; iv: string; data: string },
  password: string,
): Promise<T> {
  const bytes = (v: string) => Uint8Array.from(atob(v), (c) => c.charCodeAt(0));
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: bytes(cipher.salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  return JSON.parse(
    new TextDecoder().decode(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: bytes(cipher.iv) },
        key,
        bytes(cipher.data),
      ),
    ),
  );
}
