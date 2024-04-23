import { useEffect, useState } from "react";

export default function Index() {
  // eslint-disable-next-line
  const [someshit, setSomeshit] = useState<any>({})
  useEffect(() => {
    if (window) {
      // eslint-disable-next-line
      // @ts-ignore
      const raw = window.Telegram.WebApp.initData;
      const split = raw.split('&')
      // eslint-disable-next-line
      const data = split.reduce((acc: any, item: string) => {
        const [key, value] = item.split('=')
        acc[key] = value
        return acc
      }, {})

      data.user = JSON.parse(data.user || '{}')

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
