const {test} = require('@alexbosworth/tap');

const method = require('./../../../lnd_methods/macaroon/handle_rpc_request_update');

const tests = [
  {
    args: {
      is_intercepting_close_channel_requests: true,
      lnd: {
        default: {
          CloseChannel: {
            requestDeserialize: () => ({
              channel_point: {
                funding_txid_bytes: Buffer.from('010203', 'hex'),
                output_index: 0,
              },
              delivery_address: 'delivery_address',
              force: true,
              sat_per_byte: '1',
              target_conf: 1,
            }),
          },
        },
      },
      subscription: {},
      update: {
        msg_id: '1',
        request_id: '1',
        raw_macaroon: Buffer.alloc(0),
        custom_caveat_condition: '',
        request: {
          method_full_uri: '/lnrpc.Lightning/CloseChannel',
          serialized: Buffer.alloc(0),
          stream_rpc: false,
          type_name: '',
        },
        intercept_type: 'request',
      },
    },
    description: 'A RPC request update is handled',
    expected: {
      data: {
        id: 1,
        macaroon: undefined,
        request: {
          address: 'delivery_address',
          is_force_close: true,
          target_confirmations: 1,
          tokens_per_vbyte: 1,
          transaction_id: '030201',
          transaction_vout: 0,
        },
        uri: '/lnrpc.Lightning/CloseChannel',
      },
      event: 'close_channel_request',
    },
  },
  {
    args: {
      is_intercepting_open_channel_requests: true,
      lnd: {
        default: {
          OpenChannel: {
            requestDeserialize: () => ({
              close_address: 'close_address',
              local_funding_amount: '1',
              min_htlc_msat: '1',
              node_pubkey: Buffer.alloc(33, 3),
              node_pubkey_string: Buffer.alloc(33, 3).toString('hex'),
              private: false,
              push_sat: '1',
              remote_csv_delay: 1,
              sat_per_byte: '1',
              sat_per_vbyte: '1',
              spend_unconfirmed: true,
              target_conf: 1,
            }),
          },
        },
      },
      subscription: {},
      update: {
        msg_id: '1',
        request_id: '1',
        raw_macaroon: Buffer.alloc(0),
        custom_caveat_condition: '',
        request: {
          method_full_uri: '/lnrpc.Lightning/OpenChannel',
          serialized: Buffer.alloc(0),
          stream_rpc: false,
          type_name: '',
        },
        intercept_type: 'request',
      },
    },
    description: 'A RPC request update is handled',
    expected: {
      data: {
        id: 1,
        macaroon: undefined,
        request: {
          chain_fee_tokens_per_vbyte: 1,
          cooperative_close_address: 'close_address',
          give_tokens: 1,
          is_private: undefined,
          local_tokens: 1,
          min_confirmations: 0,
          min_htlc_mtokens: '1',
          partner_public_key: Buffer.alloc(33, 3).toString('hex'),
          partner_csv_delay: 1,
        },
        uri: '/lnrpc.Lightning/OpenChannel',
      },
      event: 'open_channel_request',
    },
  },
  {
    args: {
      is_intercepting_pay_via_routes_requests: true,
      lnd: {
        router: {
          SendToRouteV2: {
            requestDeserialize: () => ({
              payment_hash: Buffer.alloc(32),
              route: {
                hops: [{
                  amt_to_forward_msat: '1',
                  chan_id: '1',
                  chan_capacity: 1,
                  custom_records: {},
                  expiry: 1,
                  pub_key: Buffer.alloc(33, 3).toString('hex'),
                  fee_msat: '1',
                  tlv_payload: true,
                }],
                total_amt_msat: '1',
                total_fees_msat: '1',
                total_time_lock: 1,
              },
            }),
          },
        },
      },
      subscription: {},
      update: {
        msg_id: '1',
        request_id: '1',
        raw_macaroon: Buffer.alloc(0),
        custom_caveat_condition: '',
        request: {
          method_full_uri: '/routerrpc.Router/SendToRouteV2',
          serialized: Buffer.alloc(0),
          stream_rpc: false,
          type_name: '',
        },
        intercept_type: 'request',
      },
    },
    description: 'A RPC request update is handled',
    expected: {
      data: {
        id: 1,
        macaroon: undefined,
        request: {
          id: Buffer.alloc(32).toString('hex'),
          route: {
            fee: 0,
            fee_mtokens: '1',
            hops: [{
              channel: '0x0x1',
              channel_capacity: 1,
              fee: 0,
              fee_mtokens: '1',
              forward: 0,
              forward_mtokens: '1',
              public_key: Buffer.alloc(33, 3).toString('hex'),
              timeout: 1,
            }],
            mtokens: '1',
            payment: undefined,
            timeout: 1,
            tokens: 0,
            total_mtokens: undefined,
          },
        },
        uri: '/routerrpc.Router/SendToRouteV2',
      },
      event: 'pay_via_route_request',
    },
  },
  {
    args: {
      subscription: {},
      update: {
        msg_id: '1',
        request_id: '1',
        raw_macaroon: Buffer.alloc(0),
        custom_caveat_condition: '',
        stream_auth: {method_full_uri: 'method_full_uri'},
        intercept_type: 'stream_auth',
      },
    },
    description: 'A RPC request update is handled',
    expected: {
      data: {
        id: 1,
        macaroon: undefined,
        uri: 'method_full_uri',
      },
      event: 'request',
    },
  },
];

tests.forEach(({args, description, error, expected}) => {
  return test(description, async ({end, strictSame, throws}) => {
    if (!!error) {
      throws(() => method(args), new Error(error), 'Got expected error');
    } else {
      const res = method(args);

      const {accept, id, macaroon, reject, request, uri} = res.data;

      if (!!accept) {
        try { await accept({}); } catch (err) {}
      }

      if (!!reject) {
        try { await reject({}); } catch (err) {}
      }

      strictSame(id, expected.data.id, 'Got expected id');
      strictSame(res.event, expected.event, 'Got expected event');
      strictSame(macaroon, expected.data.macaroon, 'Got expected macaroon');
      strictSame(request, expected.data.request, 'Got expected request');
      strictSame(uri, expected.data.uri, 'Got expected uri');
    }

    return end();
  });
});
