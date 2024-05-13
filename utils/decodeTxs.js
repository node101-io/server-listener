import { decodeTxRaw, Registry } from '@cosmjs/proto-signing';
import { StargateClient, defaultRegistryTypes } from '@cosmjs/stargate';
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

    const newMessages = [];

    tx.body.messages.forEach(message => {
      console.log(message);
      if (ACCEPTED_MESSAGE_TYPES.includes(message.typeUrl))
        newMessages.push({
          typeUrl: message.typeUrl,
          value: registry.decode(message),
        });
    });

    if (newMessages.length > 0) {
      tx.body.txHash = toHex(sha256(bufferTx));
      tx.body.messages = newMessages;
      decodedTxs.push(tx);
    };
  });

  return JSON.stringify(decodedTxs, null, 2);
};

// const client = await StargateClient.connect('https://cosmos-rpc.onivalidator.com/');

// const txs = await client.searchTx("transfer.sender='cosmos1x2v9u3x0ut6krpldpdv5pdke2a5ps38d36yehj'");
// console.log(txs);