import { ActionFunctionArgs, json } from '@remix-run/node';
import { ChatModel, connectToDatabase } from 'shared';
import invariant from 'tiny-invariant';
import { getCurrentIdiom } from '~/utils/getCurrentIdiom';
import { sendToAdminTelegram } from '~/utils/sendToAdminTelegram';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';

// TODO: Save the answers
// TODO: Check that the answers don't already exist
export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    await connectToDatabase();

    const requestJson = await request.json();
    const numberMeaningGuessIndex = Number(requestJson.meaningGuessIndex);
    const numberUsageGuessIndex = Number(requestJson.usageGuessIndex);

    invariant(!isNaN(numberMeaningGuessIndex), "`meaningGuessIndex` must be a number");
    invariant(!isNaN(numberUsageGuessIndex), "`usageGuessIndex` must be a number");

    const urlParams = new URL(request.url).searchParams;
    const initDataEncoded = urlParams.get('initData');
    const groupChatId = urlParams.get('groupChatId');

    if (!initDataEncoded || !groupChatId) {
      return handleError('initData and groupChatId are required', { initDataEncoded, groupChatId }, 400);
    }

    if (!verifyTelegramWebAppData(initDataEncoded)) {
      return handleError('Invalid Telegram WebApp Data', { initDataEncoded }, 400);
    }

    const chat = await ChatModel.findOne({ tg_id: groupChatId });
    if (!chat) {
      return handleError('Chat not found', { groupChatId }, 404);
    }

    const user = JSON.parse(new URLSearchParams(initDataEncoded).get('user') || '{}');
    const userInChat = chat.players.find((player) => player.tg_id === user.id);

    if (!userInChat) {
      return handleError('User not found in chat', {user, groupChatId, chatPlayers: chat.players}, 404);
    }

    const idiom = await getCurrentIdiom();

    if (!idiom) {
      return handleError('No idiom found', null, 404);
    }

    // chat.games.push({
    //   idiom,
    //   meaningGuessIndex: numberMeaningGuessIndex,
    //   usageGuessIndex: numberUsageGuessIndex,
    // });

    const correctMeaning = idiom.meaning_options.find((option) => option.is_correct)?.text;

    return json({ correctMeaning });
  } catch (error) {
    return handleError('Unhandled error', error, 500);
  }

  async function handleError(context: string, errorDetails: any, statusCode: number) {
    console.error(`api/trade-guesses-to-meaning: ${context}`, errorDetails);
    sendToAdminTelegram(`api/trade-guesses-to-meaning: ${context}: ${JSON.stringify(errorDetails)}`);
    return json({ error: `api/trade-guesses-to-meaning: ${context}` }, { status: statusCode });
  }
};
