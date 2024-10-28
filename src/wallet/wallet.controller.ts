import { BadRequestException, Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { create } from 'domain';
import { WalletDto } from './dto/create_wallet.dto';
import { ImportWalletDto } from './dto/import_wallet.dto';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { DeployWalletDto } from './dto/deploy-wallet.dto';


@Controller('wallets')
@ApiTags('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) { }
  @Get()
  findAll(): string {
    return 'This action returns all user wallet';
  }
  @Post('/create')
  @ApiBody({ type: WalletDto })
  create(@Body() createWalletDto: WalletDto) {
    let { user_id, password, user_name } = createWalletDto;
    const result = this.walletService.createWallet(user_id, password, user_name);
    return result;
  }

  @Post('deployWallet')
  @ApiBody({ type: DeployWalletDto })
  deployWallet(@Body() createWalletDto: DeployWalletDto) {
    let { user_address, password } = createWalletDto;
    const result = this.walletService.deployWallet(user_address, password);
    return result;
  }

  @Delete('/delete')
  @ApiBody({ type: WalletDto })
  deleteWallet(@Body() data: WalletDto) {
    let { user_id, password } = data;
    const result = this.walletService.deleteWallet(user_id, password);
    return result;
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  findUserWallet(@Param('id') user_id: string) {
    return this.walletService.checkWallet(user_id);
  }

  @Post('checkPassword')
  @ApiBody({ type: WalletDto })
  checkPasswordCorrect(@Body() data: WalletDto) {
    try {

      let { user_id, password } = data;
      const result = this.walletService.checkPassword(user_id, password);
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

      let { user_id, privateKey, password } = data;
      const result = this.walletService.importWallet(user_id, privateKey, password);
      return result;
    }
    catch (error) {
      return new BadRequestException();
    }
  }
}