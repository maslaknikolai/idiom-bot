import { Context, NarrowedContext, Telegraf } from 'telegraf';
import dotenv from 'dotenv';
import { Chat, ChatModel, Idiom, IdiomModel, Player, connectToDatabase } from 'shared';
import { Update } from 'telegraf/types';
import invariant from "tiny-invariant";
import express from 'express';
import { logToAdmin } from './logToAdmin';
import { updateDailyIdiom } from './updateDailyIdiom';

dotenv.config({ path: '../../.env' });

const token = process.env.TELEGRAM_BOT_TOKEN || '';
const miniAppUrl = process.env.MINI_APP_URL || '';
const webhookPort = process.env.BOT_WEBHOOK_PORT || 5175;

export const bot = new Telegraf(token);

main();

async function main() {
  try {
    await connectToDatabase();
    await createBot();
    await createWebhookServer();
    startTick();
  } catch (error) {
    console.error('Error starting bot', error);
    const errorString = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'unknown';
    logToAdmin(`Error starting bot: ${errorString}`)
  }
}

async function startTick() {
  const tick = () => {
    updateDailyIdiom()
  }
  tick();

  const tickDelayMs = process.env.NODE_ENV === 'development'
    ? 30_000
    : 10 * 60 * 1000;

  setInterval(tick, tickDelayMs);
}

async function createBot() {
  bot.start(async (ctx) => {
    try {
      console.log('On start', ctx.update);

      if (ctx.update.message.chat.type !== 'group') {
        // TODO
        ctx.reply('Sorry, this bot works only in groups for now.');
        return
      }

      const startUrl = `${miniAppUrl}?startapp=${ctx.update.message.chat.id}`;

      const chat = await ChatModel.findOne({ tg_id: ctx.update.message.chat.id }).populate('players')

      if (!chat) {
        console.error('Chat not found', ctx.update.message.chat.id);
        logToAdmin(`On start: Chat not found: ${ctx.update.message.chat.id}`)
        ctx.reply('Sorry, something went wrong. Please try again later.');
        return;
      }

      const alreadyInGame = chat.players.some(p => p.tg_id === ctx.update.message.from.id);

      if (alreadyInGame) {
        ctx.replyWithHTML(`You are already in the game. <a href="${startUrl}">Play</a>`);
        return;
      }

      chat?.players.push({
        tg_id: ctx.update.message.from.id,
        name: ctx.update.message.from.first_name
      } satisfies Player);

      await chat.save();

      ctx.replyWithHTML(`Great! Now you are in the game. <a href="${startUrl}">Play</a>`)
    } catch (error) {
      console.error('Error handling start', error);
      const errorString = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'unknown';
      logToAdmin(`Start error: ${errorString}`)
    }
  });

  bot.command('next', async (ctx) => {
    updateDailyIdiom(true)
    ctx.reply('Updating daily idiom...');
  })

  bot.command('reset_used', async (ctx) => {
    await IdiomModel.updateMany({}, { is_used: false } satisfies Partial<Idiom>);
    ctx.reply('All idioms have been reset');
  })

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

  bot.catch((error, ctx) => {
      console.error('Error handling update', error);
      const errorString = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'unknown';
      logToAdmin(`Error handling update: ${errorString}`)
  });

  console.log('Bot has been started...');
  bot.launch();
}

async function createWebhookServer() {
  const webhookServer = express();
  webhookServer.use(express.json());

  webhookServer.post('/webhook/notify-admin', async (req, res) => {
    console.info('Received webhook admin message', req.body.message);
    logToAdmin(`Received webhook message: ${JSON.stringify(req.body.message || null)}`);
  });

  webhookServer.listen(webhookPort, () => {
    console.log(`Webhook server running on http://localhost:${webhookPort}`);
  });
}

async function onRemoveFromGroup(ctx: NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>) {
  console.log(`Bot removed from group`, ctx.update);
  logToAdmin(`Bot removed from group: ${ctx.update.my_chat_member.chat.id}`)
  try {
    const chatId = ctx.update.my_chat_member.chat.id;
    const chat = await ChatModel.findOne({ tg_id: chatId });
    if (!chat) {
      console.error('Chat not found', chatId);
      logToAdmin(`Chat not found: ${chatId}`)
      return;
    }
    await ChatModel.deleteOne({ tg_id: chatId });
  } catch (error) {
    console.error('Error handling onRemoveFromGroup', error);
    const errorString = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'unknown';
    logToAdmin(`Error handling onRemoveFromGroup: ${errorString}`)
  }
}

async function onAddToGroup(ctx: NarrowedContext<Context<Update>, Update.MyChatMemberUpdate>) {
  try {
    console.log(`Add user to group`, ctx.update);
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

    const addedToGroupText = `🎉 Hello, everyone! This is a game for learning English idioms.
Every day we guess a new idiom and get points for it. At the end of the week, the winner is announced.
To participate, write /start right in this chat!`

    ctx.replyWithHTML(addedToGroupText);

    logToAdmin(`Added to new group: ${chat.tg_id} - ${chat.name}`)
  } catch (error) {
    console.error('Error handling onAddToGroup', error);
    const errorString = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'unknown';
    logToAdmin(`Error handling onAddToGroup: ${errorString}`)
  }
}
