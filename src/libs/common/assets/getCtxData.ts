import { Context } from 'telegraf';

export const getCtxData = (ctx: Context | any) => {
  if (ctx?.message?.from) {
    return { ctxUser: ctx?.message?.from, message: ctx?.message };
  } else if (ctx?.update?.inline_query) {
    return { ctxUser: ctx?.update?.inline_query?.from };
  } else if (ctx?.update?.chosen_inline_result) {
    return { ctxUser: ctx?.update?.chosen_inline_result?.from };
  } else {
    const query = ctx?.update?.callback_query;

    return {
      ctxUser: query?.from,
      message: query?.message,
      data: query?.data,
      dataValue: query?.data?.split('::')[0],
    };
  }
};
