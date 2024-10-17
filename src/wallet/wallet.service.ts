import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, constants, ec, json, stark, RpcProvider, hash, CallData, Contract } from 'starknet';
import { InjectModel } from '@nestjs/mongoose';
import * as monngoose from 'mongoose';
import { Wallet } from './schemas/wallet.schema';

import * as bcrypt from 'bcrypt';
import { WalletDataDto } from './dto/wallet_data.dto';
import * as cryptoJS from 'crypto-js';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;

  const hashedPassword: string = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, function (err, hash) {
      if (err) reject(err)
      resolve(hash)
    });
  })

  return hashedPassword
}

@Injectable()
export class WalletService {

  constructor(@InjectModel(Wallet.name) private walletModel: monngoose.Model<Wallet>) { }

  async createWallet(userId: string, password: string) {
    const argentXaccountClassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

    // Generate public and private key pair.
    const privateKeyAX = stark.randomAddress();
    console.log(privateKeyAX)
    const pkEncrypt = cryptoJS.AES.encrypt(privateKeyAX, password).toString()
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKeyAX);

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
    // console.log(cryptoJS.AES.decrypt(pkEncrypt, password).toString(cryptoJS.enc.Utf8))
    password = await hashPassword(password);
    const walletUser = await this.walletModel.create({ userId: userId, address: starkKeyPubAX, private_key: pkEncrypt, password: password });

    return walletUser
  }

  async checkWallet(userId: string) {
    const wallet = await this.walletModel.findOne({ userId: userId });
    if (wallet) {
      return wallet;
    } else {
      return new Error('Wallet not found');
    }
  }

  async checkPassword(userId: string, password: string) {
    const wallet: WalletDataDto = await this.walletModel.findOne({ userId: userId });
    if (wallet) {
      const check = await bcrypt.compare(password, wallet.password)
      return check
    }
  }

  async deleteWallet(userId: string, password: string) {
    const wallet = await this.walletModel.findOne({ userId: userId });
    if (wallet) {
      const checkPass = await this.checkPassword(userId, password)
      if (checkPass) {
        await this.walletModel.deleteOne({ userId: userId });
        return wallet;
      }
      else {
        return new Error('Wrong password')
      }
    } else {
      return new Error('Wallet not found');
    }
  }

  async importWallet(userId: string, privateKey: string, password: string) {
    const pkEncrypt = cryptoJS.AES.encrypt(privateKey, password).toString()
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);
    password = await hashPassword(password);
    const walletUser = await this.walletModel.create({ userId: userId, address: starkKeyPub, private_key: pkEncrypt, password: password });
    return walletUser
  }

  async getUserPoints(userId: string) {
    const wallet = await this.walletModel.findOne({ userId: userId });
    if (wallet) {
      const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1' });
      const contractAddress = ""
      const { abi: testAbi } = await provider.getClassAt(contractAddress);
      const contract = new Contract(testAbi, contractAddress, provider);
      const a = contract.call('getLife', ['0x07e6a3b217d4Cd8C4d9b07D024E67146431f4d980eD43E80F03a3ffFa8ac16D4'], { parseRequest: false })
    } else {
      return new Error('Wallet not found');
    }
  }

}
