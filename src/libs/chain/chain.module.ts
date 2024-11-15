import { Module, forwardRef } from '@nestjs/common';
import { ChainService } from './chain.service';
import { ChainRepository } from './repositories/chain.repository';
import { ChainFieldRepository } from './repositories/chain-field.repository';
import { DatabaseModule } from '../common';
import { Chain } from './models/chain.model';
import { ChainField } from './models/chain-field.model';
import { UsersModule } from 'src/users/users.module';
import { GeneralModule } from 'src/general/general.module';
import { MenuModule } from 'src/menu/menu.module';
import { ChainUpdate } from './chain.update';
import { FilesModule } from 'src/files/files.module';
import { FinishChainService } from './finish-chain.service';

@Module({
  imports: [
    DatabaseModule.forFeature([Chain, ChainField]),
    forwardRef(() => UsersModule),
    forwardRef(() => GeneralModule),
    forwardRef(() => MenuModule),
    FilesModule,
  ],
  providers: [
    ChainService,
    ChainRepository,
    ChainFieldRepository,
    ChainUpdate,
    FinishChainService,
  ],
  exports: [ChainService, ChainRepository, ChainFieldRepository],
})
export class ChainModule {}
