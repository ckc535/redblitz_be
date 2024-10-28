import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, constants, ec, json, stark, RpcProvider, hash, CallData, Contract } from 'starknet';
import { InjectModel } from '@nestjs/mongoose';
import * as monngoose from 'mongoose';
import { Wallet } from './schemas/wallet.schema';

import * as bcrypt from 'bcrypt';
import { WalletDataDto } from './dto/wallet_data.dto';
import * as cryptoJS from 'crypto-js';
import { ethers } from 'ethers';

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

  async createWallet(user_id: string, password: string, user_name: string) {
    const argentXaccountClassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';

    // Generate public and private key pair.
    const privateKeyAX = stark.randomAddress();
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
    password = await hashPassword(password);
    const walletUser = await this.walletModel.create({ user_id: user_id, address: AXcontractAddress, private_key: pkEncrypt, password: password, user_name: user_name });

    return walletUser
  }

  async deployWallet(address: string, password: string) {
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1' });
    const user = await this.walletModel.findOne({ address: address });
    const check = this.checkPassword(user.user_id, password)
    if (!check) return new Error('Wrong Password')
    const privateKey = await cryptoJS.AES.decrypt(user.private_key, password).toString(cryptoJS.enc.Utf8)
    const starkKeyPub = ec.starkCurve.getStarkKey(privateKey)
    const accountAX = new Account(provider, address, privateKey);
    const argentXaccountClassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';
    const AXConstructorCallData = CallData.compile({
      owner: starkKeyPub,
      guardian: '0',
    });
    const AXcontractAddress = hash.calculateContractAddressFromHash(
      starkKeyPub,
      argentXaccountClassHash,
      AXConstructorCallData,
      0
    );
    const deployAccountPayload = {
      classHash: argentXaccountClassHash,
      constructorCalldata: AXConstructorCallData,
      contractAddress: AXcontractAddress,
      addressSalt: starkKeyPub,

    };

    const { transaction_hash: AXdAth, contract_address: AXcontractFinalAddress } =
      await accountAX.deployAccount(deployAccountPayload, { maxFee: ethers.parseEther('0.001') });
  }

  async checkWallet(user_id: string) {
    const wallet = await this.walletModel.findOne({ user_id: user_id });
    if (wallet) {
      return wallet;
    } else {
      return new Error('Wallet not found');
    }
  }

  async checkPassword(user_id: string, password: string) {
    const wallet: WalletDataDto = await this.walletModel.findOne({ user_id: user_id });
    if (wallet) {
      const check = await bcrypt.compare(password, wallet.password)
      return check
    }
  }

  async deleteWallet(user_id: string, password: string) {
    const wallet = await this.walletModel.findOne({ user_id: user_id });
    if (wallet) {
      const checkPass = await this.checkPassword(user_id, password)
      if (checkPass) {
        await this.walletModel.deleteOne({ user_id: user_id });
        return wallet;
      }
      else {
        return new Error('Wrong password')
      }
    } else {
      return new Error('Wallet not found');
    }
  }

  async importWallet(user_id: string, privateKey: string, password: string, user_name: string) {
    const argentXaccountClassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';
    const pkEncrypt = cryptoJS.AES.encrypt(privateKey, password).toString()
    const starkKeyPubAX = ec.starkCurve.getStarkKey(privateKey);
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
    password = await hashPassword(password);
    const walletUser = await this.walletModel.create({ user_id: user_id, address: AXcontractAddress, private_key: pkEncrypt, password: password, user_name: user_name });
    return walletUser
  }

  async getUserPoints(user_id: string) {
    const wallet = await this.walletModel.findOne({ user_id: user_id });
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
