import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/libs/common';
import { UserRoles } from './models/user-roles.model';
import { UserRolesRepository } from './repositories/user-roles.repository';

@Module({
  imports: [DatabaseModule.forFeature([UserRoles])],
  providers: [UserRolesRepository],
  exports: [UserRolesRepository],
})
export class RolesModule {}
