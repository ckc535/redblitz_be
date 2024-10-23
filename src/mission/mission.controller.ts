import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { MissionService } from './mission.service';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { MissionName } from './schemas/mission.schema';
import { CreateMissionDto } from './dto/create-mission.dto';


@Controller('missions')
@ApiTags('missions')
export class MissionController {
    constructor(private readonly userService: MissionService) { }
    @Post('/createUserMission/:userAddress')
    async createPerUserMission(@Param('userAddress') userAddress: string) {
        const result = await this.userService.createUserMission(userAddress);
        return result;
    }

    @Post('/updateUserMission')
    async resetUserMission() {
        const result = await this.userService.resetUserMissionWeekly();
        return result;
    }

    @Post('/createMission')
    @ApiBody({ type: CreateMissionDto })
    async create(@Body() data: CreateMissionDto) {
        const { mission_name, mission_reward, mission_description, mission_day } = data;
        const result = await this.userService.createMission(mission_name, mission_reward, mission_description, mission_day);
        return result;
    }
}