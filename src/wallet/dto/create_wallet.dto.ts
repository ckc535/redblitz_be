import { ApiProperty } from "@nestjs/swagger";

export class WalletDto {
    @ApiProperty({ example: 'ckc' })
    userId: string;
    @ApiProperty({ example: '123456' })
    password: string;
}