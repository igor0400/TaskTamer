import { Injectable } from '@nestjs/common';
import { ChainRepository } from './repositories/chain.repository';
import { ChainField } from './models/chain-field.model';
import { getCtxData } from '../common';
import { Context } from 'telegraf';
import { InlineKeyboardMarkup } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class FinishChainService {
  constructor(private readonly chainRepository: ChainRepository) {}

  async finishChain(
    ctx: Context,
    type: string,
    userId: string,
    messageId: string,
  ) {
    let finishMessage: {
      text?: string;
      markup?: InlineKeyboardMarkup;
      isDeleteInitMess?: boolean;
    };

    const { ctxUser } = getCtxData(ctx);

    const chain = await this.chainRepository.findOne({
      where: {
        userId,
      },
      include: [ChainField],
    });
    const { fields, extraData } = chain;

    if (type === 'some') {
      //  do something
    }

    return finishMessage;
  }

  private getDataFromChainFields(fields: ChainField[]) {
    const data = {};

    for (let field of fields) {
      data[field.title] = field.userResponse
        ? String(field.userResponse)
        : undefined;
    }

    return data;
  }
}
