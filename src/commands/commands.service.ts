import { Injectable } from '@nestjs/common';
import { commandsLocale } from './locale';
import { CommandType } from './types';
import { Context } from 'telegraf';

interface CommandsType {
  [key: string]: CommandType;
}

@Injectable()
export class CommandsService {
  constructor() {}

  inlineEventsCommands = (lang: string = 'ru'): CommandsType => ({
    create: {
      ...commandsLocale(lang).create,
      action: (...args) => this.createEventByInlineArgs(...args),
    },
  });

  async createEventByInlineArgs(args: string[]) {
    console.log('creating event by:', args);
  }

  async onTextHandler(ctx: Context) {
    // сделать валидацию, если есть слушатели ничего не делать

    // удалять лишние пробелы и переносы и делать все в lower case
    // ..
    // сначала пытаться выполнить команды, а потом если их нет выполнять create
    // // если не удается выполнить create выдавать правила создания события
  }
}

// по умолчанию команда create

// сделать команды: создай, удали, перенеси, покажи, напомни
// команду по типу затра занят (чтобы заблокировать день) или занят с 17 по 24
