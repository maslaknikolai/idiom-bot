import { useEffect } from 'react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';

// hack to make it work
// eslint-disable-next-line
import * as no from 'telegram-webapps'
import invariant from 'tiny-invariant';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  invariant(botToken, 'TELEGRAM_BOT_TOKEN is required');

  const urlParams = new URL(request.url).searchParams;
  const initDataEncoded = urlParams.get('initData');
  const groupChatId = urlParams.get('groupChatId');

  // First time page loads by Telegram without any params
  if (!initDataEncoded || !groupChatId) {
    return json({
      error: null,
      username: null,
      groupChatId: null
    }, { status: 400 });
  }

  if (!verifyTelegramWebAppData(initDataEncoded)) {
    console.log('Invalid Telegram WebApp Data', initDataEncoded, 'botToken', botToken, 'groupChatId', groupChatId);

    return json({
      error: 'Invalid Telegram WebApp Data',
      username: null,
      groupChatId: null
    }, { status: 400 });
  }

  try {
    const initData = new URLSearchParams(initDataEncoded);

    const user = JSON.parse(decodeURIComponent(initData.get('user') || 'null'));
    const userId = user?.id;

    const apiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${groupChatId}&user_id=${userId}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    return json({
      error: null,
      username: data?.result?.user?.first_name || 'Name not found',
      groupChatId
    })

  } catch (error) {
    const message = (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    )
      ? error.message
      : 'Unknown error';

    return json({
      error: message,
      username: null,
      groupChatId: null
    }, { status: 500 });
  }
};

export default function Index() {
  const { username, error, groupChatId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  useEffect(() => {
    if (Telegram?.WebApp?.initData && Telegram.WebApp.initDataUnsafe.start_param) {
      navigate(`/?initData=${encodeURIComponent(Telegram?.WebApp?.initData)}&groupChatId=${Telegram.WebApp.initDataUnsafe.start_param}`);
    }

    // For development purposes
    if (window) {
      // eslint-disable-next-line
      // @ts-ignore
      window.devInit = (initData: string, newGroupChatId:  string) => {
        navigate(`/?initData=${encodeURIComponent(initData)}&groupChatId=${newGroupChatId}`);
      }
    }
  }, [navigate]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Супер Игра</h1>
      <br />

      {!username && !error && !groupChatId && (
        <div>Loading...</div>
      )}

      {error && (
        <div>Error: {error}</div>
      )}

      {username && groupChatId && (
        <div>
          <div>Username: {username}</div>
        </div>
      )}
    </div>
  );
}
