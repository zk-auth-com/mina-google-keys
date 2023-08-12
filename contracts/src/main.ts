import { MinaGoogleKeysContract } from './MinaGoogleKeysContract.js';
import {
  Mina,
  PrivateKey,
  AccountUpdate,
  UInt64,
  Signature,
  Encoding,
} from 'snarkyjs';

console.log('SnarkyJS loaded');

const ORACLE_PUBLIC_KEY = 'B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ'

const JWTGOOGLETOKEN = 

'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjOWM3OGUzYjAwZTFiYjA5MmQyNDZjODg3YjExMjIwYzg3YjdkMjAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDExMTE2MTA4MDM3MjIxMzEzOTMiLCJlbWFpbCI6Im1laG1lbmJlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNjkxNzczODEzLCJuYW1lIjoia2xpdmxlbmQgaG9vdmVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGZiWjBXSFk0c1NnQUp2VThyR1pPenkwM3BYNlg1NGxQMGxSSHFGZ2x2ZT1zOTYtYyIsImdpdmVuX25hbWUiOiJrbGl2bGVuZCIsImZhbWlseV9uYW1lIjoiaG9vdmVyIiwibG9jYWxlIjoicnUiLCJpYXQiOjE2OTE3NzQxMTMsImV4cCI6MTY5MTc3NzcxMywianRpIjoiNTI3OTQ5NjU2ODc3NGY5MGRmMTM5YzUwOGIxYjQ5Yjc4MDQ4ZTZhNCJ9.J1qAjSUKMED5SciqHytcijhy-GEb0ACPt3cJsOxxS6r2V7vvEcce-Nf9oO6B8lHqD887PzDkhjyO5QIUdrjj0bi5tkKodK9RmEsg65RZFMIM6Z8SWJuXWRGx_ABsj315uM_PZLNlLGEYjvTISsFsKYzxZkEeGXroeV_-SUhv1tIwEHolyw4JYUzvrMQW1PDlP3DJ13LH72DFYUVw8RJuk8ecaZxZY6pYDpp4UPstDBzLKSgoGUvp3Vzf3_vaI1BPMaSQQg_zjGJx7JzYaeQpWfK8hgn17kkKRs8_bCoEUs5TOCr-EZaJ8jpxf_QqI-CQAhTdHDCUT3V_oILSGyb8Lw'

const recipient = 'B62qr9xRiL2qgiRydwzQLDcxnSwXzPUHogNK9myYVVaxNunyBAbouKo'
const nonce = '0'
// const amount = '55'

const ORACLE_ENDPOINT = `http://localhost:3030/auth/${JWTGOOGLETOKEN}`

// const ORACLE_ENDPOINTS = [
//   'http://localhost:3000/auth',
//   'http://localhost:3000/auth/jwt'
// ]

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


const response1 = await fetch(ORACLE_ENDPOINT)
const data1 = await response1.json()

const email1 = data1.data.email

const emailFields1 = Encoding.stringToFields(email1)[0]

const signature = Signature.fromJSON(data1.signature)

const amount: UInt64 = UInt64.from(1e9).div(1e9);

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
    signature ?? fail('something is wrong with the signature'))
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
