import { Context } from 'telegraf';

export interface CommandType {
  titles: string[];
  replaceArgs: string[];
  action: (ctx: Context, args: string[]) => void | Promise<any>;
}
