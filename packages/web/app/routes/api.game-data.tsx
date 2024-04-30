import { LoaderFunctionArgs, json } from '@remix-run/node';
import { ChatModel, connectToDatabase } from 'shared';
import { getCurrentIdiom } from '~/utils/getCurrentIdiom';
import { sendToAdminTelegram } from '~/utils/sendToAdminTelegram';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';


export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await connectToDatabase();

    const urlParams = new URL(request.url).searchParams;
    const initDataEncoded = urlParams.get('initData');
    const groupChatId = urlParams.get('groupChatId');

    if (!initDataEncoded || !groupChatId) {
      return handleError('initData and groupChatId are required', {initDataEncoded, groupChatId}, 400);
    }

    if (!verifyTelegramWebAppData(initDataEncoded)) {
      return handleError('Invalid Telegram WebApp Data', {initDataEncoded}, 400);
    }

    const chat = await ChatModel.findOne({ tg_id: groupChatId }).populate('players');
    if (!chat) {
      return handleError('Chat not found', {groupChatId}, 404);
    }

    const user = JSON.parse(new URLSearchParams(initDataEncoded).get('user') || '{}');
    const userInGame = chat.players.find((player) => player.tg_id === user.id);

    if (!userInGame) {
      return handleError('Cannot find user in game. Please send /start command in the group chat', {user, groupChatId, chatPlayers: chat.players}, 404);
    }

    const rawIdiom = await getCurrentIdiom();

    if (!rawIdiom) {
      return handleError('No idiom found', null, 404);
    }

    const idiom = rawIdiom ? {
        ...rawIdiom.toJSON(),
        meaning_options: rawIdiom.meaning_options.map((option) => option.text),
        usage_options: rawIdiom.usage_options.map((option) => option.text),
    } : null;

    return json({ idiom });
  } catch (error) {
    return handleError('Unhandled error', error, 500);
  }

  async function handleError(context: string, errorDetails: any, statusCode: number) {
    console.error(`api/game-data: ${context}`, errorDetails);
    sendToAdminTelegram(`api/game-data: ${context}: ${JSON.stringify(errorDetails)}`);
    return json({ error: `${context}` }, { status: statusCode });
  }
};
