import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet {
  @Prop()
  userId: string;

  @Prop()
  address: string;


  @Prop()
  private_key: string;

  @Prop()
  password: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);