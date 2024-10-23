import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { FinishDailyMissionDto } from './dto/finish-daily-mission.dto';
import { MissionName } from 'src/mission/schemas/mission.schema';


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


    @Get('/getUserPoints/:userAddress')
    @ApiParam({ name: 'userAddress', type: String })
    async getUserPoints(@Param('userAddress') userAddress: string) {
        console.log(userAddress)
        const result = await this.userService.getUserPoints(userAddress);
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
        const result = await this.userService.finishDailyMission(userAddress, MissionName.LOGIN);
        return result;
    }

}