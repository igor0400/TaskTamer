import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesUpdate } from './services.update';
import { GeneralModule } from '../general/general.module';

@Module({
  imports: [GeneralModule],
  providers: [ServicesService, ServicesUpdate],
})
export class ServicesModule {}
