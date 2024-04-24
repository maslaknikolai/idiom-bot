import { Context, NarrowedContext, Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { Chat, ChatModel, Player, connectToDatabase } from 'shared';
import { Update } from 'telegraf/types';
import invariant from "tiny-invariant";
import express from 'express';

dotenv.config({ path: '../../.env' });

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const adminChatId = process.env.ADMIN_TELEGRAM_ID;
const miniAppUrl = process.env.MINI_APP_URL || '';
const webhookPort = process.env.BOT_WEBHOOK_PORT || 5045;

const bot = new Telegraf(token);

main();

async function main() {
  await connectToDatabase();

  bot.start(async (ctx) => {
    console.log('On start', ctx.update);

    if (ctx.update.message.chat.type !== 'group') {
      ctx.reply('Этот бот работает только в группах');
      return
    }

    const startUrl = `${miniAppUrl}?startapp=${ctx.update.message.chat.id}`;

    const chat = await ChatModel.findOne({ tg_id: ctx.update.message.chat.id });

    if (!chat) {
      ctx.reply('Ошибка: группа не найдена');
      return;
    }

    chat?.players.push({
      tg_id: ctx.update.message.from.id,
      name: ctx.update.message.from.first_name
    } satisfies Player);

    await chat.save();

    ctx.replyWithHTML(
      `Отлично! Теперь вы в игре. <a href="${startUrl}">Играть</a>`,
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

  const webhookServer = express();
  webhookServer.use(express.json());

  webhookServer.get('/webhook/message', async (req, res) => {
    console.log('GET /webhook/message');
    logToAdmin(`Received webhook message: ${JSON.stringify(req.body)}`);
  });

  webhookServer.listen(webhookPort, () => {
    console.log(`Server running on http://localhost:${webhookPort}`);
  });
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

  // remove chat if chat already exists
  await ChatModel.deleteOne({ tg_id: ctx.update.my_chat_member.chat.id });

  const chat = new ChatModel({
    tg_id: ctx.update.my_chat_member.chat.id,
    name: 'title' in ctx.update.my_chat_member.chat
      ? ctx.update.my_chat_member.chat.title
      : '',
    players: [],
    games: []
  } satisfies Chat);

  await chat.save();

  const addedToGroupText = `🎉 Привет, всем! Это игра для изучения английских идиом.
Каждый день мы угадываем новую идиому и получаем за это очки. В конце недели объявляется победитель.
Чтобы участвовать, напишите /start прямо в этом чате!`

  ctx.replyWithHTML(addedToGroupText);

  logToAdmin(`Добавлен в новую группу: ${chat.tg_id} - ${chat.name}`)
}

async function logToAdmin(text: string) {
  if (!adminChatId) {
    return;
  }

  await bot.telegram.sendMessage(adminChatId, text);
}