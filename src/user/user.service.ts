import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, constants, ec, json, stark, RpcProvider, hash, CallData, Contract } from 'starknet';
import { InjectModel } from '@nestjs/mongoose';
import * as monngoose from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: monngoose.Model<User>) { }

    async createUser(userAddress: string) {
        const user = await this.userModel.create({ userAddress: userAddress, point: 0 });
        return user
    }

    async updateUser(userAddress: string) {
        const user = await this.userModel.findOne({ userAddress: userAddress });
        if (user) {
            user.point = user.point + 1
            await user.save()
            return user;
        } else {
            return new Error('User not found');
        }
    }

    async getUserPoints(userAddress: string) {
        const user = await this.userModel.findOne({ userAddress: userAddress });
        if (user) {
            return user.point
        } else {
            return new Error('User not found');
        }
    }

    async getLeaderBoard() {
        const users = await this.userModel.find().sort({ point: -1 }).limit(10);
        return users
    }

    async getUserPointOnchain(userAddress: string) {
        const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1" });
        const testAddress = '0x07ab9cf5c0d37da685e7432d156310c76fcb7cb640844763496bf8b78de2bfa7';
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        if (testAbi === undefined) {
            throw new Error('Abi not found');
        }
        const myTestContract = new Contract(testAbi, testAddress, provider);
        const point = await myTestContract.getPoint(userAddress);
        return { userAddress: userAddress, point: point }

    }

    async getUserFreeLife(userAddress: string) {
        const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1" });
        const testAddress = '0x07ab9cf5c0d37da685e7432d156310c76fcb7cb640844763496bf8b78de2bfa7';
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        if (testAbi === undefined) {
            throw new Error('Abi not found');
        }
        const myTestContract = new Contract(testAbi, testAddress, provider);
        const point = await myTestContract.getFreeLife(userAddress);
        return point
    }

    async getUserLife(userAddress: string) {
        const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1" });
        const testAddress = '0x07ab9cf5c0d37da685e7432d156310c76fcb7cb640844763496bf8b78de2bfa7';
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        if (testAbi === undefined) {
            throw new Error('Abi not found');
        }
        const myTestContract = new Contract(testAbi, testAddress, provider);
        const point = await myTestContract.getLife(userAddress);
        return point
    }

    async getTimeRecover(userAddress: string) {
        const provider = new RpcProvider({ nodeUrl: "https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1" });
        const testAddress = '0x07ab9cf5c0d37da685e7432d156310c76fcb7cb640844763496bf8b78de2bfa7';
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        if (testAbi === undefined) {
            throw new Error('Abi not found');
        }
        const myTestContract = new Contract(testAbi, testAddress, provider);
        const time = await myTestContract.getTimeRecoverFreeLife(userAddress);
        return { userAddress: userAddress, timeRecover: time }
    }
}