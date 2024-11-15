import { SendMessageSettings } from 'src/general';
import { Context } from 'telegraf';

export interface CreateChainType {
  type: string;
  ctx: Context;
  isCancel?: boolean;
  fields: {
    title: string;
    text: string;
    cancelBtnCallbackData?: string;
    type?: 'text' | 'image' | 'file';
    isSkip?: boolean;
    validations?: string;
  }[];
  extraData?: string;
  messageExtraSettings?: SendMessageSettings;
}
