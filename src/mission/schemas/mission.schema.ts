
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export enum MissionName {
    LOGIN = "DailyLogin",
    PLAYGAME = "PLayGame",
    RETWEET = "Retweet",
}

export type MissionDocument = HydratedDocument<Mission>;

@Schema()
export class Mission {
    @Prop({ required: true })
    mission_name: MissionName;

    @Prop({ required: true })
    mission_reward: number

    @Prop({ required: false })
    mission_description: string

    @Prop({ required: true })
    mission_day: Array<number>

}

export const MissionSchema = SchemaFactory.createForClass(Mission);