import { Module, forwardRef } from '@nestjs/common';
import { ListenersUpdate } from './listeners.update';
import { GeneralModule } from 'src/general/general.module';
import { ListenersModule } from './listeners.module';
import { ChainModule } from 'src/libs/chain/chain.module';
import { MailingsModule } from 'src/mailings/mailings.module';

@Module({
  imports: [
    forwardRef(() => GeneralModule),
    forwardRef(() => ListenersModule),
    ChainModule,
    MailingsModule,
  ],
  providers: [ListenersUpdate],
})
export class ListenersLowModule {}
