import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { HistorySchema } from './schemas/history.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'History', schema: HistorySchema }])],
    controllers: [],
    providers: [HistoryService],
    exports: [HistoryService]
})
export class WalletsModule { }