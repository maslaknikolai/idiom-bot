import { useEffect, useState } from "react";

// hack to make it work
// eslint-disable-next-line
import * as no from 'telegram-webapps'

export default function Index() {
  const [someshit, setSomeshit] = useState<Record<string, unknown>>({})

  useEffect(() => {
    if (window) {
      const raw = Telegram.WebApp.initData;
      const split = raw.split('&')
      const data = split.reduce((acc: Record<string, string>, item: string) => {
        const [key, value] = item.split('=')
        acc[key] = value
        return acc
      }, {})

      data.user = JSON.parse(data.user ? decodeURIComponent(data.user) : '{}')

      setSomeshit(data)
    }
  })

  return (
    <div>
      <pre>
        {JSON.stringify(someshit, null, 2)}
      </pre>

      Супер Игра
    </div>
  );
}
