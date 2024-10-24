import { ApiProperty } from "@nestjs/swagger";

export class BuyLifeDto {
    @ApiProperty({ example: '0x213213' })
    userAddress: string;
    @ApiProperty({ example: '123456' })
    password: string;
	@ApiProperty({ example: 1 })
	amount: number;
}