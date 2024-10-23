import { ApiProperty } from "@nestjs/swagger";
import { MissionName } from 'src/mission/schemas/mission.schema';

export class CreateMissionDto {
    @ApiProperty({ example: MissionName.LOGIN })
    mission_name: MissionName;
    @ApiProperty({ example: 100 })
    mission_reward: number;
    @ApiProperty({ example: 'Daily login mission' })
    mission_description: string;
    @ApiProperty({ example: [0, 1, 2, 3, 4, 5, 6] })
    mission_day: Array<number>;
}