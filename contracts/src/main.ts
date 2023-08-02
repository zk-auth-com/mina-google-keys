import { BasicTokenContract } from './BasicTokenContract.js';
import {
  isReady,
  shutdown,
  Mina,
  PrivateKey,
  AccountUpdate,
  UInt64,
  Signature,
  Encoding,
} from 'snarkyjs';

await isReady;

console.log('SnarkyJS loaded');

const ORACLE_PUBLIC_KEY = 'B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ'

const JWTGOOGLETOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjkxMWUzOWUyNzkyOGFlOWYxZTlkMWUyMTY0NmRlOTJkMTkzNTFiNDQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2OTA4OTI0MTEsImF1ZCI6IjExNjA4OTAwMTI0OS1tYjE0bmJwdDFuOW8xcTFkcGJyaG82c3MyMzRpcWYxOC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMTExMTYxMDgwMzcyMjEzMTM5MyIsImVtYWlsIjoibWVobWVuYmVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoia2xpdmxlbmQgaG9vdmVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGZiWjBXSFk0c1NnQUp2VThyR1pPenkwM3BYNlg1NGxQMGxSSHFGZ2x2ZT1zOTYtYyIsImdpdmVuX25hbWUiOiJrbGl2bGVuZCIsImZhbWlseV9uYW1lIjoiaG9vdmVyIiwiaWF0IjoxNjkwODkyNzExLCJleHAiOjE2OTA4OTYzMTEsImp0aSI6IjRkMGQ0OWUxZDFkMmQwMzFmOWZkNDliMWE2ODA2ZTU3MDI3MTIxZTAifQ.1qLs-yF8q-2FxiGwZMjRBWJlPu4tuGXTLGdkqevOlDq9VY0mFVbxpDQdiBL-ip0X9BoffKrUryf_YQxjZ5glY0ueoZVeYsMwhxI9LV3_k8DVTnCR5fXoetE0d9N_u0hyZ1XRRLpOqLgyj8M4DyBEuac3dH1Mo_G1KFvKVlqPZvx2zWb4YZ1JscQ2FheTdY2pQcyWTsmcYRZPzgVmv_EllixmwEbm3r9eA8BPAptxqnzGCNLM8B9b2zoU5dGr-GUveGs6UhleW982Mv8janqNH_FyARYZCMBihyo4q_7zjJbdPJBROuu6g-uGxTrnNto2MjwNkh3JWXEk2qSli16Qjg'

const ORACLE_ENDPOINT = `http://localhost:3030/auth/${JWTGOOGLETOKEN}`

// const ORACLE_ENDPOINTS = [
//   'http://localhost:3000/auth',
//   'http://localhost:3000/auth/jwt'
// ]

const proofsEnabled = false;
const Local = Mina.LocalBlockchain({ proofsEnabled });
Mina.setActiveInstance(Local);
const deployerAccount = Local.testAccounts[0].privateKey;
// ----------------------------------------------------

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

console.log('compiling...');

let { verificationKey } = await BasicTokenContract.compile();

console.log('compiled');

// ----------------------------------------------------

console.log('deploying...');
const contract = new BasicTokenContract(zkAppAddress);
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

const verify_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
  contract.verify(
    emailFields1, 
    signature ?? fail('something is wrong with the signature'))
})

await verify_txn.prove();
await verify_txn.sign([deployerAccount]).send();


console.log('verified')

// console.log('Seting JWT token...')

// const jwtTokenToField = Encoding.stringToFields(JWTGOOGLETOKEN)

// const setJWTTokenTx = await Mina.transaction(deployerAccount.toPublicKey(), () => {
//   contract.setJWTToken(jwtTokenToField)
// })

// await setJWTTokenTx.prove();
// await setJWTTokenTx.sign([deployerAccount]).send();

// const jwtTokenFromSmartContractField = contract.jwtGoogleToken.get()
// const jwtTokenFromFieldToString = Encoding.stringFromFields(jwtTokenFromSmartContractField)

// console.log('JWT Token was seted successfull')
// console.log(`JWT Google Token: ${jwtTokenFromFieldToString.toString()}`)


// console.log('minting...');

// const mintAmount = UInt64.from(10);

// const mintSignature = Signature.create(
//   zkAppPrivateKey,
//   mintAmount.toFields().concat(zkAppAddress.toFields())
// );

// const mint_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
//   AccountUpdate.fundNewAccount(deployerAccount.toPublicKey());
//   contract.mint(zkAppAddress, mintAmount, mintSignature);
// });

// await mint_txn.prove();
// await mint_txn.sign([deployerAccount]).send();

// console.log('minted');

// console.log(
//   contract.totalAmountInCirculation.get() +
//     ' ' +
//     Mina.getAccount(zkAppAddress).tokenSymbol
// );

// ----------------------------------------------------

// console.log('sending...');

// const sendAmount = UInt64.from(3);

// const send_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
//   AccountUpdate.fundNewAccount(deployerAccount.toPublicKey());
//   contract.sendTokens(zkAppAddress, deployerAccount.toPublicKey(), sendAmount);
// });
// await send_txn.prove();
// await send_txn.sign([deployerAccount]).send();

// console.log('sent');

// console.log(
//   contract.totalAmountInCirculation.get() +
//     ' ' +
//     Mina.getAccount(zkAppAddress).tokenSymbol
// );

// // ----------------------------------------------------

// console.log(
//   'deployer tokens:',
//   Mina.getBalance(
//     deployerAccount.toPublicKey(),
//     contract.token.id
//   ).value.toBigInt()
// );

// console.log(
//   'zkapp tokens:',
//   Mina.getBalance(zkAppAddress, contract.token.id).value.toBigInt()
// );

// ----------------------------------------------------

console.log('Shutting down');

await shutdown();