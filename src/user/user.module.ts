import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UserMissionSchema } from 'src/mission/schemas/userMission.schema';
import { HistorySchema } from 'src/history/schemas/history.schema';
import { Mission, MissionSchema } from 'src/mission/schemas/mission.schema';
import { MissionService } from 'src/mission/mission.service';
import { HistoryService } from 'src/history/history.service';
import { WalletService } from 'src/wallet/wallet.service';
import { WalletSchema } from 'src/wallet/schemas/wallet.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Wallet', schema: WalletSchema }, { name: 'Mission', schema: MissionSchema }, { name: "History", schema: HistorySchema }, { name: "UserMission", schema: UserMissionSchema }])],
    controllers: [UserController],
    providers: [UserService, HistoryService, MissionService, WalletService],

})
export class UsersModule { }