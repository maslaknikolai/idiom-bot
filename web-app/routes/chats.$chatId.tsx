import { Form, json, useLoaderData } from "@remix-run/react";

import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { requireAuthentication } from "../utils/auth";
import { ChatModel } from "models/chat";


export const loader = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  // const r = await requireAuthentication(request);
  // if (r) {
  //   return r;
  // }
  invariant(params.chatId, "Missing chatId param");
  const rawChat = await ChatModel.findOne({ id: params.chatId })
  console.log(rawChat);

  if (!rawChat) {
    throw new Response("Not Found", { status: 404 });
  }

  const chat = {
    id: rawChat.id,
    name: rawChat.name,
    players: rawChat.players.map(it => ({
      id: it.id,
      name: it.name,
    })),
  }

  return json({ chat });
};

export const action = async ({
  params,
  // request,
}: ActionFunctionArgs) => {
  invariant(params.chatId, "Missing chatId param");
  // const formData = await request.formData();
  // return updateContact(params.chatId, {
  //   favorite: formData.get("favorite") === "true",
  // });
};

export default function Chat() {
  const { chat } = useLoaderData<typeof loader>();

  return (
    <div id="chat">
      <div>
        <h1>
          {chat.name}
        </h1>

        <div>
          {chat.players.map(player => (
            <div key={player.id}>
              {player.name}
            </div>
          ))}

          {/* <Form action="edit">
            <button type="submit">Edit</button>
          </Form> */}

          <Form
            action="./destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}