import { Module, forwardRef } from '@nestjs/common';
import { MenuUpdate } from './menu.update';
import { MenuService } from './menu.service';
import { GeneralModule } from '../general/general.module';

@Module({
  imports: [forwardRef(() => GeneralModule)],
  providers: [MenuService, MenuUpdate],
  exports: [MenuService],
})
export class MenuModule {}
