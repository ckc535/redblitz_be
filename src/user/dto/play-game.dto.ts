import { ApiProperty } from "@nestjs/swagger";

export class PlayGameDto {
    @ApiProperty({ example: '0x213213' })
    userAddress: string;
    @ApiProperty({ example: 1 })
    level: number;
	@ApiProperty({ example: true })
	success: boolean;
}