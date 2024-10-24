import { ApiProperty } from "@nestjs/swagger";

export class PlayGameDto {
    @ApiProperty({ example: '0x213213' })
    user_address: string;
    @ApiProperty({ example: 1 })
    level: number;
    @ApiProperty({ example: 1 })
    success: number;
}