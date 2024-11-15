import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  ChainField,
  ChainFieldCreationArgs,
} from '../models/chain-field.model';

@Injectable()
export class ChainFieldRepository extends AbstractRepository<
  ChainField,
  ChainFieldCreationArgs
> {
  protected readonly logger = new Logger(ChainField.name);

  constructor(
    @InjectModel(ChainField)
    private chainFieldModel: typeof ChainField,
  ) {
    super(chainFieldModel);
  }
}
