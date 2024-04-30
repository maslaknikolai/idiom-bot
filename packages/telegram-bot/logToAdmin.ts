import { bot } from ".";

const adminChatId = process.env.ADMIN_TELEGRAM_ID;

export async function logToAdmin(text: string) {
  if (!adminChatId) {
    console.error('Admin chat ID is not defined');
    return;
  }

  await bot.telegram.sendMessage(adminChatId, text);
}