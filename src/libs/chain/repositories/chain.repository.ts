import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chain, ChainCreationArgs } from '../models/chain.model';

@Injectable()
export class ChainRepository extends AbstractRepository<
  Chain,
  ChainCreationArgs
> {
  protected readonly logger = new Logger(Chain.name);

  constructor(
    @InjectModel(Chain)
    private chainModel: typeof Chain,
  ) {
    super(chainModel);
  }
}
