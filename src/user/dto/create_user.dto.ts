import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: '0x213213' })
    user_address: string;
    @ApiProperty({ example: '123456' })
    password: string;
}