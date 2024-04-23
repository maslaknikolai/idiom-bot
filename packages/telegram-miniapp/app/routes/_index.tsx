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
  })

  return (
    <div>
      Супер Игра

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
