import * as Crypto from 'expo-crypto';

const BLOCK_SIZE = 64; // SHA-256 block size in bytes

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function generateHMAC(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyBytes = encoder.encode(key);
  const dataBytes = encoder.encode(data);

  // If key > block size, hash it first; then zero-pad to block size
  let keyBlock = new Uint8Array(BLOCK_SIZE);
  if (keyBytes.length > BLOCK_SIZE) {
    const hashed = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, keyBytes);
    keyBlock.set(new Uint8Array(hashed));
  } else {
    keyBlock.set(keyBytes);
  }

  const ipad = new Uint8Array(BLOCK_SIZE);
  const opad = new Uint8Array(BLOCK_SIZE);
  for (let i = 0; i < BLOCK_SIZE; i++) {
    ipad[i] = keyBlock[i] ^ 0x36;
    opad[i] = keyBlock[i] ^ 0x5c;
  }

  // inner = SHA256(ipad || data)
  const innerInput = new Uint8Array(BLOCK_SIZE + dataBytes.length);
  innerInput.set(ipad);
  innerInput.set(dataBytes, BLOCK_SIZE);
  const innerHash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, innerInput);

  // outer = SHA256(opad || inner)
  const outerInput = new Uint8Array(BLOCK_SIZE + 32);
  outerInput.set(opad);
  outerInput.set(new Uint8Array(innerHash), BLOCK_SIZE);
  const outerHash = await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, outerInput);

  return toHex(outerHash);
}
