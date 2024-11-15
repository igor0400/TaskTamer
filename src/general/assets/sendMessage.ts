import { formatHTML, replyPhoto } from 'src/libs/common';
import { Context, Telegraf } from 'telegraf';
import {
  InlineKeyboardMarkup,
  ParseMode,
} from 'telegraf/typings/core/types/typegram';

export interface SendMessageSettings {
  ctx?: Context;
  bot?: Telegraf<Context>;
  type?: 'send' | 'edit';
  parse_mode?: ParseMode;
  isBanner?: boolean;
  reply_markup?: InlineKeyboardMarkup;
  chatId?: string | number;
  messageId?: number;
  inlineMessageId?: string;
  reply_to_message_id?: number;
  bannerUrl?: string;
}

export const sendMessage = async (
  message: string,
  {
    ctx,
    bot,
    type = 'edit',
    parse_mode = 'HTML',
    isBanner = true,
    reply_markup,
    chatId,
    messageId,
    inlineMessageId,
    bannerUrl,
    ...extra
  }: SendMessageSettings,
) => {
  try {
    const formatedMessage = formatHTML(message);
    const messageExtra = {
      ...extra,
      parse_mode,
      reply_markup,
      disable_web_page_preview: true,
    };

    let isHaveBanner = isBanner;

    if (bannerUrl) isHaveBanner = true;

    const defaultPhoto = replyPhoto();

    let validBanner: { url: string };

    if (bannerUrl) {
      if (bannerUrl[0] === '/') {
        validBanner = { url: `${process.env?.BACKEND_URL}${bannerUrl}` };
      } else {
        validBanner = { url: bannerUrl };
      }
    }

    const photoData = validBanner ? validBanner : defaultPhoto;

    if (!photoData?.url) {
      isHaveBanner = false;
    }

    if (ctx) {
      if (type === 'edit') {
        if (isHaveBanner) {
          return await ctx.editMessageCaption(formatedMessage, messageExtra);
        } else {
          return await ctx.editMessageText(formatedMessage, messageExtra);
        }
      } else {
        if (isHaveBanner) {
          return await ctx.sendPhoto(photoData, {
            ...messageExtra,
            caption: formatedMessage,
          });
        } else {
          return await ctx.sendMessage(formatedMessage, messageExtra);
        }
      }
    }

    if (bot) {
      if (type === 'edit') {
        if (isHaveBanner) {
          return await bot.telegram.editMessageCaption(
            chatId,
            messageId,
            inlineMessageId,
            formatedMessage,
            messageExtra,
          );
        } else {
          return await bot.telegram.editMessageText(
            chatId,
            messageId,
            inlineMessageId,
            formatedMessage,
            messageExtra,
          );
        }
      } else {
        if (isHaveBanner) {
          return await bot.telegram.sendPhoto(chatId, photoData, {
            ...messageExtra,
            caption: formatedMessage,
          });
        } else {
          return await bot.telegram.sendMessage(
            chatId,
            formatedMessage,
            messageExtra,
          );
        }
      }
    }
  } catch (e) {
    console.log('sendMessage error:', e);
  }
};
