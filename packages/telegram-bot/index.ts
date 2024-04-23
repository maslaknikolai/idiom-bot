import { Context, Markup, NarrowedContext, Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { Chat, ChatModel, connectToDatabase } from 'shared';
import mongoose from 'shared/mongooseDB';
import { ChatMemberUpdated, Update } from 'telegraf/types';
import invariant from "tiny-invariant";

dotenv.config({ path: '../../.env' });

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const adminChatId = process.env.ADMIN_TELEGRAM_ID;
const miniAppUrl = process.env.MINI_APP_URL || '';

const addedToGroupText = `🎉 Привет, всем! Это игра для изучения английских идиом.
Каждый день мы угадываем новую идиому и получаем за это очки. В конце недели объявляется победитель.
Чтобы участвовать, напишите /start прямо в этом чате!`

const playerAddedText = `Отлично! Теперь вы в игре. Чтобы играть нажмите на кнопку`

const bot = new Telegraf(token);

main();

async function main() {
  await connectToDatabase();

  bot.start((ctx) => {
    console.log('On start', ctx.update);

    ctx.replyWithHTML(
      playerAddedText,
      Markup.inlineKeyboard([
        Markup.button.url('Перейти в Mini App', miniAppUrl)
      ])
    )
  });

  bot.on('text', (ctx) => {
    console.log('On message', ctx);
    ctx.reply(JSON.stringify(ctx.update, null, 2));
  });

  bot.on('my_chat_member', async (ctx) => {
    if (ctx.update.my_chat_member.new_chat_member.status === 'left') {
      await onRemoveFromGroup(ctx);
      return;
    }

    await onAddToGroup(ctx);
  });

  bot.catch((err, ctx) => {
    console.log('Error handling update', err);
  });

  console.log('Bot has been started...');
  bot.launch();
}

async function onRemoveFromGroup(ctx: NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>) {
  try {
    const chatId = ctx.update.my_chat_member.chat.id;
    const chat = await ChatModel.findOne({ tg_id: chatId });
    logToAdmin(`Удален из группы: ${chatId}, ${chat?.name}`)
    await ChatModel.deleteOne({ tg_id: chatId });
  } catch (error) {
    console.error('Error handling onRemoveFromGroup', error);
    const errorString = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'unknown';
    logToAdmin(`Ошибка при удалении из группы: ${errorString}`)
  }
}

async function onAddToGroup(ctx: NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>) {
  console.log(`Added to group`, ctx.update);
  invariant(ctx.update.my_chat_member.chat.id, 'Chat ID is required')

  const chat = new ChatModel({
    tg_id: ctx.update.my_chat_member.chat.id,
    name: 'title' in ctx.update.my_chat_member.chat
      ? ctx.update.my_chat_member.chat.title
      : '',
    players: [],
    games: []
  } satisfies Chat);

  await chat.save();

  ctx.replyWithHTML(
    addedToGroupText,
    Markup.inlineKeyboard([
      Markup.button.url('Перейти в Mini App', miniAppUrl)
    ])
  );

  logToAdmin(`Добавлен в новую группу: ${chat.tg_id} - ${chat.name}`)
}

async function logToAdmin(text: string) {
  if (!adminChatId) {
    return;
  }

  await bot.telegram.sendMessage(adminChatId, text);
}