import { ApiProperty } from "@nestjs/swagger";

export class DeployWalletDto {
    @ApiProperty({ example: '0x22323' })
    user_address: string;
    @ApiProperty({ example: '123456' })
    password: string;
}