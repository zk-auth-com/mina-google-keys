import { MinaGoogleKeysContract } from './MinaGoogleKeysContract.js';
import {
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  UInt64,
  Signature,
  Encoding,
} from 'snarkyjs';

console.log('SnarkyJS loaded');

const ORACLE_PUBLIC_KEY = 'B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ'

const JWTGOOGLETOKEN = 

'eyJhbGciOiJSUzI1NiIsImtpZCI6IjgzOGMwNmM2MjA0NmMyZDk0OGFmZmUxMzdkZDUzMTAxMjlmNGQ1ZDEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIyMDU5MTQ2MjAwNTE2NzkwNzEiLCJlbWFpbCI6InBhc2hha2x5YmlrQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE2OTM5NTA2MDQsIm5hbWUiOiJQYXZlbCBLbHliaWsiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUFjSFR0ZU5aQnNFVDctT1JSVWE1VzdsWVJnQVV4dnJxZWVpeHp3WVV4RjdwMGstPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6IlBhdmVsIiwiZmFtaWx5X25hbWUiOiJLbHliaWsiLCJsb2NhbGUiOiJlbi1HQiIsImlhdCI6MTY5Mzk1MDkwNCwiZXhwIjoxNjkzOTU0NTA0LCJqdGkiOiI1Yzk2ZDI4OTU3YWNlMGZhNzdlMmJhNTI0MDkyZDdmOWMwNGMwZmI3In0.DTJ9ZfFsVyJoELU3UF2662EthZ8lgG02QQ0vNt_6_MMMiNU3Hj5QuIxrHnUaAUF1LX376JsBmrgIm4m1fCe_DV29kgpAzclAF63nGLqaXuBH2x7ZRgE-nQuC-bcxeyR_jNcYQ7SDW-VzX_JQvBWaTwjNbhcoHtTw9UOSF2ivd-NbOmjrvIYg6g15RF2AB8-f7ehRy-ZCIx0iTCkmLbi5WI0apRZJzBPCAcLVSArvtGoo5SUvFqqqMzynkDHhNMy55FNj5d5PYE65QJkoOp_4qiAvP7lcvRd7J7SWQsXAW_A1R-sX6st5-FjL3AgPQ_bGWK70kO-DAgwftwzsv2hUyA'

const recipient = 'B62qr9xRiL2qgiRydwzQLDcxnSwXzPUHogNK9myYVVaxNunyBAbouKo'
const nonce = '0'
// const amount = '55'

const ORACLE_ENDPOINT = `https://mina-demo.zk-auth.com/oracle/auth/${JWTGOOGLETOKEN}`

// const ORACLE_ENDPOINTS = [
//   'http://localhost:3000/auth',
//   'http://localhost:3000/auth/jwt'
// ]

interface signature {
  r: string;
  s: string;
}

const proofsEnabled = false;
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
const response0 = await fetch(ORACLE_ENDPOINT)
const data0 = await response0.json()

const email0 = data0.data.email

const emailFields0 = Encoding.stringToFields(email0)[0]


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

console.log('verifying and sending...')
const sign = {
  r: "3363833629330128233651788224576693951330222458872860775675028016856115168133",
  s: "25690860517388675946198652643138055228491779636793399414315724874831248703777",
} as signature;
const emailTest = "pashaklybik@gmail.com";

const response1 = await fetch(ORACLE_ENDPOINT)
const data1 = await response1.json()

const email1 = emailTest
// const email1 = data1.data.email

const emailFields1 = Encoding.stringToFields(email1)[0]
const signature = Signature.fromJSON(sign)
// const signature = Signature.fromJSON(data1.signature)
const amount: UInt64 = UInt64.from(1e9).div(1e9);
const oraclePubKey = PublicKey.fromBase58(ORACLE_PUBLIC_KEY);
const currentSenderBalance = Mina.getBalance(senderAccount.toPublicKey())
const currentRecipientBalance = Mina.getBalance(recipientAccount.toPublicKey())

console.log(`Sender's balance before transaction: ${currentSenderBalance.toString()}`)
console.log(`Recipient balance before transaction: ${currentRecipientBalance.toString()}`)
console.log(`Amount to send: ${amount.toString()}`)

const verify_txn = await Mina.transaction(senderAccount.toPublicKey(), () => {
  contract.verifyAndSend(
    emailFields1, 
    recipientAccount.toPublicKey(),
    amount,
    signature ?? fail('something is wrong with the signature'), 
    oraclePubKey)
})

await verify_txn.prove();
await verify_txn.sign([senderAccount]).send();


console.log('verified and sent')

const senderBalanceByNow = Mina.getBalance(senderAccount.toPublicKey())
const recipientBalanceByNow = Mina.getBalance(recipientAccount.toPublicKey())
const newNonce = contract.nonce.get()

console.log(`Sender's balance after transaction: ${senderBalanceByNow.toString()}`)
console.log(`Recipient balance after transaction: ${recipientBalanceByNow.toString()}`)
console.log(`New nonce is ${newNonce.toString()}`)

// ----------------------------------------------------

console.log('Shutting down');
