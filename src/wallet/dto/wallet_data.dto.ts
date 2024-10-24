import { ApiProperty } from "@nestjs/swagger";

export class WalletDataDto {
    @ApiProperty({ example: 'ckc', required: true })
    user_id: string;
    @ApiProperty({ example: '0x123', required: true })
    address: string;
    @ApiProperty({ example: 'ckc' })
    user_name: string;
    @ApiProperty({ example: '0x123', required: true })
    private_key: string;
    @ApiProperty({ example: '123456', required: true })
    password: string;
}