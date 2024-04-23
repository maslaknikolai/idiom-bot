import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import { connectToDatabase } from '../mongooseDB';
dotenv.config();


(async () => {
  connectToDatabase();
  const token = process.env.TELEGRAM_BOT_TOKEN || '';

  const bot = new TelegramBot(token, { polling: true });

  bot.on('message', (msg) => {
    console.log(msg);

    const chatId = msg.chat.id;

    if (msg.text === '/start') {
      bot.sendMessage(chatId, "Welcome! I am your friendly bot. How can I assist you today?");
    } else {
      bot.sendMessage(chatId, `You said: ${msg.text}`);
    }
  });

  bot.on('my_chat_member', (msg) => {
    console.log(msg);

    fs.writeFileSync('my_chat_member.log', JSON.stringify(msg))

    const chatId = msg.chat.id;
    if (msg.new_chat_member.status === 'member') {
      console.log(`Added to group: ${chatId}`);
      bot.sendMessage(chatId, "Hello everyone! I'm here to help.");
    } else if (msg.new_chat_member.status === 'left') {
      console.log(`Removed from group: ${chatId}`);
    }
  });

  bot.on('polling_error', (error) => {
    console.log('Polling error', error);
  });

  console.log('Bot has been started...');
})()
