import { Module } from '@nestjs/common';
import { BansService } from './bans.service';
import { DatabaseModule } from 'src/libs/common';
import { BanUser } from './models/ban-user.model';
import { BanUserRepository } from './repositories/ban-user.repository';

@Module({
  imports: [DatabaseModule.forFeature([BanUser])],
  providers: [BansService, BanUserRepository],
  exports: [BansService, BanUserRepository],
})
export class BansModule {}
