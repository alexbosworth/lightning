const {authenticatedLndGrpc} = require('./lnd_grpc');
const {unauthenticatedLndGrpc} = require('./lnd_grpc');

module.exports = {authenticatedLndGrpc, unauthenticatedLndGrpc};
