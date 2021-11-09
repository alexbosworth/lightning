const bufferAsBase64 = n => !!n.length ? n.toString('base64') : undefined;
const {isBuffer} = Buffer;
const request = 'request';
const response = 'response';
const streamAuth = 'stream_auth';

/** Derive request details from an RPC request update

  {
    msg_id: <Message Id Number String>
    request_id: <Request Id Number String>
    raw_macaroon: <Raw Macaroon Buffer Object>
    custom_caveat_condition: <Custom Caveat Condition String>
    [request]: {
      method_full_uri: <Method URI String>
      stream_rpc: <Is String RPC Bool>
      type_name: <RPC Message Type String>
      serialized: <Raw Protobuf Request Buffer Object>
    }
    [response]: {
      method_full_uri: <Method URI String>
      stream_rpc: <Is String RPC Bool>
      type_name: <RPC Message Type String>
      serialized: <Raw Protobuf Response Buffer Object>
    }
    [stream_auth]: {
      method_full_uri: <Method URI String>
    }
    intercept_type: <RPC Update Type String>
  }

  @throws
  <Error>

  @returns
  {
    call: <Call Id Number>
    [event]: <Event Type String>
    id: <Request Id Number>
    [macaroon]: <Base64 Encoded Macaroon String>
    [uri]: <RPC URI String>
  }
*/
module.exports = args => {
  if (!args) {
    throw new Error('ExpectedRpcRequestUpdateDetailsToDeriveUpdateEvent');
  }

  if (args.custom_caveat_condition === undefined) {
    throw new Error('ExpectedCustomCaveatConditionInRpcRequestUpdate');
  }

  if (args.intercept_type === undefined) {
    throw new Error('ExpectedInterceptTypeInRpcRequestUpdate');
  }

  if (args.msg_id === undefined) {
    throw new Error('ExpectedMessageIdInRpcRequestUpdate');
  }

  if (!isBuffer(args.raw_macaroon)) {
    throw new Error('ExpectedCompleteMacaroonCredentialsInRequestUpdate');
  }

  if (args.request_id === undefined) {
    throw new Error('ExpectedRequestIdInRpcRequestUpdate');
  }

  const call = Number(args.request_id);
  const id = Number(args.msg_id);

  switch (args.intercept_type) {
  // New subscription
  case streamAuth:
    if (!args[streamAuth]) {
      throw new Error('ExpectedStreamAuthDetailsInRpcRequestUpdate');
    }

    if (!args[streamAuth].method_full_uri) {
      throw new Error('ExpectedFullUriForStreamAuthRpcRequestUpdate');
    }

    return {
      call,
      id,
      event: request,
      macaroon: bufferAsBase64(args.raw_macaroon),
      uri: args[streamAuth].method_full_uri,
    };

  // New request
  case request:
    if (!args[request]) {
      throw new Error('ExpectedRequestDetailsInRpcRequestUpdate');
    }

    if (!args[request].method_full_uri) {
      throw new Error('ExpectedFullUriForRequestRpcRequestUpdate');
    }

    return {
      call,
      id,
      event: request,
      macaroon: bufferAsBase64(args.raw_macaroon),
      uri: args[request].method_full_uri,
    };

  // Response to past request
  case response:
    if (!args[response]) {
      throw new Error('ExpectedResponseDetailsInRpcRequestUpdate');
    }

    if (!args[response].method_full_uri) {
      throw new Error('ExpectedFullUriForResponseRpcRequestUpdate');
    }

    return {
      call,
      id,
      event: response,
      macaroon: bufferAsBase64(args.raw_macaroon),
      uri: args[response].method_full_uri,
    };

  // Unknown update
  default:
    return {call, id, macaroon: bufferAsBase64(args.raw_macaroon)};
  }
};
