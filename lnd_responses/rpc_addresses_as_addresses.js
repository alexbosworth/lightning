const flatten = arr => [].concat(...arr);
const {isArray} = Array;
const isBoolean = n => n === false || n === true;

/** Derive a list of addresses from a list of accounts with addresses

  {
    accounts: [{
      addresses: [{
        address: <Chain Address String>
        balance: <Balance Tokens Number String>
        is_internal: <Is Change Address Bool>
      }]
    }]
  }

  @throws
  <Error>

  @returns
  {
    addresses: [{
      address: <Chain Address String>
      is_change: <Is Internal Change Address Bool>
      tokens: <Balance of Funds Controlled by Output Script Tokens Number>
    }]
  }
*/
module.exports = ({accounts}) => {
  if (!isArray(accounts)) {
    throw new Error('ExpectedArrayOfAccountsWithAddresses');
  }

  // Map the accounts addresses to a list of addresses
  const addresses = flatten(accounts.map(account => {
    if (!isArray(account.addresses)) {
      throw new Error('ExpectedArrayOfAddressesInAccountWithAddresses');
    }

    return account.addresses.map(accountAddress => {
      if (!accountAddress.address) {
        throw new Error('ExpectedChainAddressInAccountAddress');
      }

      if (!accountAddress.balance) {
        throw new Error('ExpectedBalanceTotalForAccountAddress');
      }

      if (!isBoolean(accountAddress.is_internal)) {
        throw new Error('ExpectedInternalAddressMarkerInAccountAddress');
      }

      return {
        address: accountAddress.address,
        is_change: accountAddress.is_internal,
        tokens: Number(accountAddress.balance),
      };
    });
  }));

  return {addresses};
};
