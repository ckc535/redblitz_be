
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type HistoryDocument = HydratedDocument<History>;

export enum HistoryType {
    BuyLife = "BUYLIFE",
    PlayWin = "PLAYWIN",
    PlayLose = "PLAYLOSE",
    RewardMission = "REWARDMISSION",
}

@Schema({ timestamps: true })
export class History {
    @Prop({ type: String, required: true })
    user_address: string;

    @Prop({ type: String })
    type: HistoryType

    @Prop({ type: Object, required: true })
    detail: object;

    @Prop({ type: Number, default: 0 })
    point: number;
}

export const HistorySchema = SchemaFactory.createForClass(History);