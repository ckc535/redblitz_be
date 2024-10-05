import { Injectable } from '@nestjs/common';
import { Account, constants, ec, json, stark, RpcProvider, hash, CallData } from 'starknet';


@Injectable()
export class WalletService {
  createWallet():any{
    const argentXaccountClassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

    // Generate public and private key pair.
    const privateKeyAX = stark.randomAddress();
    console.log('AX_ACCOUNT_PRIVATE_KEY=', privateKeyAX);
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);
    console.log('AX_ACCOUNT_PUBLIC_KEY=', starkKeyPubAX);

    // Calculate future address of the ArgentX account
    const AXConstructorCallData = CallData.compile({
    owner: starkKeyPubAX,
    guardian: '0',
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPubAX,
    argentXaccountClassHash,
    AXConstructorCallData,
    0
    );
    console.log('Precalculated account address=', AXcontractAddress);
    return starkKeyPubAX
  }
}
