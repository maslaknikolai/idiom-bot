import { LoaderFunctionArgs, json } from '@remix-run/node';
import { IdiomModel, connectToDatabase } from 'shared';
import invariant from 'tiny-invariant';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await connectToDatabase();

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  invariant(botToken, 'TELEGRAM_BOT_TOKEN is required');

  const urlParams = new URL(request.url).searchParams;

  const initDataEncoded = urlParams.get('initData');
  const groupChatId = urlParams.get('groupChatId');

  if (!initDataEncoded || !groupChatId) {
    return json({
      error: 'initData and groupChatId are required',
    }, { status: 400 });
  }

  if (!verifyTelegramWebAppData(initDataEncoded)) {
    console.log('Invalid Telegram WebApp Data', encodeURIComponent(initDataEncoded), 'botToken', botToken, 'groupChatId', groupChatId);

    return json({
      error: 'Invalid Telegram WebApp Data',
    }, { status: 400 });
  }

  const rawChat = await IdiomModel.findOne()

  return json({
    idiom: rawChat ? {
      ...rawChat.toJSON(),
      meaning_options: rawChat.meaning_options.map((option) => option.text),
      usage_options: rawChat.usage_options.map((option) => option.text),
    } : null,
    error: null,
  });
};
