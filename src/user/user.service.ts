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
import { console } from 'inspector';

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

    async createUser(user_address: string) {
        const user = await this.userModel.create({
            user_address: user_address,
            point: 0,
        });
        return user;
    }

    async updateUser(user_address: string, point: number) {
        const user = await this.userModel.findOne({ user_address: user_address });
        if (user) {
            user.point = user.point + point;
            await user.save();
            return user;
        } else {
            return new Error('User not found');
        }
    }

    async getUser(user_address: string) {
        const user = await this.userModel.findOne({ user_address: user_address });
        const userWallet = await this.WalletModle.findOne({ address: user_address });
        if (user && userWallet) {
            return { user_address:user.user_address, level: user.level, point: user.point, user_name: userWallet.user_name };
        } else {
            console.log(new Error('User not found'))
            return new Error('User not found');
        }
    }

    async getLeaderBoard(user_address:string) {
        const users = await this.userModel.aggregate([
            // Step 2: Sort by points in descending order
            { $sort: { point: -1 } },
            // Step 3: Add a rank field
            {
              $group: {
                _id: null,
                users: {
                  $push: {
                    user_address: "$user_address",
                    point: "$point",
                  },
                },
              },
            },
            {
              $project: {
                users: {
                  $map: {
                    input: { $range: [0, { $size: "$users" }] },
                    as: "index",
                    in: {
                      rank: { $add: ["$$index", 1] }, // rank starts at 1
                      user_address: { $arrayElemAt: ["$users.user_address", "$$index"] },
                      point: { $arrayElemAt: ["$users.point", "$$index"] },
                    },
                  },
                },
              },
            },
            { $unwind: "$users" },
            {
              $replaceRoot: { newRoot: "$users" },
            },
          ])
          const userRank = users.find(u => u.user_address === user_address);
        return {leaderboard: users, userRank: userRank};
    }

    async getUserPointOnchain(user_address: string) {
        const provider = new RpcProvider({
            nodeUrl:
                'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
        });
        const testAddress = process.env.CONTRACT_ADDRESS
        const { abi: testAbi } = await provider.getClassAt(testAddress);
        if (testAbi === undefined) {
            throw new Error('Abi not found');
        }
        const myTestContract = new Contract(testAbi, testAddress, provider);
        const point = await myTestContract.getPoint(user_address);
        return { user_address: user_address, point: parseInt(point.toString()) };
    }

    async getUserLife(user_address: string) {
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
        const point = await myTestContract.getLife(user_address);
        return parseInt(point.toString());
    }

    async getUserFreeLife(user_address: string) {
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
        const time = await myTestContract.getTimeRecoverFreeLife(user_address);
        let freeLife = Math.floor((Math.floor(Date.now() / 1000) - parseInt(time.toString())) / 3600);
        if (freeLife > 5) {
            freeLife = 5;
        }
        const timeRecover = 3600 - ((Math.floor(Date.now() / 1000) - parseInt(time.toString())) % 3600)
        return {
            user_address: user_address,
            timeRecover: timeRecover,
            freeLife: freeLife.toString(),
        };
    }

    async buyLife(user_address: string, password: string, amount: number) {
        const provider = new RpcProvider({
            nodeUrl:
                'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
        });
        const wallet = await this.WalletModle.findOne({ address: user_address });
        const checkPass = await this.WalletService.checkPassword(
            wallet.user_id,
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
                            amount: cairo.uint256(
                                amount *
                                parseInt(
                                    ethers.parseEther(process.env.PRICE_PER_LIFE).toString(),
                                )),
                        }),
                    },
                    {
                        contractAddress: process.env.CONTRACT_ADDRESS,
                        entrypoint: 'giveLife',
                        calldata: CallData.compile({
                            amount: amount,
                        }),
                    },
                ],
                undefined,
                { maxFee: ethers.parseEther('0.005') },
            );
            const txR = await provider.waitForTransaction(tx.transaction_hash);
            if (txR.isSuccess()) {
                await this.HistoryService.createHistory(user_address, HistoryType.BuyLife, { ticketAmount: amount }, 0);
                return { transactionStatus: true, amount: amount };
            } else {
                return new Error('Buy Failed!');
            }
        } else {
            return new Error('Wrong Password');
        }
    }

    async winLevel(user_address: string, level: number, success: number) {
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
                            user: user_address,
                            level: level,
                            success: 1,
                        }
                    ),
                },
            ]
            , undefined, { maxFee: ethers.parseEther('0.01') });
        const txR = await provider.waitForTransaction(tx.transaction_hash);
        if (txR.isSuccess()) {
            if (success) {
                const user = await this.userModel.findOne({ user_address: user_address });

                if (user.level == level) {
                    user.level = level + 1;
                    user.point = user.point + 100;
                    await user.save();
                    await this.HistoryService.createHistory(user_address, HistoryType.PlayWin, { level }, 100);
                }
                else {
                    await this.HistoryService.createHistory(user_address, HistoryType.PlayWin, { level }, 0);
                }
            }
            else {
                await this.HistoryService.createHistory(user_address, HistoryType.PlayLose, { level }, 0);
            }
        }
        else {
            return new Error('Fail')
        }
    }

    async finishDailyMission(user_address: string, missionName: MissionName) {
        const provider = new RpcProvider({
            nodeUrl:
                'https://starknet-sepolia.g.alchemy.com/v2/UpFQNJm0afOTPm3uDV0vyrMSJxA88Ws1',
        });
        const account = new Account(provider, process.env.ADMIN_ADDRESS, process.env.ADMIN_PK);
        const mission = await this.MissionService.findUserMission(user_address, missionName, new Date().getDay());
        const tx = await account.execute(
            [
                {
                    contractAddress: process.env.CONTRACT_ADDRESS,
                    entrypoint: 'rewardMission',
                    calldata: CallData.compile({
                        user_address: user_address,
                        point: mission.mission_reward,
                    })
                }
            ], undefined, { maxFee: ethers.parseEther('0.01') }
        )
        const txR = await provider.waitForTransaction(tx.transaction_hash);
        if (txR.isSuccess()) {
            await this.MissionService.finishUserMission(user_address, mission.mission_name, new Date().getDay());
            await this.HistoryService.createHistory(user_address, HistoryType.RewardMission, { mission_id: mission.mission_id, mission_name: mission.mission_name }, mission.mission_reward);

        }

    }
}
