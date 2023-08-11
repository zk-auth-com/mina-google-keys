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
  AccountUpdate,
  Mina
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

  @method verify(
    email: Field, 
    recipient: PublicKey,
    amount: UInt64,
    signature: Signature
    ) {
    // amount.assertGreaterThan(UInt64.from(0));
    // const senderBalance = Mina.getBalance(this.sender);
    // senderBalance.assertGreaterThanOrEqual(amount);

    const oraclePublicKey = this.oraclePublicKey.get();
    this.oraclePublicKey.assertEquals(oraclePublicKey);

    const currentEmail = this.email.get();
    this.email.assertEquals(currentEmail);
    currentEmail.assertEquals(email);

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

    this.emitEvent('verified', validSignature);
  }

  // @method sendTo(destAddress: PublicKey, amount: UInt64, nonce: UInt64, oracleSign: Signature) {
  //   const oraclePublicKey = this.oraclePublicKey.get();
  //   this.oraclePublicKey.assertEquals(oraclePublicKey);
  //   /**
  //    * Future code
  //    */
    
  //   const currentNonce = this.nonce.get();
  //   this.nonce.assertEquals(currentNonce);
  //   const newNonce = currentNonce.add(UInt64.one);
  //   this.nonce.set(newNonce);
  // }

  // @method receiveD() {

  // }

  // @method mint(receiverAddress: PublicKey, amount: UInt64, adminSignature: Signature
  // ) {
  //   let totalAmountInCirculation = this.totalAmountInCirculation.get();
  //   this.totalAmountInCirculation.assertEquals(totalAmountInCirculation);

  //   let newTotalAmountInCirculation = totalAmountInCirculation.add(amount);

  //   adminSignature
  //     .verify(
  //       this.address,
  //       amount.toFields().concat(receiverAddress.toFields())
  //     )
  //     .assertTrue();

  //   this.token.mint({
  //     address: receiverAddress,
  //     amount,
  //   });

  //   this.totalAmountInCirculation.set(newTotalAmountInCirculation);
  // }

  // @method sendTokens(
  //   senderAddress: PublicKey,
  //   receiverAddress: PublicKey,
  //   amount: UInt64
  // ) {
  //   this.token.send({
  //     from: senderAddress,
  //     to: receiverAddress,
  //     amount,
  //   });
  // }
}
