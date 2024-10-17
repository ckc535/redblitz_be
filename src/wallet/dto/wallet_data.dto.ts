import { ApiProperty } from "@nestjs/swagger";

export class WalletDataDto {
    @ApiProperty({ example: 'ckc' })
    userId: string;
    @ApiProperty({ example: '0x123' })
    address: string;
    @ApiProperty({ example: '0x123' })
    private_key: string;
    @ApiProperty({ example: '123456' })
    password: string;
}