import { ApiProperty } from "@nestjs/swagger";
import { MissionName } from "src/mission/schemas/mission.schema";

export class FinishDailyMissionDto {
    @ApiProperty({ example: '0x213213' })
    user_address: string;
    @ApiProperty({ example: 'asdasdsa' })
    missionName: MissionName;
}