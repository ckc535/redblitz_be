import { BadRequestException, Injectable } from '@nestjs/common';
import {
    Account,
    RpcProvider,
    CallData,
    Contract,
    cairo,
} from 'starknet';
import { InjectModel } from '@nestjs/mongoose';
import * as monngoose from 'mongoose';
import { User } from './schemas/user.schema';
import { Wallet } from 'src/wallet/schemas/wallet.schema';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';
import * as cryptoJS from 'crypto-js';
import { WalletService } from 'src/wallet/wallet.service';
import { HistoryService } from 'src/history/history.service';
import { HistoryType } from 'src/history/schemas/history.schema';
import { Mission, MissionName } from 'src/mission/schemas/mission.schema';
import { MissionService } from 'src/mission/mission.service';
import { error } from 'console';
import { EventEmitter2 } from '@nestjs/event-emitter';

dotenv.config();

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: monngoose.Model<User>,
        @InjectModel(Wallet.name) private WalletModle: monngoose.Model<Wallet>,
        private readonly HistoryService: HistoryService,
        private readonly WalletService: WalletService,
        private readonly MissionService: MissionService,
    ) { }

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

    async getUser(userAddress: string) {
        const user = await this.userModel.findOne({ userAddress: userAddress });
        if (user) {
            return user;
        } else {
            console.log(new Error('User not found'))
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
                await this.HistoryService.createHistory(userAddress, HistoryType.BuyLife, { ticketAmount: amount }, 0);
                return { transactionStatus: true, amount: amount };
            } else {
                return new Error('Buy Failed!');
            }
        } else {
            return new Error('Wrong Password');
        }
    }

    async winLevel(userAddress: string, level: number, success: boolean) {
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
                    calldata: CallData.compile(
                        {
                            userAddress: userAddress,
                            level: level,
                            success: success,
                        }
                    ),
                },
            ]
            , undefined, { maxFee: ethers.parseEther('0.01') });
        const txR = await provider.waitForTransaction(tx.transaction_hash);
        if (txR.isSuccess()) {
            if (success) {
                await this.HistoryService.createHistory(userAddress, HistoryType.PlayWin, { level }, 100);
                const user = await this.userModel.findOne({ address: userAddress });
                if (user.level == level) {
                    user.level = level + 1;
                    user.point = user.point + 100;
                    await user.save();
                }
            }
            else {
                await this.HistoryService.createHistory(userAddress, HistoryType.PlayLose, { level }, 0);
            }
        }
    }

    async finishDailyMission(userAddress: string, missionName: MissionName) {
        const provider = new RpcProvider({
            nodeUrl:
                'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
        });
        const account = new Account(provider, process.env.ADMIN_ADDRESS, process.env.ADMIN_PK);
        const mission = await this.MissionService.findUserMission(userAddress, missionName, new Date().getDay());
        if (new Date().getDay() != mission.day) {
            const tx = await account.execute(
                [
                    {
                        contractAddress: process.env.CONTRACT_ADDRESS,
                        entrypoint: 'rewardMission',
                        calldata: CallData.compile({
                            userAddress: userAddress,
                            point: cairo.uint256(mission.mission_reward),
                        })
                    }
                ], undefined, { maxFee: ethers.parseEther('0.01') }
            )
            const txR = await provider.waitForTransaction(tx.transaction_hash);
            if (txR.isSuccess()) {
                await this.MissionService.finishUserMission(userAddress, mission.mission_name, new Date().getDay());
                await this.HistoryService.createHistory(userAddress, HistoryType.RewardMission, { mission_id: mission.mission_id, mission_name: mission.mission_name }, mission.mission_reward);
            }
        }

    }
}
