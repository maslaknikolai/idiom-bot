import { useEffect, useState } from 'react';
import { LoaderFunctionArgs, json } from '@remix-run/node';
import { Form, useLoaderData, useNavigate } from '@remix-run/react';

// hack to make it work
// eslint-disable-next-line
import * as no from 'telegram-webapps'
import invariant from 'tiny-invariant';
import { verifyTelegramWebAppData } from '~/utils/verifyTelegramWebAppData';
import classNames from 'classnames';

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

  const [isClient, setIsClient] = useState(false);

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

    setIsClient(true);
  }, [navigate]);

  return (
    <div className="px-2 py-4">
        <Form>
          <input type="hidden" name="username" value={username} />
          <input type="hidden" name="groupChatId" value={groupChatId || ''} />
          {isClient && (<input type="hidden" name="initData" value={encodeURIComponent(Telegram?.WebApp?.initData)} />)}

          <Game
            isLoading={!username && !error && !groupChatId}
            error={error}
            username={username}
          />
        </Form>
    </div>
  );
}

function Game({
  username,
  error,
  isLoading,
}: {
  username: string
  error: string | null
  isLoading: boolean
}) {
  const [step, setStep] = useState(0);

  return (
    <div>
      {error ? (
        <div>Error: {error}</div>
      ): (
        <>
          <h1 className={classNames(
            'text-2xl font-bold absolute top-0',
            { 'logo': isLoading },
            { 'logo-appear': !isLoading }
          )}>
            <span className="text-sm font-bold bg-black text-[#f17a2d] inline-block px-4 py-1">
              ИДИОМЫ
            </span>
          </h1>

          <div
            className="
              mt-4
            "
          >
            <button
              className={classNames(`
                bg-[#f17a2d] text-white px-4 py-2 mt-2 transition-shadow duration-300
                ease-in-out
                shadow-[1px_1px_0_0_black,2px_2px_0_0_black,3px_3px_0_0_black,4px_4px_0_0_black]
                border-2
                border-black
                active:shadow-[1px_1px_0_0_black,2px_2px_0_0_black]
                active:bg-[#ff7b23]
                transition-opacity
              `, {
                'opacity-0': isLoading,
                'opacity-100': !isLoading,
              })}
              onClick={() => setStep(step + 1)}
              type="button"
            >
              Начать
            </button>
          </div>
        </>
      )}
    </div>
  );
}
