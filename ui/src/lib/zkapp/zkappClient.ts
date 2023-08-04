import { Mina, PrivateKey, PublicKey, fetchAccount, Encoding, Signature, Field, UInt64 } from "snarkyjs";
import { MinaGoogleKeysContract } from "./contracts/MinaGoogleKeysContract";

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

const TX_FEE = 1e9

export default class ZkappClient {

  //first
  setContract(network: string, appKey: string) {
    console.log("Loading contract...")
    this.MinaGoogleKeysContract = MinaGoogleKeysContract;
    
    const chosedNetwork = Mina.Network(network);
    Mina.setActiveInstance(chosedNetwork);

    const publicAppKey = PublicKey.fromBase58(appKey);
    const zkApp = new this.MinaGoogleKeysContract(publicAppKey)
    this.zkApp = zkApp;
    console.log("Done!")
  }

  async initializationContract(
    email: string,
    senderPk: string
    ) {
    console.log("Compiling.contract...")
    await this.MinaGoogleKeysContract!.compile();
    console.log("Done!")

    console.log("Initialization contract...");

    const senderPrivateKey = PrivateKey.fromBase58(senderPk);
    const senderPublicKey = senderPrivateKey.toPublicKey();

    this.senderPrivateKey = senderPrivateKey;
    this.senderPublicKey = senderPublicKey;

    const emailField = this.stringToFields(email);
    const tx = await Mina.transaction({sender: this.senderPublicKey!, fee: TX_FEE}, () => {
      this.zkApp!.initState(emailField);
    })
    await tx.prove();
    
    const sendTx = await tx.sign([this.senderPrivateKey!]).send();
    this.hasBeenSetup = true;
    console.log(`https://berkeley.minaexplorer.com/transaction/${sendTx.hash()}`);
    console.log('Done!')
  }

  async verifyData(
    email: string,
    recipient: string,
    nonce: string,
    amount: string,
    sign: string
  ) {
    const emailField = this.stringToFields(email);
    const recipientField = this.stringToFields(recipient);
    const nonceField = this.stringToFields(nonce);
    const amountField = this.stringToFields(amount);
    const signature = Signature.fromBase58(sign);

    console.log("Verifying data...")
    const tx = await Mina.transaction({sender: this.senderPublicKey, fee: TX_FEE}, () => {
      this.zkApp!.verify(emailField, recipientField, nonceField, amountField, signature);
    })
    await tx.prove();

    const sendTx = await tx.sign([this.senderPrivateKey!]).send()
    console.log(`https://berkeley.minaexplorer.com/transaction/${sendTx.hash()}`);
    console.log('Done!')
  }

  stringToFields(data: string) {
    const dataFields = Encoding.stringToFields(data)[0];
    return dataFields;
  }

  fieldsToString(data: Field) {
    const dataString = Encoding.stringFromFields([data]);
    return dataString;
  }

  getStateValue(state: string) {
    const nonceValue = state === "nonce";
    const emailValue = state === "email";
    const oraclePublicKey = state === "oraclePublicKey";

    if(nonceValue) {
      const nonce = this.zkApp!.nonce.get();
      return nonce.toString()
    } else if (emailValue) {
      const email = this.zkApp!.email.get();
      return email.toString()
    } else if (oraclePublicKey) {
      const oraclePublicKey = this.zkApp!.oraclePublicKey.get();
      return oraclePublicKey.toString()
    }
  }

  hasBeenSetup: boolean;
  MinaGoogleKeysContract: null | typeof MinaGoogleKeysContract;
  zkApp: null | MinaGoogleKeysContract;
  // transaction: null | Transaction;
  senderPrivateKey: null | PrivateKey;
  senderPublicKey: PublicKey;

  constructor() {
    this.hasBeenSetup = false;
    this.MinaGoogleKeysContract = MinaGoogleKeysContract;
    this.zkApp = null;
    // this.transaction = null;
    this.senderPrivateKey = null;
    this.senderPublicKey = this.senderPrivateKey!.toPublicKey();
  }
}