import { SmartContract, State, DeployArgs, UInt64, PublicKey, Signature, Field } from 'snarkyjs';
export declare class MinaGoogleKeysContract extends SmartContract {
    oraclePublicKey: State<PublicKey>;
    email: State<import("snarkyjs/dist/node/lib/field").Field>;
    nonce: State<UInt64>;
    events: {
        verified: typeof import("snarkyjs/dist/node/lib/bool").Bool & ((x: boolean | import("snarkyjs/dist/node/lib/bool").Bool | import("snarkyjs/dist/node/lib/field").FieldVar) => import("snarkyjs/dist/node/lib/bool").Bool);
        jwtToken: typeof import("snarkyjs/dist/node/lib/field").Field & ((x: string | number | bigint | import("snarkyjs/dist/node/lib/field").Field | import("snarkyjs/dist/node/lib/field").FieldVar | Uint8Array) => import("snarkyjs/dist/node/lib/field").Field);
    };
    deploy(args: DeployArgs): void;
    initState(email: Field): void;
    verify(email: Field, recipient: Field, nonce: Field, amount: Field, signature: Signature): void;
}
