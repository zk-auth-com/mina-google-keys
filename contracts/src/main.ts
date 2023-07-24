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

const JWTGOOGLETOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjY3NmRhOWQzMTJjMzlhNDI5OTMyZjU0M2U2YzFiNmU2NTEyZTQ5ODMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYmYiOjE2ODkxNjMwMzEsImF1ZCI6IjExNjA4OTAwMTI0OS1tYjE0bmJwdDFuOW8xcTFkcGJyaG82c3MyMzRpcWYxOC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsInN1YiI6IjEwMTExMTYxMDgwMzcyMjEzMTM5MyIsImVtYWlsIjoibWVobWVuYmVyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhenAiOiIxMTYwODkwMDEyNDktbWIxNG5icHQxbjlvMXExZHBicmhvNnNzMjM0aXFmMTguYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJuYW1lIjoia2xpdmxlbmQgaG9vdmVyIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGZiWjBXSFk0c1NnQUp2VThyR1pPenkwM3BYNlg1NGxQMGxSSHFGZ2x2ZT1zOTYtYyIsImdpdmVuX25hbWUiOiJrbGl2bGVuZCIsImZhbWlseV9uYW1lIjoiaG9vdmVyIiwiaWF0IjoxNjg5MTYzMzMxLCJleHAiOjE2ODkxNjY5MzEsImp0aSI6IjEwNjNmYjI3MWNiMjA2MzY1NDczYzJlMWJjMjY1ZjBjOGViNzEzOGUifQ.b9CgC8QHeyT0W18ptdpTwhaBea8NKkPUYlpdKAg2fpiJoxByHgOpCMAGmdPf2hGFGJlNr4kXiSqlFawNKzRxuuyf2Xk3rxO_8ekXEw1R03a7PvSsQjMLUaAxJ-58k4MkDoQU3mtVDc9ZZuTaqvOauWSfJnqNqpnAAV53WxTfAUqHx5TuT4I4D_eV02SEKwJTa7-F6NUuX-RAFrhOIJ48OWQGrsIz94YM5QRPxHUdldraLzof7YP2o57E57FVAOh4bOBlqNoTgANogQdo6va6HYq-Iw5TiyMJzx5LGTLjNp18umzTYLtTBitkfgtfb9PYxtCjRJd8PdJuzC3bUXIi5g'

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

const init_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
  contract.init();
});

await init_txn.prove();
await init_txn.sign([deployerAccount]).send();

console.log('initialized');

// ----------------------------------------------------

console.log('verifying...')


const response = await fetch(ORACLE_ENDPOINT)
const data = await response.json()

const email = data.data.email

const emailFields = Encoding.stringToFields(email)[0]
const signature = Signature.fromJSON(data.signature)

const verify_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
  contract.verify(
    emailFields, 
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


console.log('minting...');

const mintAmount = UInt64.from(10);

const mintSignature = Signature.create(
  zkAppPrivateKey,
  mintAmount.toFields().concat(zkAppAddress.toFields())
);

const mint_txn = await Mina.transaction(deployerAccount.toPublicKey(), () => {
  AccountUpdate.fundNewAccount(deployerAccount.toPublicKey());
  contract.mint(zkAppAddress, mintAmount, mintSignature);
});

await mint_txn.prove();
await mint_txn.sign([deployerAccount]).send();

console.log('minted');

console.log(
  contract.totalAmountInCirculation.get() +
    ' ' +
    Mina.getAccount(zkAppAddress).tokenSymbol
);

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