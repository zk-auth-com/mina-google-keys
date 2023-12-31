import {
  Mina,
  PublicKey,
  Encoding,
  fetchAccount,
  Bool,
  AccountUpdate,
  PrivateKey,
  UInt64,
  Signature,
  Field,
} from "../../contracts/node_modules/o1js/dist/node/index.js";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

// import type { MinaGoogleKeysContract } from "../../contracts/build/src/MinaGoogleKeysContract.js";
// // import type  MinaGoogleKeysContract  from "../../contracts/build/src/MinaGoogleKeysContract.js";

const ORACLE_PUBLIC_KEY =
  "B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ";

// const state = {
//   MinaGoogleKeysContract: null as null | typeof MinaGoogleKeysContract,
//   zkapp: null as null | MinaGoogleKeysContract,
//   transaction: null as null | Transaction,
// };

// ---------------------------------------------------------------------------------------

const serverAccount = PrivateKey.fromBase58(
  "EKEXGmaHbV5jXoh3MgMTet689aMHsS82GBNF845uq117hZWXPQnK"
);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));


export const sendTxs = async (
  email: string,
  recipient: string,
  amount: number,
  oracle_signature: any
) => {
  const Berkeley = Mina.Network(
    "https://proxy.berkeley.minaexplorer.com/graphql"
  );
  Mina.setActiveInstance(Berkeley);
  Mina.getProofsEnabled();
  console.log("Berkeley Instance Created");
  const { MinaGoogleKeysContract } = await import(
    "../../contracts/build/src/MinaGoogleKeysContract.js"
  );
  console.log("contract imported");
  const zkapps = MinaGoogleKeysContract;
  await zkapps.compile();
  console.log("contract compiled");
  const publicKey = PublicKey.fromBase58(
    // "B62qk52dWhknKVrtb3dMMNKGJo6YjaTyfCFCacQN7YvfcaF7zwmEdoY"
    // "B62qnMNvrJJGZhBynSgFe7Ep3DgCCCnqFGPqtvKqyqpLuoJfXoLTwYJ"
    // "B62qmeQWxiRAPX8Rm6QC7CGjYutfiNwuMdHaqPUK9mak9XesuBoK663"
    // "B62qpFonee79QXcRXDbtTzxV9dABsgxK1LAs6NtuaynxcZPPLrNHCz6"
    "B62qrGHXQVuU8vcoRv6M3fXtQC2MBWCGmYfxKbEd9URST1KQU2766Qa"
  );

  const zkapp = new zkapps(publicKey);
  console.log("contract created");
  const emailFields0 = Encoding.stringToFields(email)[0];
  const recipientAddress = PublicKey.fromBase58(recipient);
  const signature = Signature.fromJSON(oracle_signature);
  const amountUInt64 = UInt64.from(amount);
  console.log("create transaction ");
  console.log("emailFields0", emailFields0.toJSON());
  console.log("recipientAddress", recipientAddress.toJSON());
  console.log("amountUInt64", amountUInt64.toJSON());
  console.log("signature", signature.toJSON());
  const oraclePublicKey = PublicKey.fromBase58(ORACLE_PUBLIC_KEY);
  // const validSignature = signature.verify(oraclePublicKey, [emailFields0]);
  console.log("oraclePublicKey", oraclePublicKey.toJSON());
  // console.log("validSignature", validSignature.toBoolean());
  console.log("contract created");
  let validSignature: Bool =  Bool(false);

  let transaction = await Mina.transaction(
    {
      sender: serverAccount.toPublicKey(),
      fee: 100000000,
    },
    () => {
      validSignature = zkapp.verifyAndSend(
        emailFields0,
        recipientAddress,
        amountUInt64,
        signature,
        oraclePublicKey
      )
    }
  );
  console.log("transaction created");
  transaction = transaction.sign([serverAccount]);
  // const test= await transaction.toJSON()
  // console.log("transaction signed", test);
  await transaction.prove();
  console.log("transaction proved");
  await transaction.send();
  await sleep(180000);

  const send_txn = await Mina.transaction(
    {sender: serverAccount.toPublicKey() , fee: amount + 100000000}, () => {
      let accountUpdate: AccountUpdate = AccountUpdate.createSigned(serverAccount.toPublicKey());
      accountUpdate.requireSignature();
      accountUpdate.send({
            to: recipientAddress,
            amount: amount,
        });
    })
    console.log('create tx')
    await send_txn.prove()
    console.log('prove tx')
    const TxId =  await send_txn.sign([serverAccount]).send()
    console.log('send tx')

  return "https://minascan.io/testworld2/zk-tx/" + TxId.hash();
};

export const updateEmail = async (email: string) => {
  // await isReady;
  const Berkeley = Mina.Network(
    "https://proxy.berkeley.minaexplorer.com/graphql"
  );
  Mina.setActiveInstance(Berkeley);
  console.log("Berkeley Instance Created");
  const { MinaGoogleKeysContract } = await import(
    "../../contracts/build/src/MinaGoogleKeysContract.js"
  );

  console.log("contract imported");
  const zkapps = MinaGoogleKeysContract;
  await zkapps.compile();
  console.log("contract compiled");
  const publicKey = PublicKey.fromBase58(
    // "B62qk52dWhknKVrtb3dMMNKGJo6YjaTyfCFCacQN7YvfcaF7zwmEdoY"
    // "B62qnMNvrJJGZhBynSgFe7Ep3DgCCCnqFGPqtvKqyqpLuoJfXoLTwYJ"
    // "B62qmeQWxiRAPX8Rm6QC7CGjYutfiNwuMdHaqPUK9mak9XesuBoK663"
    // "B62qpFonee79QXcRXDbtTzxV9dABsgxK1LAs6NtuaynxcZPPLrNHCz6"
    "B62qrGHXQVuU8vcoRv6M3fXtQC2MBWCGmYfxKbEd9URST1KQU2766Qa"
  );

  // const fa = await fetchAccount({ publicKey });
  // console.log("fa", fa.account);

  // const zkapp = new MinaGoogleKeysContract(serverAccount.toPublicKey());
  const zkapp = new zkapps(publicKey);
  console.log("contract created");
  const emailFields0 = Encoding.stringToFields(email)[0];

  const transaction = await Mina.transaction(
    {
      sender: serverAccount.toPublicKey(),
      fee: 100000000,
    },
    () => {
      // AccountUpdate.fundNewAccount(serverAccount.toPublicKey());
      zkapp.initState(emailFields0);
      // zkapp.initState(emailFields0);
    }
  );
  console.log("transaction created");
  await transaction.prove();
  console.log("transaction proved");

  const TxId = await transaction.sign([serverAccount]).send();

  return "https://minascan.io/testworld2/zk-tx/" + TxId.hash();
};

export const deployContract = async (email: string) => {
  // await isReady;
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

export default { sendTxs, deployContract, updateEmail };
