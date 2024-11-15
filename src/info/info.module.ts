import { Module } from '@nestjs/common';
import { InfoService } from './info.service';
import { InfoUpdate } from './info.update';
import { GeneralModule } from '../general/general.module';

@Module({
  imports: [GeneralModule],
  providers: [InfoService, InfoUpdate],
})
export class InfoModule {}
