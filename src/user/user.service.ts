import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Account,
  constants,
  ec,
  json,
  stark,
  RpcProvider,
  hash,
  CallData,
  Contract,
  cairo,
  transaction,
  TransactionStatus,
} from 'starknet';
import { InjectModel } from '@nestjs/mongoose';
import * as monngoose from 'mongoose';
import { User } from './schemas/user.schema';
import { Wallet } from 'src/wallet/schemas/wallet.schema';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as cryptoJS from 'crypto-js';
import { WalletService } from 'src/wallet/wallet.service';

dotenv.config();

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: monngoose.Model<User>,
    @InjectModel(Wallet.name) private WalletModle: monngoose.Model<Wallet>,
    private readonly WalletService: WalletService,
  ) {}

  async createUser(userAddress: string) {
    const user = await this.userModel.create({
      userAddress: userAddress,
      point: 0,
    });
    return user;
  }

  async updateUser(userAddress: string, point: number) {
    const user = await this.userModel.findOne({ userAddress: userAddress });
    if (user) {
      user.point = user.point + point;
      await user.save();
      return user;
    } else {
      return new Error('User not found');
    }
  }

  async getUserPoints(userAddress: string) {
    const user = await this.userModel.findOne({ userAddress: userAddress });
    if (user) {
      return user.point;
    } else {
      return new Error('User not found');
    }
  }

  async getLeaderBoard() {
    const users = await this.userModel.find().sort({ point: -1 }).limit(10);
    return users;
  }

  async getUserPointOnchain(userAddress: string) {
    const provider = new RpcProvider({
      nodeUrl:
        'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
    });
    const testAddress =
      '0x07ab9cf5c0d37da685e7432d156310c76fcb7cb640844763496bf8b78de2bfa7';
    const { abi: testAbi } = await provider.getClassAt(testAddress);
    if (testAbi === undefined) {
      throw new Error('Abi not found');
    }
    const myTestContract = new Contract(testAbi, testAddress, provider);
    const point = await myTestContract.getPoint(userAddress);
    return { userAddress: userAddress, point: parseInt(point.toString()) };
  }

  async getUserLife(userAddress: string) {
    const provider = new RpcProvider({
      nodeUrl:
        'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
    });
    const testAddress = process.env.CONTRACT_ADDRESS;
    const { abi: testAbi } = await provider.getClassAt(testAddress);
    if (testAbi === undefined) {
      throw new Error('Abi not found');
    }
    const myTestContract = new Contract(testAbi, testAddress, provider);
    const point = await myTestContract.getLife(userAddress);
    return parseInt(point.toString());
  }

  async getUserFreeLife(userAddress: string) {
    const provider = new RpcProvider({
      nodeUrl:
        'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
    });
    const testAddress = process.env.CONTRACT_ADDRESS;
    const { abi: testAbi } = await provider.getClassAt(testAddress);
    if (testAbi === undefined) {
      throw new Error('Abi not found');
    }
    const myTestContract = new Contract(testAbi, testAddress, provider);
    const time = await myTestContract.getTimeRecoverFreeLife(userAddress);
    let freeLife = Math.floor((Date.now() - parseInt(time.toString())) / 3600);
    if (freeLife > 5) {
      freeLife = 5;
    }
    console.log({
      userAddress: userAddress,
      timeRecover: time.toString(),
      freeLife: freeLife.toString(),
    });
    return {
      userAddress: userAddress,
      timeRecover: time.toString(),
      freeLife: freeLife.toString(),
    };
  }

  async buyLife(userAddress: string, password: string, amount: number) {
    const provider = new RpcProvider({
      nodeUrl:
        'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
    });
    const wallet = await this.WalletModle.findOne({ address: userAddress });
    const checkPass = await this.WalletService.checkPassword(
      wallet.userId,
      password,
    );
    if (checkPass) {
      const private_key = cryptoJS.AES.decrypt(
        wallet.private_key,
        password,
      ).toString(cryptoJS.enc.Utf8);

      const accout = new Account(provider, wallet.address, private_key);
      const tx = await accout.execute(
        [
          {
            contractAddress: process.env.TOKEN_BUY_LIFE_ADDRESS,
            entrypoint: 'approve',
            calldata: CallData.compile({
              spender: process.env.CONTRACT_ADDRESS,
              amount:
                amount *
                parseInt(
                  ethers.parseEther(process.env.PRICE_PER_LIFE).toString(),
                ),
            }),
          },
          {
            contractAddress: process.env.CONTRACT_ADDRESS,
            entrypoint: 'buyLife',
            calldata: CallData.compile({
              userAddress: userAddress,
              amount: cairo.uint256(amount),
            }),
          },
        ],
        undefined,
        { maxFee: ethers.parseEther('0.01') },
      );
      const txR = await provider.waitForTransaction(tx.transaction_hash);
      if (txR.isSuccess()) {
        return { transactionStatus: true };
      } else {
        return new Error('Buy Failed!');
      }
    } else {
      return new Error('Wrong Password');
    }
  }

  async winLevel(userAddress: string) {
    const provider = new RpcProvider({
      nodeUrl:
        'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
    });
    const account = new Account(provider, process.env.ADMIN_ADDRESS, process.env.ADMIN_PK);
    const tx = await account.execute(
        [
          {
            contractAddress: process.env.CONTRACT_ADDRESS,
            entrypoint: 'winLevel',
            calldata: CallData.compile({ userAddress: userAddress }),
          },
        ]
        , undefined,{maxFee:ethers.parseEther('0.01')});
    const txR = await provider.waitForTransaction(tx.transaction_hash);
    if (txR.isSuccess()) {
      return { transactionStatus: true };
    }
  }
}
