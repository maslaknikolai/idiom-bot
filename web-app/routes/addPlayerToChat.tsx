import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({
    request,
    params
}: LoaderFunctionArgs) => {
    const chatId = params;
    console.log(chatId);

    return json({
        chatId
    })
}

export default function AddPlayerToChat() {
    const {chatId} = useLoaderData<typeof loader>();
    return (
        <div>
            {chatId}
            AddPlayerToChat
        </div>
    );
}