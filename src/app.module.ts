import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletsModule } from './wallet/wallet.module';
import { User } from './user/schemas/user.schema';
import { UsersModule } from './user/user.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://ckc535:asd123456@redblitz.pbgcx.mongodb.net/'), WalletsModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
