import { ActionFunctionArgs, json } from '@remix-run/node';
import { connectToDatabase } from 'shared';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';

export const action = async ({
  params,
  request,
}: ActionFunctionArgs) => {
  await connectToDatabase();

  const urlParams = new URL(request.url).searchParams;

  const initDataEncoded = urlParams.get('initData');
  const groupChatId = urlParams.get('groupChatId');

  if (!initDataEncoded || !groupChatId) {
    return json({
      error: 'initData and groupChatId are required',
    }, { status: 400 });
  }

  if (!verifyTelegramWebAppData(initDataEncoded)) {
    return json({
      error: 'Invalid Telegram WebApp Data',
    }, { status: 400 });
  }

  console.log(params);


};