import { BadRequestException, Injectable } from '@nestjs/common';
import {
    Account,
    RpcProvider,
    CallData,
    Contract,
    cairo,
} from 'starknet';
import { InjectModel } from '@nestjs/mongoose';
import * as monngoose from 'mongoose';
import { History, HistoryDocument, HistoryType } from './schemas/history.schema';


@Injectable()
export class HistoryService {
    constructor(
        @InjectModel(History.name) private HistoryModel: monngoose.Model<History>,
    ) { }
    async createHistory(userAddress: string, type: HistoryType, detail: object, point: number) {
        const history = await this.HistoryModel.create({
            userAddress,
            type,
            detail,
            point,
        });
        return history;
    }

}