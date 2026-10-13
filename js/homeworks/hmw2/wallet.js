
// HMW 2 - Educational Ethereum address derivation.
// Only public, deliberately compromised demonstration mnemonics are supported.
// Never pass real wallet recovery phrases to this module.

const ETHERS_MODULE =
  'https://cdn.jsdelivr.net/npm/ethers@6.15.0/dist/ethers.min.js';

export const DEMO_MNEMONICS = Object.freeze([
  {
    id: 'bip39',
    label: 'BIP-39 test vector (abandon ... about)',
    phrase: `${Array(11).fill('abandon').join(' ')} about`
  },
  {
    id: 'hardhat',
    label: 'Development test vector (test ... junk)',
    phrase: `${Array(11).fill('test').join(' ')} junk`
  }
]);

let ethersPromise;

function loadEthers() {
  // Imported lazily so Dashboard and HMW 1 work even if CDN is unavailable.
  ethersPromise ??= import(ETHERS_MODULE).catch(error => {
    ethersPromise = undefined;
    throw error;
  });
  return ethersPromise;
}

export async function deriveDemoWallet(presetId = 'bip39', index = 0) {
  const preset = DEMO_MNEMONICS.find(item => item.id === presetId);
  if (!preset) throw new RangeError('Unknown demonstration mnemonic');
  if (!Number.isInteger(index) || index < 0 || index > 4) {
    throw new RangeError('Address index must be an integer from 0 to 4');
  }

  const { Mnemonic, HDNodeWallet, SigningKey, keccak256, getAddress } =
    await loadEthers();

  // BIP-39: empty optional passphrase; PBKDF2-HMAC-SHA512.
  const mnemonic = Mnemonic.fromPhrase(preset.phrase, '');
  const seed = mnemonic.computeSeed();

  // BIP-32 master node and BIP-44 Ethereum derivation path.
  const master = HDNodeWallet.fromSeed(seed);
  const path = `m/44'/60'/0'/0/${index}`;
  const child = master.derivePath(path);

  // Uncompressed secp256k1 point: 0x04 || x(32 bytes) || y(32 bytes).
  const uncompressedPublicKey = SigningKey.computePublicKey(
    child.privateKey, false
  );

  // Ethereum hashes x || y (64 bytes), without the 0x04 prefix.
  const publicKeyXY = `0x${uncompressedPublicKey.slice(4)}`;
  const publicKeyHash = keccak256(publicKeyXY);
  const lowercaseAddress = `0x${publicKeyHash.slice(-40)}`;
  const checksummedAddress = getAddress(lowercaseAddress);

  if (checksummedAddress !== child.address) {
    throw new Error('Address verification failed');
  }

  return {
    mnemonic: preset.phrase,
    seed,
    masterPrivateKey: master.privateKey,
    masterChainCode: master.chainCode,
    path,
    derivedPrivateKey: child.privateKey,
    publicKey: uncompressedPublicKey,
    publicKeyXY,
    publicKeyHash,
    lowercaseAddress,
    checksummedAddress,
    verified: true
  };
}
