const {decodeFirst} = require('cbor');

/** Emit an proxy response

  {
    emitter: <Emit Response EventEmitter Object>
    message: <CBOR Encoded gRPC Event and Data Message>
  }
*/
module.exports = ({emitter, message}) => {
  return decodeFirst(message, (err, decoded) => {
    if (!!err) {
      return emitter.emit('error', new Error('FailedToDecodeGatewayResponse'));
    }

    return emitter.emit(decoded.event, decoded.data);
  });
};
