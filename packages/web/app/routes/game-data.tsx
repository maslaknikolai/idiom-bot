import { LoaderFunctionArgs, json } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';

export const loader = async ({ request }: LoaderFunctionArgs) => {
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
    console.log('Invalid Telegram WebApp Data', initDataEncoded, 'botToken', botToken, 'groupChatId', groupChatId);

    return json({
      error: 'Invalid Telegram WebApp Data',
    }, { status: 400 });
  }

  return json({
    idiom: {
      id: 1,
      title: 'A penny for your thoughts',
      imageUrl: 'https://maslaknikolai.github.io/idiom-bot/crying_over_spilled_milk.jpg',
    },
    error: null,
  });
};
