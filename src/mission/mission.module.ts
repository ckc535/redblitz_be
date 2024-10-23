import { Module } from '@nestjs/common';
import { MissionController } from './mission.controller';
import { MissionService } from './mission.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { MissionSchema } from './schemas/mission.schema';
import { UserMissionSchema } from './schemas/userMission.schema';
import { WalletSchema } from 'src/wallet/schemas/wallet.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Mission', schema: MissionSchema }, { name: 'UserMission', schema: UserMissionSchema }, { name: 'Wallet', schema: WalletSchema }])],
    controllers: [MissionController],
    providers: [MissionService],
    exports: [MissionService]
})
export class MissionsModule { }