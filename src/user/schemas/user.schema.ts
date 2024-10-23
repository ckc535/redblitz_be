
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    userAddress: string;

    @Prop({ default: 0 })
    level: number

    @Prop({ default: 0 })
    point: number;
}

export const UserSchema = SchemaFactory.createForClass(User);