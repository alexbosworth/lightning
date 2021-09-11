const {join} = require('path');
const {readFile} = require('fs').promises;

const asyncMap = require('async/map');
const fetch = require('@alexbosworth/node-fetch');
const {test} = require('@alexbosworth/tap');

const {overrides} = require('./protos');
const {protos} = require('./protos');
const protosDir = join(__dirname, '/../../grpc/protos/');
const rpcApi = 'https://raw.githubusercontent.com/lightningnetwork/lnd/master/lnrpc';

test('Check proto files are in-sync with LND master', async ({end, equal}) => {
  const protoFiles = await asyncMap(protos, async path => {
    const [filename, dir] = path.slice().reverse();

    const remoteProtoUrl = `${rpcApi}/${join(dir || '', filename)}.proto`;

    return {
      filename,
      local: await readFile(join(protosDir, `${filename}.proto`)),
      remote: await (await fetch(remoteProtoUrl)).text(),
    };
  });

  const invalidLines = protoFiles.filter(proto => {
    const localLines = proto.local.toString().split('\n');
    const remoteLines = proto.remote.split('\n');

    return remoteLines.forEach((remote, i) => {
      const local = localLines[i] || '';

      const override = overrides.find(n => {
        const [overrideFilename, overrideLine] = n;

        return overrideFilename === proto.filename && overrideLine === i;
      });

      if (!override && local !== remote) {
        equal(remote, local, `file ${proto.filename} line ${i} is expected`);
      }
    });
  });

  return end();
});
