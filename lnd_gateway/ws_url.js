const encryptedProtocol = 'https:';
const encryptedWsProtocol = 'wss:';
const plaintextProtocol = 'http:';
const plaintextWsProtocol = 'ws:';

/** Websocket URL for URL

  {
    url: <Gateway Server URL String>
  }

  @returns
  {
    url: <WebSocket URL String>
  }
*/
module.exports = ({url}) => {
  const remote = new URL(url);

  switch (remote.protocol) {
  case encryptedProtocol:
    remote.protocol = encryptedWsProtocol;
    break;

  case plaintextProtocol:
    remote.protocol = plaintextWsProtocol;
    break;
  
  default:
    break;
  }

  return {url: remote.toString()};
};
