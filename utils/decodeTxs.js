const async = require('async');
const { decodeTxRaw, Registry } = require('@cosmjs/proto-signing');
const { defaultRegistryTypes } = require('@cosmjs/stargate');
// const { toHex } = require('@cosmjs/encoding');
// const { sha256 } = require('@cosmjs/crypto');


const MESSAGE_TYPES_TO_DECODE = [
  '/cosmos.bank.v1beta1.MsgSend',
  '/cosmos.staking.v1beta1.MsgDelegate',
  '/cosmos.staking.v1beta1.MsgUndelegate'
  // TODO: Add more message types here
];

const registry = new Registry(defaultRegistryTypes);

module.exports = (txs, callback) => {
  async.map(txs, (base64tx, callback) => {
    const bufferTx = Buffer.from(base64tx, 'base64');
    const tx = decodeTxRaw(bufferTx);

    tx.body.messages = tx.body.messages.reduce((acc, message) => {
      if (MESSAGE_TYPES_TO_DECODE.includes(message.typeUrl))
        acc.push({
          typeUrl: message.typeUrl,
          value: registry.decode(message)
        });

      return acc;
    }, []);

    callback(null, {
      hash: bufferTx, // TODO: hash in front toHex(sha256(bufferTx))
      ...tx.body,
    });
  }, (err, decodedTxs) => {
    if (err)
      return callback(err);

    return callback(null, decodedTxs.reduce((acc, tx) => {
      if (tx.messages.length)
        acc.push(tx);

      return acc;
    }, []));
  });
};