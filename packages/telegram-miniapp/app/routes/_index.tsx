import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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

  return (
    <div>
      <pre>
        {JSON.stringify(queryParams, null, 2)}
      </pre>
      Супер Игра
    </div>
  );
}
