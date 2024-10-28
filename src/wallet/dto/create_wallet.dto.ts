import { ApiProperty } from "@nestjs/swagger";

export class WalletDto {
    @ApiProperty({ example: 'ckc' })
    user_id: string;
    @ApiProperty({ example: '123456' })
    password: string;
    @ApiProperty({ example: 'ckcne' })
    user_name: string;
}