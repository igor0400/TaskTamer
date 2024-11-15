import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Waiter, WaiterCreationArgs } from '../models/waiter.model';

@Injectable()
export class WaitersRepository extends AbstractRepository<
  Waiter,
  WaiterCreationArgs
> {
  protected readonly logger = new Logger(Waiter.name);

  constructor(
    @InjectModel(Waiter)
    private waiterModel: typeof Waiter,
  ) {
    super(waiterModel);
  }
}
