import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiOAuth2, ApiParam, ApiTags } from '@nestjs/swagger';
import { FinishDailyMissionDto } from './dto/finish-daily-mission.dto';
import { MissionName } from 'src/mission/schemas/mission.schema';
import { BuyLifeDto } from './dto/buy-life.dto';
import { PlayGameDto } from './dto/play-game.dto';


@Controller('users')
@ApiTags('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post('/create')
    async create(@Body() user_address: string) {
        const result = await this.userService.createUser(user_address);
        return result;
    }

    @Post('/updateUser')
    async update(@Body() user_address: string, point: number,) {
        const result = await this.userService.updateUser(user_address, point);
        return result;
    }


    @Get('/getUser/:user_address')
    @ApiParam({ name: 'user_address', type: String })
    async getUserPoints(@Param('user_address') user_address: string) {
        console.log(user_address)
        const result = await this.userService.getUser(user_address);
        return result;
    }

    @Get('/getLeaderBoard/:user_address')
    @ApiParam({ name: 'user_address', type: String })
    async getLeaderBoard(@Param('user_address') user_address: string) {
        console.log(user_address)
        const result = await this.userService.getLeaderBoard(user_address);
        return result;
    }

    @Get('/getUserPointOnchain/:user_address')
    @ApiParam({ name: 'user_address', type: String })
    async getUserPointOnchain(@Param('user_address') user_address: string) {
        try {
            const result = await this.userService.getUserPointOnchain(user_address);
            return result;
        }
        catch (error) {
            return new BadRequestException();
        }
    }
    @Get('/getAllUserLife/:user_address')
    @ApiParam({ name: 'user_address', type: String })
    async getAllUserLife(@Param('user_address') user_address: string) {
        const freeLife = await this.userService.getUserFreeLife(user_address);
        const life = await this.userService.getUserLife(user_address);
        return { user_address, freeLife: freeLife.freeLife, life: life, recoverTime: freeLife.timeRecover }
    }

    @Post('/finishDailyMission')
    async finishDailyMission(@Body() data: FinishDailyMissionDto) {
        const { user_address, missionName } = data;
        const result = await this.userService.finishDailyMission(user_address, missionName);
        return result;
    }

    @Post('/buyLife')
    @ApiBody({ type: BuyLifeDto })
    async buyLife(@Body() data: BuyLifeDto) {
        const { user_address, password, amount } = data;
        const result = await this.userService.buyLife(user_address, password, amount);
        return result;
    }

    @Post('/playGame')
    @ApiBody({ type: PlayGameDto })
    async playGame(@Body() data: PlayGameDto) {
        const { user_address, level, success } = data;
        const result = await this.userService.winLevel(user_address, level, success);
        return result;
    }

}