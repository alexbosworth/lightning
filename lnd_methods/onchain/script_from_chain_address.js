const {decodeBase58Address} = require('@alexbosworth/blockchain');
const {decodeBech32Address} = require('@alexbosworth/blockchain');
const {p2pkhOutputScript} = require('@alexbosworth/blockchain');
const {p2shOutputScript} = require('@alexbosworth/blockchain');
const {p2wpkhOutputScript} = require('@alexbosworth/blockchain');
const {p2wshOutputScript} = require('@alexbosworth/blockchain');

const bufferAsHex = buffer => buffer.toString('hex');
const p2wpkhAddressLength = 20;
const p2wshAddressLength = 32;

/** Derive output script from on-chain address

  {
    [bech32_address]: <Address String>
    [p2pkh_address]: <Address String>
    [p2sh_address]: <Address String>
  }

  @returns
  {
    [script]: <Output Script Hex String>
  }
*/
module.exports = args => {
  if (!args.bech32_address && !args.p2pkh_address && !args.p2sh_address) {
    return {};
  }

  if (!!args.p2pkh_address) {
    try {
      const {hash} = decodeBase58Address({address: args.p2pkh_address});

      return {script: bufferAsHex(p2pkhOutputScript({hash}).script)};
    } catch (err) {
      return {};
    }
  }

  if (!!args.p2sh_address) {
    try {
      const {hash} = decodeBase58Address({address: args.p2sh_address});

      return {script: bufferAsHex(p2shOutputScript({hash}).script)};
    } catch (err) {
      return {};
    }
  }

  try {
    const {program, version} = decodeBech32Address({
      address: args.bech32_address,
    });

    if (!!version) {
      throw new Error('ExpectedV0VersionForScriptFromChainAddress');
    }

    switch (program.length) {
    case p2wpkhAddressLength:
      return {script: bufferAsHex(p2wpkhOutputScript({hash: program}).script)};

    case p2wshAddressLength:
      return {script: bufferAsHex(p2wshOutputScript({hash: program}).script)};

    default:
      break;
    }
  } catch (err) {
    // Ignore errors
  }

  return {};
};
