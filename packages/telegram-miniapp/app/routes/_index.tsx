import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  fetch(`http://localhost:${process.env.BOT_WEBHOOK_PORT}/webhook/message`)
    .catch(() => {})

  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams);

  return json({queryParams})
};


export default function Index() {
  const { queryParams } = useLoaderData<typeof loader>();

  const [someshit, setSomeshit] = useState('')
  useEffect(() => {
    if (window) {
      // eslint-disable-next-line
      // @ts-ignore
      setSomeshit(window.Telegram.WebApp.initData)
    }
  })

  return (
    <div>
      <pre>
        {JSON.stringify(queryParams, null, 2)}
      </pre>

      {someshit}
      Супер Игра
    </div>
  );
}
