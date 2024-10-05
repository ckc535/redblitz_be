import { Controller, Get, Param, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}
  @Get()
  findAll(): string {
    return 'This action returns all user wallet';
  }

  @Post()
  create(@Param('id') id: string) {
    const result = this.walletService.createWallet();
    return result;
  }

}