import type { ParameterizedContext } from "koa";

import axios from "axios";
import * as dotenv from "dotenv";
import { isReady, PrivateKey, Signature, Encoding } from "snarkyjs";
import crypto from 'crypto';



dotenv.config();

// We will use the NYTimes endpoint as the oracle source of truth.
// The NYTimes owns Wordle and publishes the daily wordle of the day.
const WORDLE_BACKEND_BASEURL: string =
  "https://www.googleapis.com/oauth2/v3/certs";


async function getGooglePubKeys() {
  return axios
    .get(WORDLE_BACKEND_BASEURL)
    .then((res) => res.data)
    .catch((e) => console.log("fetchWordle failed. Error:", e.message));
}

async function getSignedGooglePubKeys() {
  // return locally cached response if available
  // if (wordleCache.has(date)) return wordleCache.get(date);

  // Wait for SnarkyJS to finish loading before we can do anything
  await isReady;

  // get wordle of the specified date from backend oracle
  const { keys } = await getGooglePubKeys();

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY || "");

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey();

  // Define Field element with the date value
  // const dateFields = Encoding.stringToFields(date);

  // Define Field element with the wordle of the day
  const wordleFields = Encoding.stringToFields(keys);

  // Use private key to sign an array of Fields containing the date and wordle
  const signature = Signature.create(privateKey, [
    ...wordleFields,
  ]);

  // format response into Mina compatible signature scheme
  const res = {
    data: {  keys: keys },
    signature,
    publicKey,
  };

  return res;
}

function verifySignature(
  publicKeyPem: string,
  msg: string,
  signatureBase64: string
): boolean {
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(msg, 'utf8');
  const signature = Buffer.from(signatureBase64, 'base64');
  return verifier.verify(publicKeyPem, signature);
}

function getHash(message: string): Buffer {
  const hash = crypto.createHash('sha256');
  hash.update(message);
  return hash.digest(); // Возвращает Buffer, а не hex
}


export async function signUserData(email:string, nonce:string, ) {
 
  await isReady;

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY || "");

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey();

  const emailFields = Encoding.stringToFields(email);
  const nonceFields = Encoding.stringToFields(nonce);

  const signature = Signature.create(privateKey, [
    ...emailFields,
    ...nonceFields,
  ]);

  const res = {
    data: { email: email, nonce: nonce },
    signature,
    publicKey,
  };

  return res;
}



export async function getHandler(ctx: ParameterizedContext) {
  
  try {
    let { jwt } = ctx.params;
    if (!jwt) {
      ctx.body = await getSignedGooglePubKeys();
    }else {
      const { header, payload, hexSig, kid, nonce, email, aud } = parseJwt(jwt);
      const { keys } = await getGooglePubKeys();
      let publicKey = keys[0]['n'];
      for (let i = 0; i < keys.length; i++) {
        if (keys[i]['kid'] === kid) {
          publicKey = keys[i]['n'];
        }
      }
      
      const publicKeyPem = "-----BEGIN PUBLIC KEY-----\n" + publicKey + "\n-----END PUBLIC KEY-----";
     
      const msgHash = getHash(header + '.' + payload).toString('hex');
      console.log('msgHash', msgHash);

      const verified = verifySignature(publicKeyPem, msgHash, hexSig);
      console.log('verified', verified);
      if (verified) {
        ctx.body = await  signUserData(email, nonce);
      } else {
        ctx.throw(404);
      }
    }

  } catch (e) {
    console.log("getHandler failed. Error:", e);
    ctx.throw(404);
  }
}


function parseJwt(token: string) {
  const header = Buffer.from(token.split('.')[0], 'base64').toString();
  const payload = Buffer.from(token.split('.')[1], 'base64').toString();
  const hexSig = Buffer.from(token.split('.')[2], 'base64').toString('hex');
  const test = Buffer.from(token.split('.')[2], 'base64').toString();
// console.log('test', test, '\n\n');
  const parsedHeader = JSON.parse(header);
  const kid = parsedHeader.kid;

  const parsedPayload = JSON.parse(payload);
  const nonce = parsedPayload.nonce;
  const email = parsedPayload.email;
  const aud = parsedPayload.aud;

  return { header, payload, hexSig, kid, nonce, email, aud };
}
