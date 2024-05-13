import { decodeTxRaw, Registry } from '@cosmjs/proto-signing';
import { defaultRegistryTypes } from '@cosmjs/stargate';
import { toHex } from '@cosmjs/encoding';
import { sha256 } from '@cosmjs/crypto';
// import { MsgData, TxMsgData } from "cosmjs-types/cosmos/base/abci/v1beta1/abci.js";

const ACCEPTED_MESSAGE_TYPES = [
  '/cosmos.bank.v1beta1.MsgSend',
  '/cosmos.staking.v1beta1.MsgDelegate',
  '/cosmos.staking.v1beta1.MsgUndelegate'
  // TODO: Add more message types here
];

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const registry = new Registry(defaultRegistryTypes);

export default txs => {
  const decodedTxs = [];

  txs.forEach(base64Tx => {
    const bufferTx = Buffer.from(base64Tx, 'base64');

    const tx = decodeTxRaw(bufferTx);

    const oldMessages = tx.body.messages;

    tx.body.messages = [];

    oldMessages.forEach(message => {
      if (ACCEPTED_MESSAGE_TYPES.includes(message.typeUrl))
        tx.body.messages.push({
          typeUrl: message.typeUrl,
          value: registry.decode(message),
        });
    });

    if (tx.body.messages.length > 0) {
      tx.body.hash = toHex(sha256(bufferTx));
      decodedTxs.push(tx.body);
    };
  });

  return decodedTxs;
};