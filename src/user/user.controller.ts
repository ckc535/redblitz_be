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
    async create(@Body() userAddress: string) {
        const result = await this.userService.createUser(userAddress);
        return result;
    }

    @Post('/updateUser')
    async update(@Body() userAddress: string, point: number,) {
        const result = await this.userService.updateUser(userAddress, point);
        return result;
    }


    @Get('/getUser/:userAddress')
    @ApiParam({ name: 'userAddress', type: String })
    async getUserPoints(@Param('userAddress') userAddress: string) {
        console.log(userAddress)
        const result = await this.userService.getUser(userAddress);
        return result;
    }

    @Get('/getLeaderBoard')
    async getLeaderBoard() {
        const result = await this.userService.getLeaderBoard();
        return result;
    }

    @Get('/getUserPointOnchain/:userAddress')
    @ApiParam({ name: 'userAddress', type: String })
    async getUserPointOnchain(@Param('userAddress') userAddress: string) {
        try {
            const result = await this.userService.getUserPointOnchain(userAddress);
            return result;
        }
        catch (error) {
            return new BadRequestException();
        }
    }
    @Get('/getAllUserLife/:userAddress')
    @ApiParam({ name: 'userAddress', type: String })
    async getAllUserLife(@Param('userAddress') userAddress: string) {
        console.log(userAddress)
        const freeLife = await this.userService.getUserFreeLife(userAddress);
        const life = await this.userService.getUserLife(userAddress);
        return { userAddress, freeLife: freeLife.freeLife, life: life, recoverTime: freeLife.timeRecover }
    }

    @Post('/finishDailyMission')
    async finishDailyMission(@Body() data: FinishDailyMissionDto) {
        const { userAddress, missionName } = data;
        const result = await this.userService.finishDailyMission(userAddress, missionName);
        return result;
    }

    @Post('/buyLife')
    @ApiBody({ type: BuyLifeDto })
    async buyLife(@Body() data: BuyLifeDto) {
        const { userAddress, password, amount } = data;
        const result = await this.userService.buyLife(userAddress, password, amount);
        return result;
    }

    @Post('/playGame')
    @ApiBody({type: PlayGameDto})
    async playGame(@Body() data: PlayGameDto) {
        const { userAddress, level, success } = data;
        const result = await this.userService.winLevel(userAddress, level, success);
        return result;
    }

}