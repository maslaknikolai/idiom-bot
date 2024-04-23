import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"; // or cloudflare/deno
import { json, redirect } from "@remix-run/node"; // or cloudflare/deno
import { Form, useLoaderData } from "@remix-run/react";

import { getSession, commitSession } from "../sessions";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("userId")) {
    // Redirect to the home page if they are already signed in.
    return redirect("/admin");
  }

  const data = { error: session.get("error") };

  return json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const form = await request.formData();
  const username = form.get("username");
  const password = form.get("password");

  if (
    username !== "admin" ||
    password !== "admin"
  ) {
    session.flash("error", "Invalid username/password")

    return redirect("/admin/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  session.set("userId", 'my_id');

  return redirect("/admin", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function Login() {
  const { error } = useLoaderData<typeof loader>();

  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      <Form method="POST">
        <label>
          Username:
          <br />
          <input type="text" name="username" />
        </label>
        <br />
        <label>
          Password:
          <br />
          <input type="password" name="password" />
        </label>
        <br />
        <br />
        <button>
            Submit
        </button>
      </Form>
    </div>
  );
}
