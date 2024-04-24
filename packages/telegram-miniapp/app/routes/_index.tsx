import { useEffect, useState } from "react";

// hack to make it work
// eslint-disable-next-line
import * as no from 'telegram-webapps'

export default function Index() {
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [groupChatId, setGroupChatId] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (window) {
      setUserId(Telegram.WebApp.initDataUnsafe.user?.id)
      setGroupChatId(
        Telegram.WebApp.initDataUnsafe.start_param
          ? Number(Telegram.WebApp.initDataUnsafe.start_param)
          : undefined
      )
    }

    // eslint-disable-next-line
    // @ts-ignore
    window.huj = (
      // eslint-disable-next-line
      v: {a?: any, b?: any}
    ) => {
      if ('a' in v) setUserId(v.a)
      if ('b' in v) setGroupChatId(v.b)
    }
  })

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Супер Игра
      </h1>

      <br />

      {!userId || !groupChatId ? (
        <div>Для начала игры перейдите в чат с ботом</div>
      ) : (
        <div>
          <div>Ваш ID: {userId}</div>
          <div>Группа: {groupChatId}</div>
        </div>
      )}
    </div>
  );
}
