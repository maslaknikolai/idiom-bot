import {
  Form,
  Link,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import appStylesHref from "../app.css?url";
import { useEffect, useState } from "react";
import { getSession } from "../sessions";
import { connectToDatabase, ChatModel } from "shared";

import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await connectToDatabase();
  const rawChats = await ChatModel.find();

  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  const session = await getSession(request.headers.get("Cookie"));
  const userName = session.get("userId") ? "Admin" : "Guest";

  const chats = rawChats.map((it) => ({
    id: it.id,
    name: it.name,
  }));

  return json({
    q,
    chats,
    userName,
  });
};

export default function App() {
  const navigation = useNavigation();
  const { q, userName, chats } = useLoaderData<typeof loader>();
  const submit = useSubmit();

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  // the query now needs to be kept in state
  const [query, setQuery] = useState(q || "");

  useEffect(() => {
    setQuery(q || "");
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <Scripts />
      </head>
      <body>
        <div id="sidebar">
          <div>
            {userName}
            {userName === "Guest" ? (
              <Link to="/admin/login">Login</Link>
            ) : (
              <Form method="post" action="/logout">
                <button type="submit">Logout</button>
              </Form>
            )}
          </div>
          <div>
            <Form
              id="search-form"
              role="search"
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
            >
              <input
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                id="q"
                className={searching ? "loading" : ""}
                aria-label="Search chats"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Link to="/chats/create">
              <button type="button">New</button>
            </Link>
          </div>
          <nav>
            {chats.length ? (
              <ul>
                {chats.map((chat) => (
                  <li key={chat.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`chats/${chat.id}`}
                    >
                      {chat.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No chats</i>
              </p>
            )}
          </nav>
        </div>

        <div
          id="detail"
          className={
            navigation.state === "loading" && !searching ? "loading" : ""
          }
        >
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
