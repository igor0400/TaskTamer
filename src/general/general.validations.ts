import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { sendTempMessage } from 'src/libs/common';
import { Context, Telegraf } from 'telegraf';
import { Validations } from './types';

@Injectable()
export class GeneralValidations {
  constructor(@InjectBot() private bot: Telegraf<Context>) {}

  async startValidation(ctx: Context, validations: Validations) {
    for (let { stipulation, text } of validations) {
      if (stipulation) {
        await sendTempMessage({
          bot: this.bot,
          ctx,
          text,
          isDeleteInitMess: true,
        });
        return false;
      }
    }

    return true;
  }
}
