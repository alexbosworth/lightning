const stateAbsent = 'NON_EXISTING';
const stateActive = 'RPC_ACTIVE';
const stateLocked = 'LOCKED';
const stateReady = 'SERVER_ACTIVE';
const stateStarting = 'UNLOCKED';
const stateWaiting = 'WAITING_TO_START';

/** Interpret state as wallet status

  {
    state: <WalletState String>
  }

  @returns
  {
    [is_absent]: <Wallet Not Created Bool>
    [is_active]: <Wallet Is Active Bool>
    [is_locked]: <Wallet File Encrypted And Wallet Not Active Bool>
    [is_ready]: <Wallet Is Ready For All RPC Calls Bool>
    [is_starting]: <Wallet Is Starting Up Bool>
    [is_waiting]: <Wallet Is Waiting To Start Bool>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedStateResponse');
  }

  if (!args.state) {
    throw new Error('ExpectedStateInStateResponse');
  }

  switch (args.state) {
  case stateAbsent:
    return {is_absent: true};

  case stateActive:
    return {is_active: true};

  case stateLocked:
    return {is_locked: true};

  case stateReady:
    return {is_active: true, is_ready: true};

  case stateStarting:
    return {is_starting: true};

  case stateWaiting:
    return {is_waiting: true};

  default:
    return {};
  }
};
