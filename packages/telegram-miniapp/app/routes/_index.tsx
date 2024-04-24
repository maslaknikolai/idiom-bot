import { useEffect } from 'react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { useLoaderData, useNavigate } from '@remix-run/react';


// hack to make it work
// eslint-disable-next-line
import * as no from 'telegram-webapps'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const urlParams = new URL(request.url).searchParams;
  const initDataEncoded = urlParams.get('initData');
  const groupChatId = urlParams.get('groupChatId');

  if (!initDataEncoded || !groupChatId) {
    return json({
      error: null,
      username: null,
      groupChatId: null
    }, { status: 400 });
  }

  const initData = decodeURIComponent(initDataEncoded);

  return json({
    error: null,
    username: initData,
    groupChatId
  })

  // // Parse and validate the initData if necessary
  // try {
  //   const initDataObj = JSON.parse(initData);
  //   const userId = initDataObj.user?.id;
  //   const groupChatId = initDataObj.chat?.id;
  //   const botToken = process.env.TELEGRAM_BOT_TOKEN;

  //   if (!userId || !groupChatId) {
  //     return json({ error: 'User ID and Chat ID are required from initData', username: null }, { status: 400 });
  //   }

  //   const apiUrl = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${groupChatId}&user_id=${userId}`;
  //   const response = await fetch(apiUrl);
  //   const data = await response.json();
  //   if (data.ok && data.result) {
  //     return json({ username: data.result.user.username, error: null });
  //   }
  //   return json({ error: 'No username found', username: null });

  // } catch (error) {
  //   return json({ error: 'Failed to parse or fetch data from Telegram API', username: null}, { status: 500 });
  // }
};

export default function Index() {
  const { username, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // First time user
  useEffect(() => {
    if (Telegram?.WebApp?.initData && Telegram.WebApp.initDataUnsafe.start_param) {
      navigate(`/?initData=${Telegram?.WebApp?.initData}&groupChatId=${Telegram.WebApp.initDataUnsafe.start_param}`);
    }

    // For development purposes
    if (window) {
      // eslint-disable-next-line
      // @ts-ignore
      window.devInit = (initData: string, groupChatId:  string) => {
        navigate(`/?initData=${initData}&groupChatId=${groupChatId}`);
      }
    }
  }, [navigate]);


  return (
    <div>
      <h1 className="text-3xl font-bold">Супер Игра</h1>
      <br />

      {!username && !error && (
        <div>Loading...</div>
      )}

      {error && (
        <div>Error: {error}</div>
      )}

      {username && (
        <div>
          <div>Username: {username}</div>
        </div>
      )}
    </div>
  );
}
