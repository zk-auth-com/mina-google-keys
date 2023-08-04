var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { SmartContract, state, State, method, Permissions, UInt64, PublicKey, Signature, Field, Bool } from 'snarkyjs';
// const tokenSymbol = 'MYTKN';
const ORACLE_PUBLIC_KEY = 'B62qpkAESZiyU1cLujzipbSw7jyeLBMmNtpz36xusUPWvSXvUD23yrZ';
export class MinaGoogleKeysContract extends SmartContract {
    constructor() {
        super(...arguments);
        // @state(UInt64) totalAmountInCirculation = State<UInt64>();
        this.oraclePublicKey = State();
        this.email = State();
        this.nonce = State();
        this.events = {
            verified: Bool,
            jwtToken: Field
        };
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
    deploy(args) {
        super.deploy(args);
        const permissionToEdit = Permissions.proof();
        this.account.permissions.set({
            ...Permissions.default(),
            editState: permissionToEdit,
            setTokenSymbol: permissionToEdit,
            send: permissionToEdit,
            receive: permissionToEdit,
        });
    }
    // @method init() {
    //   super.init();
    //   // this.account.tokenSymbol.set(tokenSymbol);
    //   // this.totalAmountInCirculation.set(UInt64.zero);
    //   this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
    //   this.nonce.set(UInt64.zero);
    // }
    initState(email) {
        this.email.set(email);
        this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
        this.nonce.set(UInt64.zero);
    }
    verify(email, recipient, nonce, amount, signature) {
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.assertEquals(oraclePublicKey);
        const currentEmail = this.email.get();
        this.email.assertEquals(currentEmail);
        currentEmail.assertEquals(email);
        const validSignature = signature.verify(oraclePublicKey, [
            email,
            // recipient,
            nonce,
            // amount
        ]);
        validSignature.assertTrue();
        this.emitEvent('verified', validSignature);
    }
}
__decorate([
    state(PublicKey),
    __metadata("design:type", Object)
], MinaGoogleKeysContract.prototype, "oraclePublicKey", void 0);
__decorate([
    state(Field),
    __metadata("design:type", Object)
], MinaGoogleKeysContract.prototype, "email", void 0);
__decorate([
    state(UInt64),
    __metadata("design:type", Object)
], MinaGoogleKeysContract.prototype, "nonce", void 0);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Field]),
    __metadata("design:returntype", void 0)
], MinaGoogleKeysContract.prototype, "initState", null);
__decorate([
    method,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Field,
        Field,
        Field,
        Field,
        Signature]),
    __metadata("design:returntype", void 0)
], MinaGoogleKeysContract.prototype, "verify", null);
//# sourceMappingURL=MinaGoogleKeysContract.js.map