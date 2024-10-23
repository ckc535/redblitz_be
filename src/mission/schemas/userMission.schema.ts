
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';
import { MissionName } from './mission.schema';

export enum UserMissionStatus {
    Pending = "PENDING",
    Success = "SUCCESS",
}

export type UserMissionDocument = HydratedDocument<UserMission>;

@Schema({ timestamps: true })
export class UserMission {
    @Prop({ required: true })
    user_address: string;

    @Prop({ required: true })
    mission_id: string;

    @Prop({ required: true })
    mission_name: MissionName;

    @Prop({ required: true })
    mission_reward: number

    @Prop({ required: true })
    status: UserMissionStatus;

    @Prop({ required: true })
    day: number;
}

export const UserMissionSchema = SchemaFactory.createForClass(UserMission);