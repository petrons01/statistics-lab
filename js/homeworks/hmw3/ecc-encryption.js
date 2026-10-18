
/*
 * Statistics-Lab — Homework 2 (route #/hmw3)
 * Educational secp256k1 hybrid encryption.
 *
 * ECDH (secp256k1) -> HKDF-SHA256 -> AES-256-GCM.
 * The receiver's deliberately weak key is in {1, ..., 256}.
 *
 * For demonstrations only. Not a production ECIES implementation.
 */

import { loadEthers } from '../hmw2/wallet.js';

export const ECC_DEMO_MAX_KEY = 256;
export const ECC_DEMO_DEFAULT_KEY = 42;

export const ECC_DEMO_SCHEME =
  'statistics-lab-secp256k1-hkdf-aesgcm-v1';

const CURVE_ORDER = BigInt(
  '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141'
);

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });

function requireWebCrypto() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto is required. Use HTTPS or localhost.');
  }
  return globalThis.crypto;
}

function validateDemoKey(value) {
  if (!Number.isInteger(value) || value < 1 || value > ECC_DEMO_MAX_KEY) {
    throw new RangeError('Demo private key must be an integer from 1 to 256.');
  }
}

function validateHex(value, bytes, name) {
  const pattern = new RegExp(`^0x[0-9a-fA-F]{${bytes * 2}}$`);
  if (typeof value !== 'string' || !pattern.test(value)) {
    throw new TypeError(`${name} must contain ${bytes} hexadecimal bytes.`);
  }
}

function validatePublicKey(value, name) {
  validateHex(value, 65, name);
  if (value.slice(0, 4).toLowerCase() !== '0x04') {
    throw new TypeError(`${name} must be an uncompressed secp256k1 point.`);
  }
}

function generateEphemeralKey(ethers) {
  // Rejection sampling avoids the invalid scalar 0 and scalars >= curve order.
  while (true) {
    const candidate = ethers.hexlify(ethers.randomBytes(32));
    const scalar = BigInt(candidate);
    if (scalar > 0n && scalar < CURVE_ORDER) {
      return new ethers.SigningKey(candidate);
    }
  }
}

function associatedData(recipientPublicKey, ephemeralPublicKey) {
  // Bind the ciphertext to this scheme and both public keys.
  return encoder.encode(
    `${ECC_DEMO_SCHEME}|${recipientPublicKey}|${ephemeralPublicKey}`
  );
}

async function deriveAesKey(
  ethers,
  sharedPoint,
  salt,
  recipientPublicKey,
  ephemeralPublicKey,
  usages
) {
  const webCrypto = requireWebCrypto();

  // ethers returns 0x04 || x || y (65 bytes). Use x as ECDH input.
  const sharedX = ethers.getBytes(`0x${sharedPoint.slice(4, 68)}`);
  const keyMaterial = await webCrypto.subtle.importKey(
    'raw', sharedX, 'HKDF', false, ['deriveKey']
  );

  return webCrypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: ethers.getBytes(salt),
      info: associatedData(recipientPublicKey, ephemeralPublicKey)
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usages
  );
}

/**
 * Create a deliberately weak test key pair. Never use it for real assets.
 *
 * @param {number} scalar Integer from 1 to 256.
 * @returns {Promise<{scalar:number, privateKey:string, publicKey:string}>}
 */
export async function createDemoEccKeyPair(
  scalar = ECC_DEMO_DEFAULT_KEY
) {
  validateDemoKey(scalar);
  const ethers = await loadEthers();
  const signingKey = new ethers.SigningKey(ethers.toBeHex(scalar, 32));

  return {
    scalar,
    privateKey: signingKey.privateKey,
    publicKey: signingKey.publicKey
  };
}

/**
 * Encrypt UTF-8 plaintext to a receiver's secp256k1 public key.
 * Returns a transportable package; the ephemeral PRIVATE key is not included.
 *
 * @param {string} plaintext
 * @param {string} receiverPublicKey 65-byte uncompressed point, hexadecimal.
 */
export async function encryptEccMessage(plaintext, receiverPublicKey) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new TypeError('Plaintext must be a non-empty string.');
  }
  validatePublicKey(receiverPublicKey, 'Receiver public key');

  const webCrypto = requireWebCrypto();
  const ethers = await loadEthers();
  const messageBytes = encoder.encode(plaintext);

  if (messageBytes.length > 8192) {
    throw new RangeError('Plaintext may not exceed 8192 UTF-8 bytes.');
  }

  // Canonicalize and validate the recipient's public curve point.
  const recipientPublicKey = ethers.SigningKey.computePublicKey(
    receiverPublicKey, false
  );

  const ephemeral = generateEphemeralKey(ethers);
  const ephemeralPublicKey = ephemeral.publicKey;
  const sharedPoint = ephemeral.computeSharedSecret(recipientPublicKey);

  const salt = ethers.hexlify(ethers.randomBytes(32));
  const iv = ethers.hexlify(ethers.randomBytes(12));

  const aesKey = await deriveAesKey(
    ethers, sharedPoint, salt,
    recipientPublicKey, ephemeralPublicKey,
    ['encrypt']
  );

  const encrypted = new Uint8Array(await webCrypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: ethers.getBytes(iv),
      additionalData: associatedData(recipientPublicKey, ephemeralPublicKey),
      tagLength: 128
    },
    aesKey,
    messageBytes
  ));

  // Web Crypto returns ciphertext || 16-byte authentication tag.
  return {
    scheme: ECC_DEMO_SCHEME,
    recipientPublicKey,
    ephemeralPublicKey,
    salt,
    iv,
    ciphertext: ethers.hexlify(encrypted.slice(0, -16)),
    tag: ethers.hexlify(encrypted.slice(-16))
  };
}

/**
 * Decrypt a package using the receiver's deliberately small demo key.
 * A wrong key or a modified authenticated package causes an error.
 *
 * @param {object} packet Object returned by encryptEccMessage().
 * @param {number} scalar Receiver's demo private scalar (1..256).
 * @returns {Promise<string>} Recovered plaintext.
 */
export async function decryptEccMessage(packet, scalar) {
  validateDemoKey(scalar);

  if (!packet || typeof packet !== 'object' ||
      packet.scheme !== ECC_DEMO_SCHEME) {
    throw new TypeError('Unsupported or missing ECC ciphertext package.');
  }

  validatePublicKey(packet.recipientPublicKey, 'Recipient public key');
  validatePublicKey(packet.ephemeralPublicKey, 'Ephemeral public key');
  validateHex(packet.salt, 32, 'HKDF salt');
  validateHex(packet.iv, 12, 'AES-GCM IV');
  validateHex(packet.tag, 16, 'AES-GCM authentication tag');

  if (typeof packet.ciphertext !== 'string' ||
      !/^0x(?:[0-9a-fA-F]{2})+$/.test(packet.ciphertext) ||
      (packet.ciphertext.length - 2) / 2 > 8192) {
    throw new TypeError('Invalid ciphertext bytes.');
  }

  const webCrypto = requireWebCrypto();
  const ethers = await loadEthers();
  const receiver = new ethers.SigningKey(ethers.toBeHex(scalar, 32));

  const recipientPublicKey = ethers.SigningKey.computePublicKey(
    packet.recipientPublicKey, false
  );
  const ephemeralPublicKey = ethers.SigningKey.computePublicKey(
    packet.ephemeralPublicKey, false
  );

  if (receiver.publicKey !== recipientPublicKey) {
    throw new Error('The selected private key does not match the recipient.');
  }

  const sharedPoint = receiver.computeSharedSecret(ephemeralPublicKey);
  const aesKey = await deriveAesKey(
    ethers, sharedPoint, packet.salt,
    recipientPublicKey, ephemeralPublicKey,
    ['decrypt']
  );

  const cipherBytes = ethers.getBytes(packet.ciphertext);
  const tagBytes = ethers.getBytes(packet.tag);
  const encrypted = new Uint8Array(cipherBytes.length + tagBytes.length);
  encrypted.set(cipherBytes);
  encrypted.set(tagBytes, cipherBytes.length);

  try {
    const plainBuffer = await webCrypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ethers.getBytes(packet.iv),
        additionalData: associatedData(recipientPublicKey, ephemeralPublicKey),
        tagLength: 128
      },
      aesKey,
      encrypted
    );

    return decoder.decode(plainBuffer);
  } catch {
    throw new Error('Decryption failed: invalid or modified ciphertext.');
  }
}
