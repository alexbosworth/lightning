import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {createHodlInvoice, CreateHodlInvoiceResult} from '../../lnd_methods';

const lnd = {} as AuthenticatedLnd;
const cltv_delta = 1;
const description = 'description';
const expires_at = new Date().toISOString();
const id = Buffer.alloc(32).toString('hex');
const is_fallback_included = true;
const is_fallback_nested = true;
const is_including_private_channels = true;
const mtokens = '1000';
const tokens = 1;

expectError(createHodlInvoice());
expectError(createHodlInvoice({}));

expectType<CreateHodlInvoiceResult>(await createHodlInvoice({lnd}));
expectType<CreateHodlInvoiceResult>(
  await createHodlInvoice({
    lnd,
    cltv_delta,
    description,
    expires_at,
    id,
    is_fallback_included,
    is_fallback_nested,
    is_including_private_channels,
    mtokens,
    tokens,
  })
);

expectType<void>(
  createHodlInvoice({lnd}, (error, result) => {
    expectType<CreateHodlInvoiceResult>(result);
  })
);
expectType<void>(
  createHodlInvoice(
    {
      lnd,
      cltv_delta,
      description,
      expires_at,
      id,
      is_fallback_included,
      is_fallback_nested,
      is_including_private_channels,
      mtokens,
      tokens,
    },
    (error, result) => {
      expectType<CreateHodlInvoiceResult>(result);
    }
  )
);
