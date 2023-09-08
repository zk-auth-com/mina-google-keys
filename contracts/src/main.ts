import { MinaGoogleKeysContract } from './MinaGoogleKeysContract.js';
import {
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Bool,
  UInt64,
  Signature,
  Encoding,
} from 'o1js';

console.log('SnarkyJS loaded');

const ORACLE_PUBLIC_KEY =
  'B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ';

const JWTGOOGLETOKEN =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjgzOGMwNmM2MjA0NmMyZDk0OGFmZmUxMzdkZDUzMTAxMjlmNGQ1ZDEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIyMDU5MTQ2MjAwNTE2NzkwNzEiLCJlbWFpbCI6InBhc2hha2x5YmlrQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE2OTQxMjk0MjMsIm5hbWUiOiJQYXZlbCBLbHliaWsiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSzJsN3B5dzR5eS1sZjNnYTh5bGhhem8zelAyWDJueWY2N2lKVDQtSmNjPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlBhdmVsIiwiZmFtaWx5X25hbWUiOiJLbHliaWsiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTY5NDEyOTcyMywiZXhwIjoxNjk0MTMzMzIzLCJqdGkiOiI3YTk4MTgyNzQ2OWU5MzI5NWU1MWI2NDIwNGQwNTI4OTdiNGY3M2EzIn0.Uab92dzE2TweEKW2_tIrXwg1HL2tVS6Toj0RAm3DUmndA8-nreMxmNYQGMa_FqDDoDfnnN8usGpgid1fd1X5L9qfVhjdCU2tJJrjH4OI4nOT5y-Wmd4QsAfkdOrpR7DVltRSrLoZ5vUweLKM0KOUDyLmX42Yg6_oUHxIo6xbS1joZA4dIMV5wYKkZM8GFNPc1TeWhR4lqs-Bea5OwOyA2VAqLL0ou6HJ35kWwYHNGCW87LN8Jnzmj9NucBevi_0ClB5R5Qc-7SuteY_9m5wqRYkcys1-D9_ZUSN8f5WelH1cF_tJO0YNGRkMF-kz440vEjfQ8bWuyC6gnO-fSJz5uA';

const recipient = 'B62qr9xRiL2qgiRydwzQLDcxnSwXzPUHogNK9myYVVaxNunyBAbouKo';
const nonce = '0';
// const amount = '55'

const ORACLE_ENDPOINT = `https://mina-demo.zk-auth.com/oracle/auth/${JWTGOOGLETOKEN}`;

// const ORACLE_ENDPOINTS = [
//   'http://localhost:3000/auth',
//   'http://localhost:3000/auth/jwt'
// ]

interface signature {
  r: string;
  s: string;
}

const proofsEnabled = true;
const Local = Mina.LocalBlockchain({ proofsEnabled });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0].privateKey;
const recipientAccount = Local.testAccounts[1].privateKey;
const senderAccount = Local.testAccounts[2].privateKey;
// ----------------------------------------------------

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

console.log('compiling...');

let { verificationKey } = await MinaGoogleKeysContract.compile();

console.log('compiled');

// ----------------------------------------------------

console.log('deploying...');
const contract = new MinaGoogleKeysContract(zkAppAddress);
const deploy_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
  AccountUpdate.fundNewAccount(deployerAccount.toPublicKey());
  contract.deploy({ verificationKey, zkappKey: zkAppPrivateKey });
});
await deploy_txn.prove();
await deploy_txn.sign([deployerAccount]).send();

console.log('deployed');

// ----------------------------------------------------

console.log('initializing...');
const response0 = await fetch(ORACLE_ENDPOINT);
const data0 = await response0.json();

const email0 = data0.data.email;

const emailFields0 = Encoding.stringToFields(email0)[0];

const init_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
  contract.initState(emailFields0);
});

await init_txn.prove();
await init_txn.sign([deployerAccount]).send();

console.log('initialized');

// ----------------------------------------------------

console.log('getting info...');

const currentNonce = contract.nonce.get();

console.log(`Current nonce is ${currentNonce}`);

const oraclePublicKey = contract.oraclePublicKey.get();

console.log(`Oracle public key is ${oraclePublicKey.toBase58()}`);

const emailInField = contract.email.get();
const emailInString = Encoding.stringFromFields([emailInField]);

console.log(`Email is ${emailInString}`);

// ----------------------------------------------------

console.log('verifying and sending...');
const sign = {
  r: '3363833629330128233651788224576693951330222458872860775675028016856115168133',
  s: '25690860517388675946198652643138055228491779636793399414315724874831248703777',
} as signature;
const emailTest = 'pashaklybik@gmail.com';

const response1 = await fetch(ORACLE_ENDPOINT);
const data1 = await response1.json();

const email1 = emailTest;
// const email1 = data1.data.email

const emailFields1 = Encoding.stringToFields(email1)[0];
const signature = Signature.fromJSON(sign);
// const signature = Signature.fromJSON(data1.signature)
const amount: UInt64 = UInt64.from(1e9).div(1e9);
const oraclePubKey = PublicKey.fromBase58(ORACLE_PUBLIC_KEY);
const currentSenderBalance = Mina.getBalance(senderAccount.toPublicKey());
const currentRecipientBalance = Mina.getBalance(recipientAccount.toPublicKey());

console.log(
  `Sender's balance before transaction: ${currentSenderBalance.toString()}`
);
console.log(
  `Recipient balance before transaction: ${currentRecipientBalance.toString()}`
);
console.log(`Amount to send: ${amount.toString()}`);

let validSignature: Bool =  Bool(false);

const verify_txn = await Mina.transaction(
  {
    sender: senderAccount.toPublicKey(),
    fee: UInt64.from(1000000000).add(amount),
  },
  () => {
    validSignature = contract.verifyAndSend(
      emailFields1,
      recipientAccount.toPublicKey(),
      amount,
      signature,
      oraclePubKey
    );
  }
);

await verify_txn.prove();
await verify_txn.sign([senderAccount]).send();

console.log('verified and sent');
if (validSignature.toBoolean()) {
 
const send_txn = await Mina.transaction(
  {sender: senderAccount.toPublicKey() , fee: 100000000}, () => {
    let accountUpdate: AccountUpdate = AccountUpdate.createSigned(senderAccount.toPublicKey());
    accountUpdate.requireSignature();
    accountUpdate.send({
          to: recipientAccount.toPublicKey(),
          amount: amount,
      });
  })
  console.log('create tx')
  await send_txn.prove()
  console.log('prove tx')
  await send_txn.sign([senderAccount]).send()
  console.log('send tx')
}
  console.log('sent')
  // ----------------------------------------------------
const senderBalanceByNow = Mina.getBalance(senderAccount.toPublicKey());
const recipientBalanceByNow = Mina.getBalance(recipientAccount.toPublicKey());
const newNonce = contract.nonce.get();

console.log(
  `Sender's balance after transaction: ${senderBalanceByNow.toString()}`
);
console.log(
  `Recipient balance after transaction: ${recipientBalanceByNow.toString()}`
);
console.log(`New nonce is ${newNonce.toString()}`);

// ----------------------------------------------------

console.log('Shutting down');

