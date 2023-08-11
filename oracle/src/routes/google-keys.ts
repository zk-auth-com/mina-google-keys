import type { ParameterizedContext } from "koa";

import jwt from 'jsonwebtoken';
import fetch from "node-fetch";

import axios from "axios";
import * as dotenv from "dotenv";
import { PrivateKey, Signature, Encoding } from "snarkyjs";
import crypto from "crypto";

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
  const signature = Signature.create(privateKey, [...wordleFields]);

  // format response into Mina compatible signature scheme
  const res = {
    data: { keys: keys },
    signature,
    publicKey,
  };

  return res;
}

async function verifyGoogleToken(idToken: string) {
  try {
    const response = await fetch("https://www.googleapis.com/oauth2/v1/certs");
    const keys: any = await response.json();

    const header = JSON.parse(
      Buffer.from(idToken.split(".")[0], "base64").toString()
    );

    const key = keys[header.kid];

    const payload = jwt.verify(idToken, key, {
      algorithms: ["RS256"],
      issuer: "https://accounts.google.com",
    });
  } catch (err) {
    console.log(err);
    return false;
  }

  return true;
}

function verifySignature(
  publicKeyPem: string,
  msg: string,
  signatureBase64: string
): boolean {
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(msg, "utf8");
  const signature = Buffer.from(signatureBase64, "base64");
  console.log("publicKeyPem", publicKeyPem);
  return verifier.verify(publicKeyPem, signature);
}

export async function signUserData(
  email: string,
  // recipient: string,
  // noncesc: string,
  // amount: string
  ) {

  // Load the private key of our account from an environment variable
  const privateKey = PrivateKey.fromBase58(process.env.PRIVATE_KEY || "");

  // Compute the public key associated with the private key
  const publicKey = privateKey.toPublicKey();

  const emailFields = Encoding.stringToFields(email);
  // const recipientFields = Encoding.stringToFields(recipient);
  // const nonceFields = Encoding.stringToFields(noncesc);
  // const amountFields = Encoding.stringToFields(amount);

  const signature = Signature.create(privateKey, [
    ...emailFields,
    // ...recipientFields,
    // ...nonceFields,
    // ...amountFields
  ]);

  const res = {
    data: { 
      email: email,
      // recipient: recipient,
      // nonce: noncesc, 
      // amount: amount
    },
    signature,
    publicKey,
  };

  return res;
}

export async function getHandler(ctx: ParameterizedContext) {
  try {
    let { 
      jwt, 
      // recipient, 
      // noncesc, 
      // amount 
    }
       = ctx.params;
    if (!jwt) {
      ctx.body = await getSignedGooglePubKeys();
    } else {
      const { header, payload, hexSig, kid, nonce, email, aud } = parseJwt(jwt);
      const verified = await verifyGoogleToken(jwt);

      if (verified) {
        ctx.body = await signUserData(email);
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
  const header = Buffer.from(token.split(".")[0], "base64").toString();
  const payload = Buffer.from(token.split(".")[1], "base64").toString();
  const hexSig = Buffer.from(token.split(".")[2], "base64").toString("hex");
  const test = Buffer.from(token.split(".")[2], "base64").toString();
  // console.log('test', test, '\n\n');
  const parsedHeader = JSON.parse(header);
  const kid = parsedHeader.kid;

  const parsedPayload = JSON.parse(payload);
  const nonce = parsedPayload.nonce;
  const email = parsedPayload.email;
  const aud = parsedPayload.aud;

  return { header, payload, hexSig, kid, nonce, email, aud };
}