import {
  Mina,
  isReady,
  PublicKey,
  Encoding,
  fetchAccount,
  AccountUpdate,
  PrivateKey,
  UInt64,
  Signature,
  Field,
} from "snarkyjs";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { MinaGoogleKeysContract } from "../../contracts/build/src/MinaGoogleKeysContract.js";

const state = {
  MinaGoogleKeysContract: null as null | typeof MinaGoogleKeysContract,
  zkapp: null as null | MinaGoogleKeysContract,
  transaction: null as null | Transaction,
};

// ---------------------------------------------------------------------------------------

const serverAccount = PrivateKey.fromBase58(
  "EKEMujNqXREfQeS2d9piWAugVJGv38k8ZFsLgmQLMGuD1Dp6xGoF"
);

const sendTxs = async (
  email: string,
  recipient: string,
  amount: UInt64,
  oracle_signature: any
) => {
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
  const recipientAddress = PublicKey.fromBase58(recipient);
  const signature = Signature.fromJSON(oracle_signature);
  const transaction = await Mina.transaction(() => {
    zkapp.verifyAndSend(emailFields0, recipientAddress, amount, signature);
  });
  await transaction.prove();
  const TxId = await transaction.sign([privateKey]).send();

  return "https://berkeley.minaexplorer.com/transaction/" + TxId.hash();
};

const deployContract = async (email: string) => {
  await isReady;
  console.log("setup network...");
  const Berkeley = Mina.Network(
    "https://proxy.berkeley.minaexplorer.com/graphql"
  );
  console.log("set active inst...");
  Mina.setActiveInstance(Berkeley);
  const { MinaGoogleKeysContract } = await import(
    "../../contracts/build/src/MinaGoogleKeysContract.js"
  );
  console.log("create keys...");
  const zkAppPrivateKey = PrivateKey.random();
  const zkAppAddress = zkAppPrivateKey.toPublicKey();
  console.log("compile contract...");
  const { verificationKey } = await MinaGoogleKeysContract.compile();
  console.log("compiled");
  const contract = new MinaGoogleKeysContract(zkAppAddress);

  console.log("deploy contract...");
  const deploy_txn = await Mina.transaction(serverAccount.toPublicKey(), () => {
    AccountUpdate.fundNewAccount(serverAccount.toPublicKey());
    contract.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
  });
  console.log("send tx deploying contract...");
  await deploy_txn.prove();
  await deploy_txn.sign([serverAccount]).send();
  console.log("set init state...");
  const emailFields = Field.from(email);
  const init_txn = await Mina.transaction(serverAccount.toPublicKey(), () => {
    contract.initState(emailFields);
  });
  console.log("send tx init state...");
  await init_txn.prove();
  await init_txn.sign([serverAccount]).send();
  console.log("...end");
  return zkAppAddress.toBase58();
};

export { sendTxs, deployContract };
