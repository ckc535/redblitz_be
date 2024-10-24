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
import { Mission, MissionName } from './schemas/mission.schema';
import { User } from 'src/user/schemas/user.schema';
import { UserMission, UserMissionStatus } from './schemas/userMission.schema';
import { Wallet } from 'src/wallet/schemas/wallet.schema';


@Injectable()
export class MissionService {
    constructor(
        @InjectModel(Mission.name) private MissionModel: monngoose.Model<Mission>,
        @InjectModel(UserMission.name) private UserMissionModel: monngoose.Model<UserMission>,
        @InjectModel(Wallet.name) private WalletModel: monngoose.Model<Wallet>,
    ) { }

    async createUserMission(userAddress: string) {
        const mission = await this.MissionModel.find();
        mission.map(async (mission) => {
            console.log(mission.mission_day)
            mission.mission_day.map(async (day) => {
                const userMission = this.UserMissionModel.create({
                    user_address: userAddress,
                    mission_id: mission._id,
                    mission_name: mission.mission_name,
                    mission_reward: mission.mission_reward,
                    status: UserMissionStatus.Pending,
                    day: day
                })
            })
            return { success: true }
        })
    }
    async resetUserMissionWeekly() {
        const update = await this.UserMissionModel.updateMany({ status: UserMissionStatus.Success }, { status: UserMissionStatus.Pending })
        return { success: true }
    }

    async createMission(missionName: MissionName, missionReward: number, missionDescription: string, missionDay: Array<number>) {
        const mission = await this.MissionModel.create({
            mission_name: missionName,
            mission_reward: missionReward,
            mission_description: missionDescription,
            mission_day: missionDay,
        });
        return mission;
    }

    async findUserMission(userAddress: string, missionName: MissionName, day: number) {
        const mission = await this.UserMissionModel.findOne({ user_address: userAddress, mission_name: missionName, day: day });
        return mission;
    }

    async findAllUserMissions(userAddress: string) {
        const missions = await this.UserMissionModel.find({ user_address: userAddress });
        let missionList = {}
        
        missions.map(mission => {
            if (!missionList[mission.day]){
                missionList[mission.day] = []
                missionList[mission.day].push(mission)
            }
            else{
                missionList[mission.day].push(mission)
            }
        })
        console.log(missionList)
        return missionList
    }

    async finishUserMission(userAddress: string, missionName: MissionName, day: number) {
        if (day != new Date().getDay()) {
            return new Error('Wrong day')
        }
        const mission = await this.UserMissionModel.findOne({ user_address: userAddress, mission_name: missionName, day: day });
        console.log('success')
        if (mission) {
            await this.UserMissionModel.updateOne({ user_address: userAddress, mission_name: missionName, day: day }, { status: UserMissionStatus.Success })
            return { success: true }
        }
        else {
            return new Error('Mission not found')
        }
    }

}