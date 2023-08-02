import {Mina, PrivateKey, PublicKey, fetchAccount, Encoding} from '../../contracts/node_modules/snarkyjs'

import { BasicTokenContract } from './../../contracts/src/BasicTokenContract';

export default async function touchContract(email: string) {
    const Network = Mina.Network('https://proxy.berkeley.minaexplorer.com/graphql');
    
    Mina.setActiveInstance(Network);

    // Вставить адрес контракта
    const appKey = PublicKey.fromBase58("");

    const zkApp = new BasicTokenContract(appKey);
    await fetchAccount({publicKey: appKey});

    //Вставить адрес плательщика комиссии
    const accountPrivateKey = PrivateKey.fromBase58("");
    const accountPublicKey = accountPrivateKey.toPublicKey();

    console.log("Compiling...")
    await BasicTokenContract.compile();
    console.log("Compiled");

    const emailToField = Encoding.stringToFields(email)[0]

    const tx = await Mina.transaction({sender: accountPublicKey, fee: 0.1e9}, () => {
        zkApp.initState(emailToField);
    })
    
    console.log("Proving...")
    await tx.prove();
    console.log("Proved!")

    await tx.sign([accountPrivateKey]).send();

    const emailFromSM = Encoding.stringFromFields([zkApp.email.get()]);
    const currentNonce = zkApp.nonce.get();

    const returnData = {
        emailReturn: emailFromSM,
        nonceReturn: currentNonce
    }

    return returnData
}