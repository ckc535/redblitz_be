import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';


@Controller('users')
@ApiTags('user')
export class UserController {
    constructor(private readonly userService: UserService) { }
    @Post('/create')
    create(@Body() userAddress: string) {
        const result = this.userService.createUser(userAddress);
        return result;
    }

    @Post('/update')
    update(@Body() userAddress: string) {
        const result = this.userService.updateUser(userAddress);
        return result;
    }

    @Get('/getUserPoints')
    getUserPoints(@Param('userAddress') userAddress: string) {
        const result = this.userService.getUserPoints(userAddress);
        return result;
    }

    @Get('/getLeaderBoard')
    getLeaderBoard() {
        const result = this.userService.getLeaderBoard();
        return result;
    }

    @Get('/getUserPointOnchain')
    getUserPointOnchain(@Param('userAddress') userAddress: string) {
        try {
            const result = this.userService.getUserPointOnchain(userAddress);
            return result;
        }
        catch (error) {
            return new BadRequestException();
        }
    }
    @Get('/getAllUserLife')
    getAllUserLife(@Param('userAddress') userAddress: string) {
        const freeLife = this.userService.getUserFreeLife(userAddress);
        const life = this.userService.getUserLife(userAddress);
        return { userAddress, freeLife, life }
    }
}