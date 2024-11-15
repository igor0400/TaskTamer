import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/libs/common';
import { User } from './models/user.model';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [DatabaseModule.forFeature([User])],
  providers: [UsersService, UserRepository],
  exports: [UserRepository, UsersService],
})
export class UsersModule {}
