import {expectType, expectError} from 'tsd';
import request = require('request');
import websocket = require('ws');
import {lndGateway, UnauthenticatedLnd, AuthenticatedLnd} from '../../';

expectError(lndGateway());
expectError(lndGateway({}));
expectError(
  lndGateway({
    request,
  })
);
expectError(lndGateway({request, url: 'url'}));
expectType<{lnd: UnauthenticatedLnd}>(
  lndGateway({request, url: 'url', websocket})
);
expectError<{lnd: AuthenticatedLnd}>(
  lndGateway({request, url: 'url', websocket})
);
expectType<{lnd: AuthenticatedLnd}>(
  lndGateway({
    request,
    url: 'url',
    websocket,
    macaroon: Buffer.alloc(1).toString('hex'),
  })
);
expectError<{lnd: UnauthenticatedLnd}>(
  lndGateway({
    request,
    url: 'url',
    websocket,
    macaroon: Buffer.alloc(1).toString('hex'),
  })
);
