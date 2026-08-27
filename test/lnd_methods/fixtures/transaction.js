const transaction = '010000000111111111111111111111111111111111111111111111111111111111111111110000000000ffffffff010100000000000000015100000000';
const transactionId = 'e05609ce390b3ea464b409a0cd43742a3f549776768fc19221d614cf86098f1b';
const transactionInputId = Buffer.alloc(32, 0x11).toString('hex');

module.exports = {transaction, transactionId, transactionInputId};
