const {test} = require('tap');

const {rpcChannelAsChannel} = require('./../../lnd_responses');

const tests = [
  {
    args: {
      active: true,
      capacity: '1',
      chan_id: '1',
      channel_point: '00:1',
      chan_status_flags: '1',
      close_address: undefined,
      commit_fee: '1',
      commit_weight: '1',
      csv_delay: 1,
      fee_per_kw: '1',
      initiator: false,
      lifetime: 1,
      local_balance: '1',
      local_chan_reserve_sat: '0',
      num_updates: '1',
      pending_htlcs: [{
        amount: '1',
        expiration_height: 1,
        hash_lock: Buffer.alloc(32),
        incoming: true,
      }],
      private: true,
      remote_balance: '1',
      remote_chan_reserve_sat: '0',
      remote_pubkey: '00',
      static_remote_key: false,
      total_satoshis_received: '1',
      total_satoshis_sent: '1',
      unsettled_balance: '1',
      uptime: 1,
    },
    description: 'RPC channel is mapped to channel',
    expected: {
      capacity: 1,
      commit_transaction_fee: 1,
      commit_transaction_weight: 1,
      cooperative_close_address: undefined,
      id: '0x0x1',
      is_active: true,
      is_closing: false,
      is_opening: false,
      is_partner_initiated: true,
      is_private: true,
      is_static_remote_key: undefined,
      local_balance: 1,
      local_reserve: undefined,
      partner_public_key: '00',
      pending_payments: [{
        id: Buffer.alloc(32).toString('hex'),
        is_outgoing: false,
        timeout: 1,
        tokens: 1,
      }],
      received: 1,
      remote_balance: 1,
      remote_reserve: undefined,
      sent: 1,
      time_offline: undefined,
      time_online: 1000,
      transaction_id: '00',
      transaction_vout: 1,
      unsettled_balance: 1,
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, ({deepEqual, end, equal, throws}) => {
    if (!!error) {
      throws(() => rpcChannelAsChannel(args), new Error(error), 'Got error');
    } else {
      const channel = rpcChannelAsChannel(args);

      deepEqual(channel, expected, 'Channel cast as channel');
    }

    return end();
  });
});
