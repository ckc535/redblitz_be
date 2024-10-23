import { ApiProperty } from "@nestjs/swagger";
import { MissionName } from "src/mission/schemas/mission.schema";

export class FinishDailyMissionDto {
    @ApiProperty({ example: '0x213213' })
    userAddress: string;
    @ApiProperty({ example: 'asdasdsa' })
    missionName: MissionName;
}