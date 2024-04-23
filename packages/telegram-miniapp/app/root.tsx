import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
``      <script src="https://telegram.org/js/telegram-web-app.js"></script>
        <Meta />
        <Links />
        <Scripts />
      </head>

      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
