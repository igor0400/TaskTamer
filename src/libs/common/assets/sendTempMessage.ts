import { Context, Telegraf } from 'telegraf';

interface Props {
  bot: Telegraf<Context>;
  ctx: Context;
  text: string;
  isDeleteInitMess?: boolean;
  time?: number;
}

interface ChatIdProps {
  bot: Telegraf<Context>;
  chatId: string | number;
  text: string;
  isDeleteInitMess?: boolean;
  time?: number;
}

export const sendTempMessage = async ({
  bot,
  ctx,
  text,
  isDeleteInitMess = false,
  time = 3000,
}: Props) => {
  const mess = await ctx.reply(text, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  setTimeout(async () => {
    if (isDeleteInitMess) {
      try {
        await ctx.deleteMessage();
      } catch (e) {}
    }
    try {
      await bot.telegram.deleteMessage(mess.chat.id, mess.message_id);
    } catch (e) {}
  }, time);
};

export const sendTempChatIdMessage = async ({
  bot,
  chatId,
  text,
  time = 3000,
}: ChatIdProps) => {
  const mess = await bot.telegram.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });

  setTimeout(async () => {
    try {
      await bot.telegram.deleteMessage(mess.chat.id, mess.message_id);
    } catch (e) {}
  }, time);
};
