import { Context } from 'telegraf';

export const getCtxData = (ctx: Context | any) => {
  if (ctx?.message?.from) {
    return { ctxUser: ctx?.message?.from, message: ctx?.message };
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
