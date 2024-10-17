import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { create } from 'domain';
import { WalletDto } from './dto/create_wallet.dto';
import { ImportWalletDto } from './dto/import_wallet.dto';
import { ApiBody, ApiTags } from '@nestjs/swagger';


@Controller('wallets')
@ApiTags('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }
  @Get()
  findAll(): string {
    return 'This action returns all user wallet';
  }
  @Post('/create')
  create(@Body() createWalletDto: WalletDto) {
    let { userId, password } = createWalletDto;
    const result = this.walletService.createWallet(userId, password);
    return result;
  }

  @Delete('/delete')
  deleteWallet(@Body() data: WalletDto) {
    let { userId, password } = data;
    const result = this.walletService.deleteWallet(userId, password);
    return result;
  }

  @Get(':id')
  findUserWallet(@Param('id') userId: string) {
    return this.walletService.checkWallet(userId);
  }

  @Post('checkPassword')
  @ApiBody({ type: WalletDto })
  checkPasswordCorrect(@Body() data: WalletDto) {
    try {

      let { userId, password } = data;
      const result = this.walletService.checkPassword(userId, password);
      return result;
    }
    catch (error) {
      return new BadRequestException();
    }
  }

  @Post('importWallet')
  @ApiBody({ type: ImportWalletDto })
  importWallet(@Body() data: ImportWalletDto) {
    try {

      let { userId, privateKey, password } = data;
      const result = this.walletService.importWallet(userId, privateKey, password);
      return result;
    }
    catch (error) {
      return new BadRequestException();
    }
  }
}