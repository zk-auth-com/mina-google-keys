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

'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjOWM3OGUzYjAwZTFiYjA5MmQyNDZjODg3YjExMjIwYzg3YjdkMjAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDExMTE2MTA4MDM3MjIxMzEzOTMiLCJlbWFpbCI6Im1laG1lbmJlckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNjkxNjg4MzA4LCJuYW1lIjoia2xpdmxlbmQgaG9vdmVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGZiWjBXSFk0c1NnQUp2VThyR1pPenkwM3BYNlg1NGxQMGxSSHFGZ2x2ZT1zOTYtYyIsImdpdmVuX25hbWUiOiJrbGl2bGVuZCIsImZhbWlseV9uYW1lIjoiaG9vdmVyIiwibG9jYWxlIjoicnUiLCJpYXQiOjE2OTE2ODg2MDgsImV4cCI6MTY5MTY5MjIwOCwianRpIjoiZDg3MjUzOTg3ZTNjMWIxY2ZlYmQ5ZjQwZTFlN2M3YjA0NmU1YzgzMiJ9.YoHzcFmqaMT7l_OuW7SgotX9GeklDkHNHl-yqfvukJz4mahpsCdTupfVnGTX6uHp3PKtn2zFD_kQBCHvkFAzl2w1b9FGSAYW-3zzuvR5Bn-UFGJd6Yg39z4KliAzlhJRNc3fhI5xu-pIJC_xWx2Li2I236rVyhENQC2oRqGqr_50gGs2I-__ODiir4EIL-oHha-bz-Ob0f8SBb_UnJ1ScFO9LxyQnLXEoHHQh8FEFvSqH3rhO_c6SIZKNw-E6cxM_Eif-z8p623jbJZYIyCK9jUjC17CYyFNePVSWWPYzpYadDgMPnUCMB_6nk-0Hj10Mg9bVWCO-PQa9MksSvRaXA'

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

console.log(`current nonce is ${currentNonce}`);

const oraclePublicKey = contract.oraclePublicKey.get();

console.log(`oracle public key is ${oraclePublicKey.toBase58()}`);

const emailInField = contract.email.get();
const emailInString = Encoding.stringFromFields([emailInField]);

console.log(`email is ${emailInString}`);

// ----------------------------------------------------

console.log('verifying...')


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
  contract.verify(
    emailFields1, 
    recipientAccount.toPublicKey(),
    amount,
    signature ?? fail('something is wrong with the signature'))
})

await verify_txn.prove();
await verify_txn.sign([senderAccount]).send();


console.log('verified')

const senderBalanceByNow = Mina.getBalance(senderAccount.toPublicKey())
const recipientBalanceByNow = Mina.getBalance(recipientAccount.toPublicKey())

console.log(`Sender's balance after transaction: ${senderBalanceByNow.toString()}`)
console.log(`Recipient balance after transaction: ${recipientBalanceByNow.toString()}`)

// ----------------------------------------------------

console.log('Shutting down');
