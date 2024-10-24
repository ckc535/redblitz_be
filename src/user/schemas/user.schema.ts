
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    user_address: string;

    @Prop({ default: 1 })
    level: number

    @Prop({ default: 0 })
    point: number;
}

export const UserSchema = SchemaFactory.createForClass(User);