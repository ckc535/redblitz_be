import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema()
export class Wallet {
  @Prop()
  id: string;

  @Prop()
  address: number;

  @Prop()
  private_key: string;

  @Prop()
  password: string;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);