import {expectError, expectType} from 'tsd';
import {AuthenticatedLnd} from '../../lnd_grpc';
import {createInvoice, CreateInvoiceResult} from '../../lnd_methods';
import {Routes} from '../../typescript';

const lnd = {} as AuthenticatedLnd;
const cltv_delta = 1;
const description = 'description';
const expires_at = new Date().toISOString();
const is_fallback_included = true;
const is_fallback_nested = true;
const is_including_private_channels = true;
const secret = Buffer.alloc(32).toString('hex');
const mtokens = '1000';
const tokens = 1;
const routes: Routes = [[{
  base_fee_mtokens: '1',
  channel: '0',
  cltv_delta: 1,
  fee_rate: 1,
  public_key: 'pubkey'
}]];

expectError(createInvoice());
expectError(createInvoice({}));

expectType<CreateInvoiceResult>(await createInvoice({lnd}));
expectType<CreateInvoiceResult>(
  await createInvoice({
    lnd,
    cltv_delta,
    description,
    expires_at,
    is_fallback_included,
    is_fallback_nested,
    is_including_private_channels,
    secret,
    mtokens,
    tokens,
 })
);

expectType<void>(
  createInvoice({lnd}, (error, result) => {
    expectType<CreateInvoiceResult>(result);
 })
);
expectType<void>(
  createInvoice(
    {
      lnd,
      cltv_delta,
      description,
      expires_at,
      is_fallback_included,
      is_fallback_nested,
      is_including_private_channels,
      secret,
      mtokens,
      routes,
      tokens,
   },
    (error, result) => {
      expectType<CreateInvoiceResult>(result);
   }
  )
);
