const {featureFlagDetails} = require('bolt09');

const colorTemplate = '#000000';
const {isArray} = Array;
const {keys} = Object;
const msPerSec = 1e3;

/** Derive node details from RPC node info

  {
    addresses: [{
      addr: <Socket String>
      network: <Socket Type String>
    }]
    alias: <Alias String>
    color: <RGB Hex Color String>
    features: {
      <Feature Bit Number String>: {
        is_known: <Feature Is Known Bool>
        is_required: <Feature Is Required Bool>
        name: <Feature Name String>
      }
    }
    last_update: <Last Graph Update Epoch Time Seconds Number>
    pub_key: <Node Public Key Hex String>
  }

  @throws
  <Error>

  @returns
  {
    alias: <Node Alias String>
    color: <RGB Hex Color String>
    features: [{
      bit: <BOLT 09 Feature Bit Number>
      is_known: <Feature is Known Bool>
      is_required: <Feature Support is Required Bool>
      type: <Feature Type String>
    }]
    public_key: <Public Key Hex String>
    sockets: [{
      socket: <Host and Port String>
      type: <Socket Type String>
    }]
    [updated_at]: <Last Known Update ISO 8601 Date String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedNodeDetailsToMapRpcNodeToNode');
  }

  if (!isArray(args.addresses)) {
    throw new Error('ExpectedArrayOfNodeAddressForNodeDetails');
  }

  if (args.addresses.filter(n => !!n).length !== args.addresses.length) {
    throw new Error('ExpectedArrayOfNetworkAddressesForRpcNode');
  }

  args.addresses.forEach(({addr, network}) => {
    if (!addr) {
      throw new Error('ExpectedNodeAddressInNodeDetails');
    }

    if (!network) {
      throw new Error('ExpectedNodeNetworkInNodeDetails');
    }

    return;
  });

  if (args.alias === undefined) {
    throw new Error('ExpectedNodeAliasFromNodeDetails');
  }

  if (!args.color || args.color.length !== colorTemplate.length) {
    throw new Error('ExpectedNodeColorInNodeDetails');
  }

  if (!args.features) {
    throw new Error('ExpectedFeaturesInNodeDetails');
  }

  if (args.last_update === undefined) {
    throw new Error('ExpectedNodeLastUpdateTimestamp');
  }

  if (!args.pub_key) {
    throw new Error('ExpectedNodeDetailsPublicKey');
  }

  const updatedAt = args.last_update * msPerSec;

  const updated = !updatedAt ? undefined : new Date(updatedAt);

  return {
    alias: args.alias,
    color: args.color,
    features: keys(args.features).map(bit => ({
      bit: Number(bit),
      is_known: args.features[bit].is_known,
      is_required: args.features[bit].is_required,
      type: featureFlagDetails({bit: Number(bit)}).type,
    })),
    public_key: args.pub_key,
    sockets: args.addresses.map(({addr, network}) => ({
      socket: addr,
      type: network,
    })),
    updated_at: !updated ? undefined : updated.toISOString(),
  };
};
