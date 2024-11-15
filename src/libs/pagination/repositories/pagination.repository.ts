import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Pagination, PaginationCreationArgs } from '../models/pagination.model';
import { DestroyOptions, FindOptions } from 'sequelize';

@Injectable()
export class PaginationRepository extends AbstractRepository<
  Pagination,
  PaginationCreationArgs
> {
  protected readonly logger = new Logger(Pagination.name);

  constructor(
    @InjectModel(Pagination)
    private paginationModel: typeof Pagination,
  ) {
    super(paginationModel);
  }

  async findByUserId(
    userId: string,
    options?: Omit<FindOptions<Pagination>, 'where'>,
  ) {
    const document = await this.paginationModel.findOne({
      where: {
        userId,
      },
      ...options,
    });

    return document as Pagination;
  }

  async destroyByUserId(
    userId: string,
    options?: Omit<DestroyOptions<Pagination>, 'where'>,
  ) {
    const document = await this.paginationModel.destroy({
      where: {
        userId,
      },
      ...options,
    });

    return document;
  }
}
