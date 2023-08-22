import {
  Mina,
  isReady,
  PublicKey,
  Encoding,
  fetchAccount,
  PrivateKey,
} from "snarkyjs";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { MinaGoogleKeysContract } from "../../contracts/src/MinaGoogleKeysContract";

const state = {
  MinaGoogleKeysContract: null as null | typeof MinaGoogleKeysContract,
  zkapp: null as null | MinaGoogleKeysContract,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const sendTxs = async (email: string) => {
  const privateKey = PrivateKey.fromBase58(
    "B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ"
  );
  await isReady;
  const Berkeley = Mina.Network(
    "https://proxy.berkeley.minaexplorer.com/graphql"
  );
  Mina.setActiveInstance(Berkeley);
  const { MinaGoogleKeysContract } = await import(
    "../../contracts/build/src/MinaGoogleKeysContract.js"
  );
  await MinaGoogleKeysContract.compile();
  const publicKey = PublicKey.fromBase58(
    "B62qr9xRiL2qgiRydwzQLDcxnSwXzPUHogNK9myYVVaxNunyBAbouKo"
  );
  const zkapp = new MinaGoogleKeysContract(publicKey);
  const emailFields0 = Encoding.stringToFields(email)[0];
  const transaction = await Mina.transaction(() => {
    zkapp.initState(emailFields0);
  });
  await transaction.prove();
  const TxId = await transaction.sign([privateKey]).send();

  return "https://berkeley.minaexplorer.com/transaction/" + TxId.hash();
};

const deployContract = async () => {
  await isReady;
  const Berkeley = Mina.Network(
    "https://proxy.berkeley.minaexplorer.com/graphql"
  );
  Mina.setActiveInstance(Berkeley);
  const { MinaGoogleKeysContract } = await import("../../contracts/src/MinaGoogleKeysContract");
  const GoogleKeysC = await MinaGoogleKeysContract.compile();
  const publicKey = PublicKey.fromBase58("");
  state.zkapp = new state.MinaGoogleKeysContract!(publicKey);
  
    

  
};

export { sendTxs };
