import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletSchema } from './schemas/wallet.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Wallet', schema: WalletSchema }])],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletsModule { }