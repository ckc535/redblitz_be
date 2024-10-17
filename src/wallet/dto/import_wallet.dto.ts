import { ApiProperty } from "@nestjs/swagger";

export class ImportWalletDto {
    @ApiProperty({ example: 'ckc' })
    userId: string;
    @ApiProperty({ example: '0x123' })
    privateKey: string;
    @ApiProperty({ example: '123456' })
    password: string;
}

