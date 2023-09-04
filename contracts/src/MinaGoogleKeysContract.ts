import {
  SmartContract,
  state,
  State,
  method,
  DeployArgs,
  Permissions,
  UInt64,
  PublicKey,
  Signature,
  Field,
  Bool,
  AccountUpdate
} from 'snarkyjs';


// const tokenSymbol = 'MYTKN';
const ORACLE_PUBLIC_KEY = 'B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ'

export class MinaGoogleKeysContract extends SmartContract {
  // @state(UInt64) totalAmountInCirculation = State<UInt64>();
  @state(PublicKey) oraclePublicKey = State<PublicKey>();
  @state(Field) email = State<Field>();
  @state(UInt64) nonce = State<UInt64>();

  events = {
    verified: Bool,
    jwtToken: Field
  };

  deploy(args: DeployArgs) {
    super.deploy(args);
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    const permissionToEdit = Permissions.proof();

    this.account.permissions.set({
      ...Permissions.default(),
      editState: permissionToEdit,
      setTokenSymbol: permissionToEdit,
      send: Permissions.proofOrSignature(),
      receive: permissionToEdit,
    });
  }

  @method initState(email: Field) {
    this.email.set(email);
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    this.nonce.set(UInt64.zero);
  }


  @method changeBaseEmail(email: Field) {
    this.email.set(email);
    this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    this.nonce.set(UInt64.zero);
  }

  @method verifyAndSend(
    email: Field, 
    recipient: PublicKey,
    amount: UInt64,
    signature: Signature
    ) {
    // amount.assertGreaterThan(UInt64.from(0));
    // const senderBalance = Mina.getBalance(this.sender);
    // senderBalance.assertGreaterThanOrEqual(amount);

    
    const currentEmail = this.email.get();
    this.email.assertEquals(currentEmail);
    currentEmail.assertEquals(email);
    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);

    const validSignature = signature.verify(oraclePublicKey, [
      email,
    ]);

    validSignature.assertTrue();

    const payerUpdate = AccountUpdate.create(this.sender);
    payerUpdate.requireSignature();
    payerUpdate.send({
      to: recipient,
      amount
    })

    const currentNonce = this.nonce.get()
    this.nonce.assertEquals(currentNonce);
    const newNonce = currentNonce.add(UInt64.one);
    this.nonce.set(newNonce); 

    this.emitEvent('verified', validSignature);
  }
  
}
